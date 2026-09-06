# Lab 1 — Peer Review Record

**Author:** Supattra Kongsiripat — 67070505228 — GitHub: @supa-gif173
**Peer reviewer:** Ploychanok Imsuwan  — 67070505205 — GitHub: @ploychanokimsu-lgtm
**Peer reviewer:** PIMCHAYA SUPRATERAVANIT  — 67070505223 — GitHub: @ploychanokimsu-lgtm

## Pull Requests I authored (reviewed by my partner)
| PR | Branch | Reviewer verdict |
|----|--------|------------------|
| #6 | feature/1-project-foundation | Approved |
| #7 | feature/2-health-check | Approved |
| #8 | feature/3-category-seed | Approved |
| #9 | feature/4-category-list | Approved |

Reviewer comment I received: 
- PR #6: "LGTM! All acceptance criteria have been satisfied: Code implementation, database setup, API endpoints, and automated tests are properly configured and pass all test suites. Target branch is correctly set to lab1-staging. Approved!"
- PR #7: "All acceptance criteria have been satisfied: GET /api/categories endpoint, PostgreSQL integration via Prisma, React UI category rendering, automated test suites, and target branch lab1-staging are verified. Approved!"
- PR #8: "Looks great! All the required acceptance criteria have been successfully implemented. The tests are passing with flying colors, and the PR is correctly targeted to lab1-staging. Great job—Approved!"
- PR #9: "Backend & Database: Express REST API endpoints and Prisma ORM PostgreSQL schema are correctly implemented.
Frontend: React components dynamically render the system status and categories using Bootstrap.
Automated Tests: Supertest and Vitest test suites pass successfully.
Git Flow: Target branch is correctly set to lab1-staging.
Approved!"

How I responded: 
- PR #6 & #9: "Thank you for the review and approval!"
- PR #7: "Thank you for the detailed review and approval!"
- PR #8: "Thank you for the thorough review and for approving this PR."

## Pull Requests I reviewed for my partner
My comment: 
- PR #7: "All acceptance criteria have been satisfied: GET /api/health endpoint returns HTTP 200 with the correct JSON, frontend fetch implementation with proper error handling, React UI state rendering for Online and Offline statuses, and test suites are verified. Approved!"
- PR #8: "All acceptance criteria have been satisfied: The Prisma Category model and migrations are correctly configured. The seed script properly utilizes upsert to insert the four required categories safely without creating duplicates. Approved!"
- PR #9: "Code Review Approved. Great job on implementing Issue 4. The logic is solid and follows all the acceptance criteria perfectly.
For the backend, the GET /api/categories route is implemented excellently. Using orderBy id asc ensures predictable sorting, and the error handling correctly returns a secure 500 status without leaking internal server details.
For the frontend, the data fetching logic in api.ts handles API responses well. The React rendering in App.tsx correctly utilizes the category id as a key in the mapped list.
For testing, the frontend tests using vi.spyOn to mock checkSystem are very comprehensive. Testing both the Online and Offline states guarantees UI reliability.
The code is clean, readable, and ready to be merged. LGTM."

Partner's response: 
- PR #8: "Thank you for reviewing. I will verify all the stages before merging."