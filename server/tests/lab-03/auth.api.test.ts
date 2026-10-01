import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { getPrisma } from '../../src/prisma';
import bcrypt from 'bcrypt';

describe('Authentication API (Sprint 3)', () => {
  let activeUserId: string;
  let inactiveUserId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    
    const active = await getPrisma().user.create({
      data: {
        name: 'Test Active',
        email: 'active@test.com',
        role: 'REQUESTER',
        passwordHash,
        isActive: true,
        mustChangePassword: true
      }
    });
    activeUserId = active.id;

    const inactive = await getPrisma().user.create({
      data: {
        name: 'Test Inactive',
        email: 'inactive@test.com',
        role: 'REQUESTER',
        passwordHash,
        isActive: false,
        mustChangePassword: true
      }
    });
    inactiveUserId = inactive.id;
  });

  afterAll(async () => {
    await getPrisma().user.deleteMany({
      where: { id: { in: [activeUserId, inactiveUserId] } }
    });
  });

  it('API-01: Valid login returns user data and cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'active@test.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBeUndefined(); // Should not leak email/passwordHash
    expect(res.body.user.name).toBe('Test Active');
    
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('token=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('API-02: Invalid login credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'active@test.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('API-03: Login as inactive user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inactive@test.com', password: 'Password123!' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Account is inactive');
  });

  it('Logout clears cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('token=; Path=/; Expires=Thu, 01 Jan 1970');
  });
});
