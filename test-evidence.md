# Test Evidence

## Server Tests
```
> toktickit-server@1.0.0 test
> vitest run

 RUN  v2.1.9 C:/Users/Lenovo/toktickit/server

 ✓ tests/lab-01/health.test.ts (1 test) 91ms
 ✓ tests/lab-01/categories.test.ts (1 test) 267ms
 ✓ tests/lab-03/auth.api.test.ts (4 tests) 635ms
 ✓ tests/lab-03/requester-tickets.api.test.ts (1 test) 707ms
 ✓ tests/lab-03/staff-queue.api.test.ts (3 tests) 902ms
 ✓ tests/lab-03/staff-ticket-detail.api.test.ts (9 tests) 1007ms

 Test Files  6 passed (6)
      Tests  19 passed (19)
   Start at  16:07:00
   Duration  13.25s (transform 1.08s, setup 0ms, collect 64.85s, tests 3.61s, environment 1ms, prepare 5.21s)
```

## Client Tests
```
> toktickit-client@1.0.0 test
> vitest run

 RUN  v2.1.9 C:/Users/Lenovo/toktickit/client

 ✓ tests/lab-03/ChangePassword.test.tsx (1 test) 136ms
 ✓ tests/lab-03/Login.test.tsx (2 tests) 132ms
 ↓ tests/lab-01/App.test.tsx (3 tests | 3 skipped)
 ✓ tests/lab-02/App.test.tsx (2 tests) 106ms
 ✓ tests/lab-03/StaffTicketQueue.test.tsx (2 tests) 211ms

 Test Files  4 passed | 1 skipped (5)
      Tests  7 passed | 3 skipped (10)
   Start at  16:07:13
   Duration  29.54s (transform 788ms, setup 25.21s, collect 14.77s, tests 585ms, environment 101.99s, prepare 2.40s)
```
