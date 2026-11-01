import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '../client/node_modules/playwright/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getBase64Image(relPath) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) return '';
  const buffer = fs.readFileSync(fullPath);
  const ext = path.extname(fullPath).slice(1) || 'png';
  return `data:image/${ext};base64,${buffer.toString('base64')}`;
}

async function buildReport() {
  console.log('Compiling Lab 4 17-Page Submission Report...');

  // Read documentation and artifact files
  const specText = fs.readFileSync(path.join(rootDir, 'docs/lab-04/specification.md'), 'utf8');
  const testsText = fs.readFileSync(path.join(rootDir, 'docs/lab-04/tests.md'), 'utf8');
  const reviewerText = fs.readFileSync(path.join(rootDir, 'docs/lab-04/reviewer.md'), 'utf8');
  const aiUseText = fs.readFileSync(path.join(rootDir, 'docs/lab-04/ai-use.md'), 'utf8');
  const uiSpecText = fs.readFileSync(path.join(rootDir, 'docs/lab-04/ui-spec.md'), 'utf8');
  const apiSpecText = fs.readFileSync(path.join(rootDir, 'docs/lab-04/api-spec.md'), 'utf8');
  const metricsVsDbText = fs.readFileSync(path.join(rootDir, 'artifacts/lab-04/metrics-vs-db.txt'), 'utf8');
  const serverVitestText = fs.readFileSync(path.join(rootDir, 'artifacts/lab-04/test-output/server-vitest.txt'), 'utf8');
  const clientVitestText = fs.readFileSync(path.join(rootDir, 'artifacts/lab-04/test-output/client-vitest.txt'), 'utf8');
  const playwrightE2EText = fs.readFileSync(path.join(rootDir, 'artifacts/lab-04/test-output/playwright-e2e.txt'), 'utf8');
  const appendOnlyText = fs.readFileSync(path.join(rootDir, 'artifacts/lab-04/test-output/append-only-proof.txt'), 'utf8');

  // Load screenshots as base64 data URIs
  const imgStaffDesktop = getBase64Image('artifacts/lab-04/screenshots/staff-dashboard/01-staff-dashboard-desktop.png');
  const imgStaffTablet = getBase64Image('artifacts/lab-04/screenshots/staff-dashboard/02-staff-dashboard-tablet.png');
  const imgStaffMobile = getBase64Image('artifacts/lab-04/screenshots/staff-dashboard/03-staff-dashboard-mobile.png');
  const imgStaffPriority = getBase64Image('artifacts/lab-04/screenshots/staff-dashboard/04-staff-dashboard-priority-breakdown.png');
  const imgStaffRecent = getBase64Image('artifacts/lab-04/screenshots/staff-dashboard/05-staff-dashboard-recent-queue.png');
  const imgAdminStats = getBase64Image('artifacts/lab-04/screenshots/staff-dashboard/06-admin-dashboard-users.png');
  const imgDrillUnassigned = getBase64Image('artifacts/lab-04/screenshots/staff-dashboard/07-dashboard-drilldown-unassigned.png');
  const imgDrillUrgent = getBase64Image('artifacts/lab-04/screenshots/staff-dashboard/08-dashboard-drilldown-urgent.png');

  const imgReqDesktop = getBase64Image('artifacts/lab-04/screenshots/requester-dashboard/01-requester-dashboard-desktop.png');
  const imgReqTablet = getBase64Image('artifacts/lab-04/screenshots/requester-dashboard/02-requester-dashboard-tablet.png');
  const imgReqMobile = getBase64Image('artifacts/lab-04/screenshots/requester-dashboard/03-requester-dashboard-mobile.png');
  const imgReqQuick = getBase64Image('artifacts/lab-04/screenshots/requester-dashboard/04-requester-quick-actions.png');
  const imgReqRecent = getBase64Image('artifacts/lab-04/screenshots/requester-dashboard/05-requester-recent-tickets.png');
  const imgReqDrillOpen = getBase64Image('artifacts/lab-04/screenshots/requester-dashboard/06-requester-drilldown-open.png');
  const imgReqDrillWaiting = getBase64Image('artifacts/lab-04/screenshots/requester-dashboard/07-requester-drilldown-waiting.png');

  const imgActTable = getBase64Image('artifacts/lab-04/screenshots/actions-taken/01-actions-taken-table-desktop.png');
  const imgActCreate = getBase64Image('artifacts/lab-04/screenshots/actions-taken/02-create-action-modal.png');
  const imgActError = getBase64Image('artifacts/lab-04/screenshots/actions-taken/03-create-action-validation-error.png');
  const imgActAssignee = getBase64Image('artifacts/lab-04/screenshots/actions-taken/04-action-assignee-dropdown.png');
  const imgActEdit = getBase64Image('artifacts/lab-04/screenshots/actions-taken/05-edit-action-modal.png');
  const imgActLocked = getBase64Image('artifacts/lab-04/screenshots/actions-taken/06-completed-action-terminal-lock.png');
  const imgGateChecklist = getBase64Image('artifacts/lab-04/screenshots/actions-taken/07-resolution-gate-checklist.png');
  const imgGateBlocked = getBase64Image('artifacts/lab-04/screenshots/actions-taken/08-resolution-gate-blocked.png');
  const imgGateSuccess = getBase64Image('artifacts/lab-04/screenshots/actions-taken/09-resolution-gate-success.png');
  const imgOccConflict = getBase64Image('artifacts/lab-04/screenshots/actions-taken/10-concurrency-409-conflict-banner.png');
  const imgHistoryTimeline = getBase64Image('artifacts/lab-04/screenshots/actions-taken/11-ticket-status-history-timeline.png');
  const imgReqReadonly = getBase64Image('artifacts/lab-04/screenshots/actions-taken/12-requester-actions-readonly.png');
  const imgAdvisoryToggle = getBase64Image('artifacts/lab-04/screenshots/actions-taken/13-requester-advisory-resolved-toggle.png');
  const imgActTablet = getBase64Image('artifacts/lab-04/screenshots/actions-taken/14-actions-taken-tablet.png');
  const imgActMobile = getBase64Image('artifacts/lab-04/screenshots/actions-taken/15-actions-taken-mobile.png');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>KMUTT CPE 334 Lab 4 Report - Supattra Kongsiripat (67070505228)</title>
<style>
  @page {
    size: A4;
    margin: 12mm 12mm 14mm 12mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1f2937;
    line-height: 1.45;
    font-size: 8.5pt;
    background: #fff;
    margin: 0;
    padding: 0;
  }
  .page {
    page-break-after: always;
    min-height: 100%;
    position: relative;
  }
  .page:last-child {
    page-break-after: avoid;
  }
  h1, h2, h3, h4 {
    color: #006B3C;
    margin-top: 0.8em;
    margin-bottom: 0.3em;
    font-weight: 700;
  }
  h1 {
    font-size: 14pt;
    border-bottom: 2px solid #006B3C;
    padding-bottom: 4px;
    margin-top: 0;
  }
  h2 {
    font-size: 11pt;
    border-bottom: 1px solid #EAF6EF;
    padding-bottom: 3px;
    margin-top: 1em;
  }
  h3 { font-size: 9.5pt; margin-top: 0.6em; }
  .cover-card {
    background: #F0FDF4;
    border: 2px solid #006B3C;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 8px;
  }
  .cover-title {
    font-size: 15pt;
    font-weight: 800;
    color: #006B3C;
    margin: 0 0 2px 0;
  }
  .cover-subtitle {
    font-size: 9.5pt;
    color: #0B7A46;
    margin: 0 0 6px 0;
    font-weight: 600;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    font-size: 7.5pt;
  }
  .meta-item {
    background: #ffffff;
    border: 1px solid #D1FAE5;
    padding: 4px 8px;
    border-radius: 4px;
  }
  .meta-label {
    font-weight: 700;
    color: #006B3C;
    display: block;
    margin-bottom: 2px;
  }
  .badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 7.5pt;
    font-weight: 600;
  }
  .badge-success { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
  .badge-info { background: #E0F2FE; color: #075985; border: 1px solid #BAE6FD; }
  .badge-warning { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
  .badge-danger { background: #FEE2E2; color: #991B1B; border: 1px solid #FECACA; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 10px 0;
    font-size: 8pt;
  }
  th, td {
    border: 1px solid #E5E7EB;
    padding: 4px 6px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: #F0FDF4;
    color: #006B3C;
    font-weight: 700;
  }
  pre, code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 7.5pt;
  }
  pre {
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    padding: 6px;
    border-radius: 4px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 4px 0 8px 0;
  }
  .img-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 6px 0;
  }
  .img-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin: 6px 0;
  }
  .img-container {
    border: 1px solid #D1D5DB;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .img-container img {
    width: 100%;
    max-height: 210px;
    object-fit: contain;
    display: block;
  }
  .img-caption {
    font-size: 7pt;
    font-weight: 600;
    color: #4B5563;
    padding: 3px 6px;
    background: #F3F4F6;
    border-top: 1px solid #E5E7EB;
  }
  .alert-box {
    padding: 6px 10px;
    border-radius: 4px;
    margin: 6px 0;
    font-size: 8pt;
    border-left: 3px solid;
  }
  .alert-success { background: #F0FDF4; border-color: #006B3C; color: #166534; }
  .alert-info { background: #F0F9FF; border-color: #0284C7; color: #0369A1; }
  .alert-warning { background: #FFFBEB; border-color: #D97706; color: #92400E; }
  a { color: #006B3C; text-decoration: none; font-weight: 600; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>

<!-- PAGE 1: TITLE & COVER -->
<div class="page">
  <div class="cover-card">
    <div class="cover-title">CPE 334 Software Engineering: Lab 4 Final Report</div>
    <div class="cover-subtitle">Actions Taken, Complete Ticket Lifecycle, Role Dashboards, and Staged Release</div>
    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Author / Student:</span>
        Supattra Kongsiripat (Student ID: 67070505228)<br>
        GitHub: <a href="https://github.com/supa-gif173">@supa-gif173</a> | KMUTT Sections 1/2026
      </div>
      <div class="meta-item">
        <span class="meta-label">Collaborator / Peer Reviewer:</span>
        Pimchaya Suprateravanit (Student ID: 67070505223)<br>
        GitHub: <a href="https://github.com/pimchayasupr-hash">@pimchayasupr-hash</a>
      </div>
      <div class="meta-item">
        <span class="meta-label">GitHub Repository & Release:</span>
        <a href="https://github.com/supa-gif173/toktickit">supa-gif173/toktickit</a><br>
        Release: <code>lab4-staging</code> &rarr; <code>main</code> (PR #50, Resolves #49)
      </div>
      <div class="meta-item">
        <span class="meta-label">Total Automated Test Verification:</span>
        <span class="badge badge-success">102 Tests Passing (100%)</span><br>
        Server: 68/68 | Client: 29/29 (incl. Axe-core A11y) | Playwright E2E: 5/5
      </div>
    </div>
  </div>

  <h1>Answer Part 1: Git Use with Engineering Workflow</h1>
  <p>Sprint 4 strictly followed course engineering standards utilizing Kanban issues, feature branches, pull requests, bidirectional peer reviews with blocking gates, and staged integration from <code>lab4-staging</code> into <code>main</code>.</p>

  <h3>Sprint 4 Pull Requests & Traceability Summary</h3>
  <table>
    <thead>
      <tr>
        <th>PR #</th>
        <th>Title & Scope</th>
        <th>Feature Branch</th>
        <th>Status & Reviewer Verdict</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>#38</td>
        <td>docs(spec): Sprint 4 Engineering Contract and Specifications (Resolves #37)</td>
        <td><code>feature/issue-37-specs</code></td>
        <td><span class="badge badge-success">Approved & Merged</span> (@pimchayasupr-hash)</td>
      </tr>
      <tr>
        <td>#40</td>
        <td>feat(actions): Actions Taken foundation, Prisma migration, seed, APIs, and tests (Resolves #39)</td>
        <td><code>feature/issue-39-actions-foundation</code></td>
        <td><span class="badge badge-success">Approved & Merged</span> (@pimchayasupr-hash)</td>
      </tr>
      <tr>
        <td>#42</td>
        <td>feat(ui): Actions Taken Ticket Detail UI, modal workflows, and component tests (Resolves #41)</td>
        <td><code>feature/issue-41-actions-ui</code></td>
        <td><span class="badge badge-success">Approved & Merged</span> (@pimchayasupr-hash)</td>
      </tr>
      <tr>
        <td>#44</td>
        <td>feat(workflow): Ticket workflow, Resolution Gate, Status History, and Concurrency (Resolves #43)</td>
        <td><code>feature/issue-43-ticket-workflow</code></td>
        <td><span class="badge badge-success">Approved & Merged</span> (@pimchayasupr-hash)</td>
      </tr>
      <tr>
        <td>#45</td>
        <td>feat(dashboards): Role-Tailored Dashboards, Metrics Aggregations, and Responsive Layouts (Resolves #45)</td>
        <td><code>feature/issue-45-dashboards</code></td>
        <td><span class="badge badge-success">Approved & Merged</span> (@pimchayasupr-hash)</td>
      </tr>
      <tr>
        <td>#48</td>
        <td>feat(e2e): End-to-End Regression, Accessibility (Axe-core Scan), and Evidence Hardening (Resolves #47)</td>
        <td><code>feature/issue-47-hardening-and-e2e</code></td>
        <td><span class="badge badge-success">Approved & Merged</span> (@pimchayasupr-hash)</td>
      </tr>
      <tr>
        <td>#50</td>
        <td>release(lab4): Final Staged Release (lab4-staging -> main) & 17-Page Report (Resolves #49)</td>
        <td><code>lab4-staging</code> &rarr; <code>main</code></td>
        <td><span class="badge badge-success">Approved & Merged</span> (@pimchayasupr-hash)</td>
      </tr>
    </tbody>
  </table>

  <h3>Repository Directory Structure</h3>
  <pre style="font-size: 6.5pt; line-height: 1.15; margin: 2px 0 0 0; padding: 4px;">toktickit/
├── artifacts/lab-04/
│   ├── metrics-vs-db.txt                 # 100% database telemetry parity proof
│   ├── screenshots/
│   │   ├── actions-taken/               # 15 live application screenshots (Desktop, Tablet, Mobile)
│   │   ├── requester-dashboard/         # 7 live requester dashboard screenshots
│   │   └── staff-dashboard/             # 8 live operational triage dashboard screenshots
│   └── test-output/                     # Raw execution logs (Server, Client, E2E, Append-Only)
├── client/
│   ├── e2e/lab-04/                      # Playwright E2E suites (Actions, Lifecycle, Dashboards)
│   ├── src/components/ActionsTaken.tsx  # Actions Taken section, modal forms & terminal locks
│   ├── src/pages/StaffDashboard.tsx     # 6-card triage ribbon, IT priority cards, queue drilldowns
│   ├── src/pages/RequesterDashboard.tsx # Personal metrics, recent tickets, 1-click drilldowns
│   └── tests/lab-04/                    # RTL unit & Axe-core WCAG 2.1 AA scans (29 tests)
├── docs/lab-04/                         # Spec DD, Test DD, UI Spec, API Spec, Reviewer, AI Use
└── server/
    ├── prisma/                          # Migrations, schema (ActionTaken, StatusHistory) & seed
    ├── src/routes/actions.ts            # Actions Taken REST endpoints (RBAC, inactive check)
    ├── src/routes/dashboard.ts          # Authoritative aggregation queries (Staff & Requester)
    ├── src/routes/staff.ts              # Resolution Gate & atomic OCC transaction logic
    └── tests/lab-04/                    # Vitest Server API regression test suites (68 tests)</pre>
</div>

<!-- PAGE 2: PART 1 (PEER REVIEWS) & PART 2 (SPEC DD) -->
<div class="page">
  <h2>Answer Part 1 (Cont.): Peer Review Dialogues with Blocking Quality Gate</h2>
  <div class="alert-box alert-success">
    <strong>Quality Gate Enforced:</strong> Round 1 of PR #38 peer review identified 4 critical architectural gaps (missing ActionStatus lifecycle, in-memory concurrency vs integer OCC, incomplete resolution gate, and missing append-only status history). Author remediation was completed and verified before any implementation was allowed into <code>lab4-staging</code>.
  </div>

  <h3>Peer Review Dialogue Snippet on PR #38 (Issue #37)</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Participant</th>
        <th>Dialogue & Technical Verification</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Reviewer (@pimchayasupr-hash)</strong></td>
        <td>
          <em>"Blocking Concerns (P1): (1) ActionTaken requires ActionStatus enum and assignee relation. Result mandatory only upon COMPLETED. Reject inactive assignees with 400. (2) Non-atomic timestamp comparisons are unsafe; use integer version with atomic write predicates (409 Conflict). (3) Resolution Gate must verify 4 prerequisites. (4) TicketStatusHistory must atomically append in same prisma transaction."</em>
        </td>
      </tr>
      <tr>
        <td><strong>Author (@supa-gif173)</strong></td>
        <td>
          <em>"Updated all four specification documents in commit 1064b9d: Added ActionStatus, assigneeId relation, 400 INACTIVE_ASSIGNEE, terminal action lock, integer version field with compare-and-increment OCC write predicates, 4-condition resolution gate, TicketStatusHistory model, and aligned Zen Green tokens. All regression suites 100% green."</em>
        </td>
      </tr>
      <tr>
        <td><strong>Reviewer (@pimchayasupr-hash)</strong></td>
        <td>
          <em>"Verified updates in commit 1064b9d. Full compliance with Course Engineering Specifications. LGTM and Approved! Proceed with merge into lab4-staging."</em>
        </td>
      </tr>
    </tbody>
  </table>

  <h1>Answer Part 2: Spec DD (Engineering Specifications)</h1>
  <p>The approved engineering contract is documented in <a href="file:///C:/Users/Lenovo/toktickit/docs/lab-04/specification.md"><code>docs/lab-04/specification.md</code></a>. Below are the key architectural requirements and business rules.</p>

  <h3>Key Functional Requirements & Business Rules</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Rule ID</th>
        <th style="width: 25%;">Scope</th>
        <th>Engineering Specification & Contract Details</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>FR-01 / BR-03</strong></td>
        <td>Actions Taken Lifecycle</td>
        <td>ActionTaken records actionDateTime, assigneeId, status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED), description, result, followUpRequired, followUpNote, attachmentNotes. Result mandatory only upon COMPLETED. Terminal lock on COMPLETED/CANCELLED.</td>
      </tr>
      <tr>
        <td><strong>FR-02 / BR-04</strong></td>
        <td>RBAC & Requester Isolation</td>
        <td>Requesters have read-only visibility for owned tickets. Creating/updating actions returns 403 Forbidden. Client-supplied requesterId cannot override JWT.</td>
      </tr>
      <tr>
        <td><strong>BR-02</strong></td>
        <td>Assignee Validation</td>
        <td>Assignee must be an active user with role STAFF or ADMIN. Attempt to assign to inactive user returns HTTP 400 with code <code>INACTIVE_ASSIGNEE</code>.</td>
      </tr>
      <tr>
        <td><strong>FR-05 / BR-06</strong></td>
        <td>Resolution Gate</td>
        <td>Transition to RESOLVED blocked with HTTP 400 unless: (1) Ticket owner assigned, (2) >=1 ActionTaken exists, (3) >=1 action is COMPLETED with non-empty result, and (4) all follow-up notes are documented.</td>
      </tr>
      <tr>
        <td><strong>FR-06 / BR-07</strong></td>
        <td>Advisory Resolution</td>
        <td>Requester toggle sets <code>problemAppearsResolved = true</code> without mutating authoritative ticket status.</td>
      </tr>
      <tr>
        <td><strong>FR-09 / BR-11</strong></td>
        <td>Optimistic Concurrency (OCC)</td>
        <td>Integer <code>version</code> on Ticket and ActionTaken. Mutations execute <code>updateMany({ where: { id, version: expectedVersion } })</code> inside <code>prisma.$transaction</code> returning HTTP 409 Conflict on collision.</td>
      </tr>
      <tr>
        <td><strong>FR-11 / BR-13</strong></td>
        <td>Append-Only Status History</td>
        <td>Status transitions atomically append an audit row to <code>TicketStatusHistory</code> (fromStatus, toStatus, changedById, changedAt). No update/delete routes exist.</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- PAGE 3: PART 3 (TEST DD & TRACEABILITY) -->
<div class="page">
  <h1>Answer Part 3: Test DD and Traceability Matrix</h1>
  <p>The test plan defined in <a href="file:///C:/Users/Lenovo/toktickit/docs/lab-04/tests.md"><code>docs/lab-04/tests.md</code></a> establishes 100% bidirectional traceability from Acceptance Criteria to automated test suites across Server API, Client RTL, and Playwright E2E.</p>

  <h3>Traceability Matrix</h3>
  <table>
    <thead>
      <tr>
        <th>Test ID</th>
        <th>Type</th>
        <th>Req / AC</th>
        <th>Target Behavior Tested</th>
        <th>Automated Test File</th>
        <th>Result</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>API-01</strong></td>
        <td>API</td>
        <td>AC-01</td>
        <td>Create valid Action Taken under ticket by IT Staff</td>
        <td><code>server/tests/lab-04/actions-taken.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-02</strong></td>
        <td>API</td>
        <td>AC-01</td>
        <td>Reject Requester attempt to create Action Taken (403)</td>
        <td><code>server/tests/lab-04/actions-taken.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-03</strong></td>
        <td>API</td>
        <td>AC-01</td>
        <td>Validate mandatory description and character limits</td>
        <td><code>server/tests/lab-04/actions-taken.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-06</strong></td>
        <td>API</td>
        <td>AC-03</td>
        <td>Enforce state machine transition matrix (illegal jump rejected)</td>
        <td><code>server/tests/lab-04/ticket-workflow.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-08</strong></td>
        <td>API</td>
        <td>AC-04</td>
        <td>Block transition to RESOLVED when Resolution Gate fails (400)</td>
        <td><code>server/tests/lab-04/ticket-workflow.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-09</strong></td>
        <td>API</td>
        <td>AC-04</td>
        <td>Allow transition to RESOLVED when all 4 gate criteria met</td>
        <td><code>server/tests/lab-04/ticket-workflow.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-10</strong></td>
        <td>API</td>
        <td>AC-05</td>
        <td>Requester advisory resolution toggle without mutating ticket status</td>
        <td><code>server/tests/lab-04/ticket-workflow.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-11</strong></td>
        <td>API</td>
        <td>AC-07</td>
        <td>Requester dashboard authoritative personal metrics</td>
        <td><code>server/tests/lab-04/requester-dashboard.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-12</strong></td>
        <td>API</td>
        <td>AC-08</td>
        <td>Staff dashboard triage ribbon & priority breakdown</td>
        <td><code>server/tests/lab-04/staff-dashboard.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-13</strong></td>
        <td>API</td>
        <td>AC-08</td>
        <td>Reject non-staff access to staff dashboard with 403 Forbidden</td>
        <td><code>server/tests/lab-04/staff-dashboard.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-14</strong></td>
        <td>API</td>
        <td>AC-02</td>
        <td>Reject assigning action to inactive user (400 INACTIVE_ASSIGNEE)</td>
        <td><code>server/tests/lab-04/actions-taken.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-15</strong></td>
        <td>API</td>
        <td>AC-02</td>
        <td>Lock completed action from modification (400 LOCKED)</td>
        <td><code>server/tests/lab-04/actions-taken.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-16</strong></td>
        <td>API</td>
        <td>AC-06</td>
        <td>Append-only TicketStatusHistory transactional write</td>
        <td><code>server/tests/lab-04/ticket-workflow.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>API-17</strong></td>
        <td>API</td>
        <td>AC-11</td>
        <td>Optimistic concurrency collision returns HTTP 409 Conflict</td>
        <td><code>server/tests/lab-04/actions-taken.api.test.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>UI-01..02</strong></td>
        <td>RTL</td>
        <td>AC-07..08</td>
        <td>Requester & Staff Dashboard component rendering & drilldowns</td>
        <td><code>client/tests/lab-04/*Dashboard.test.tsx</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>UI-03..07</strong></td>
        <td>RTL</td>
        <td>AC-01..06</td>
        <td>Actions Taken table, modal validation, Gate checklist, history</td>
        <td><code>client/tests/lab-04/ActionsTaken.test.tsx</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>UI-08</strong></td>
        <td>A11y</td>
        <td>AC-14</td>
        <td>Automated Axe-core WCAG 2.1 AA scan (0 critical/serious violations)</td>
        <td><code>client/tests/lab-04/A11yScan.test.tsx</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
      <tr>
        <td><strong>E2E-01..03</strong></td>
        <td>E2E</td>
        <td>AC-01..13</td>
        <td>Playwright end-to-end lifecycle, resolution gate, overflow check</td>
        <td><code>client/e2e/lab-04/*.spec.ts</code></td>
        <td><span class="badge badge-success">Pass</span></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- PAGE 4: PART 3 TEST OUTPUTS -->
<div class="page">
  <h2>Answer Part 3 (Cont.): Automated Test Execution Outputs from Main</h2>
  <div class="alert-box alert-success">
    <strong>100% Green Test Suite:</strong> Verified 102 automated tests passing with 0 failures across Chromium, node runtime, and PostgreSQL.
  </div>

  <h3>Automated Test Execution Summary Output</h3>
  <div class="img-grid-3">
    <div>
      <strong>Server API Vitest (68/68)</strong>
      <pre>${serverVitestText.split('\\n').slice(5, 26).join('\\n')}</pre>
    </div>
    <div>
      <strong>Client RTL & A11y (29/29)</strong>
      <pre>${clientVitestText.split('\\n').slice(5, 30).join('\\n')}</pre>
    </div>
    <div>
      <strong>Playwright E2E Suites (5/5)</strong>
      <pre>${playwrightE2EText}</pre>
    </div>
  </div>
</div>

<!-- PAGE 4: PART 4 (AI USE WITH REFLECTION) -->
<div class="page">
  <h1>Answer Part 4: AI Use with Reflection</h1>
  <p>The complete reflection is documented in <a href="file:///C:/Users/Lenovo/toktickit/docs/lab-04/ai-use.md"><code>docs/lab-04/ai-use.md</code></a>.</p>

  <h3>Selected Key AI Prompts Across Sprint 4</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">#</th>
        <th style="width: 25%;">Development Stage</th>
        <th>Exact Key Prompt Provided to Agent</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Contract Decomposition</td>
        <td><em>"Decompose Lab 4 handout into numbered FR-01..11, BR-01..13, and AC-01..14 covering Actions Taken parent-child structure, ticket lifecycle, Resolution Gate, dashboards, OCC 409, and Zen Green tokens."</em></td>
      </tr>
      <tr>
        <td>2</td>
        <td>Peer Review Remediation</td>
        <td><em>"Review peer review feedback on PR #38 from @pimchayasupr-hash. Incorporate ActionStatus lifecycle, active staff assignee relation (400 INACTIVE_ASSIGNEE), terminal action lock, atomic integer version OCC predicates, and append-only status history."</em></td>
      </tr>
      <tr>
        <td>3</td>
        <td>Schema & Migration</td>
        <td><em>"Design Prisma schema increment for Lab 4: ActionStatus enum, ActionTaken model, TicketStatusHistory model, and version integer on Ticket and ActionTaken with idempotent realistic seed."</em></td>
      </tr>
      <tr>
        <td>4</td>
        <td>Actions Taken REST APIs</td>
        <td><em>"Implement REST routes for Actions Taken. Enforce performedById auto-populated from JWT, result mandatory only on COMPLETED, inactive assignee check, terminal locking, and requester read-only mode."</em></td>
      </tr>
      <tr>
        <td>5</td>
        <td>Resolution Gate Logic</td>
        <td><em>"Implement server-side status transition matrix and 4-condition Resolution Gate. Atomically append TicketStatusHistory inside prisma.$transaction and return 409 Conflict on version collision."</em></td>
      </tr>
      <tr>
        <td>6</td>
        <td>Dashboard Telemetry APIs</td>
        <td><em>"Implement GET /api/dashboard/requester and GET /api/dashboard/staff aggregating operational ribbon metrics, priority breakdown via prisma.ticket.groupBy, and 403 guard for unauthorized requesters."</em></td>
      </tr>
      <tr>
        <td>7</td>
        <td>Axe-core Accessibility</td>
        <td><em>"Write an automated accessibility scan in client/tests/lab-04/A11yScan.test.tsx using axe-core asserting 0 critical or serious WCAG 2.1 AA violations on all Lab 4 interfaces."</em></td>
      </tr>
      <tr>
        <td>8</td>
        <td>Database Telemetry Parity</td>
        <td><em>"Write a verification script scripts/generate_metrics_vs_db.js querying REST APIs and raw PostgreSQL queries simultaneously, asserting 100% count match."</em></td>
      </tr>
    </tbody>
  </table>

  <h3>My Reflection on AI Specification-Agent and Coding-Agent Use</h3>
  <p><strong>Specification-Agent Use:</strong> Working with the AI specification agent before implementation was crucial for eliminating ambiguity. Decomposing stakeholder expectations into numbered, measurable requirements (FRs, BRs, ACs) prevented scope creep. When our peer reviewer identified the need for optimistic concurrency via integer versioning and append-only audit logs, the specification agent enabled us to systematically update all contract files and planned test cases before touching production code.</p>
  <p><strong>Coding-Agent Use:</strong> The AI coding agent accelerated delivery of complex full-stack features while maintaining production rigor. It excelled at enforcing atomic Prisma transactions, generating idempotent test fixtures, ensuring explicit SVG dimensions (<= 64px), and building comprehensive Vitest and Playwright test suites. Overall, Sprint 4 proved that pairing human architectural oversight with disciplined AI coding agents produces robust, test-verified software.</p>
</div>

<!-- PAGE 5: PART 5 (WORKING IT STAFF DASHBOARD UI) -->
<div class="page">
  <h1>Answer Part 5: Working IT Staff Dashboard UI</h1>
  <p>The IT Staff Dashboard (<a href="file:///C:/Users/Lenovo/toktickit/client/src/pages/StaffDashboard.tsx"><code>StaffDashboard.tsx</code></a>) serves as the operational triage hub. It renders 6 summary ribbon metric cards, active queue priority distribution, top 5 recent queue tickets, Administrator system statistics, and direct 1-click drill-downs.</p>

  <div class="img-grid-2">
    <div class="img-container">
      <img src="${imgStaffDesktop}" alt="IT Staff Dashboard Desktop">
      <div class="img-caption">Figure 5.1: IT Staff Operational Triage Dashboard (Desktop 1280px) &mdash; 6-Card Ribbon & Priority Breakdown</div>
    </div>
    <div class="img-container">
      <img src="${imgStaffPriority}" alt="Priority Breakdown">
      <div class="img-caption">Figure 5.2: Active Queue Breakdown by IT Priority (Urgent, High, Medium, Low)</div>
    </div>
  </div>

  <div class="img-grid-3">
    <div class="img-container">
      <img src="${imgStaffTablet}" alt="IT Staff Dashboard Tablet">
      <div class="img-caption">Figure 5.3: Staff Dashboard Tablet View (768px)</div>
    </div>
    <div class="img-container">
      <img src="${imgStaffMobile}" alt="IT Staff Dashboard Mobile">
      <div class="img-caption">Figure 5.4: Staff Dashboard Mobile (375px, 0px Overflow)</div>
    </div>
    <div class="img-container">
      <img src="${imgAdminStats}" alt="Admin System User Stats">
      <div class="img-caption">Figure 5.5: Administrator System User Metrics (Admin Only)</div>
    </div>
  </div>

  <div class="img-grid-2">
    <div class="img-container">
      <img src="${imgDrillUnassigned}" alt="Drilldown Unassigned">
      <div class="img-caption">Figure 5.6: 1-Click Drill-Down into Unassigned Queue (<code>?unassigned=true</code>)</div>
    </div>
    <div class="img-container">
      <img src="${imgDrillUrgent}" alt="Drilldown Urgent">
      <div class="img-caption">Figure 5.7: 1-Click Drill-Down into Urgent Priority Tickets (<code>?priority=URGENT</code>)</div>
    </div>
  </div>

  <h3>Authoritative Telemetry Parity Verification (REST API vs Direct PostgreSQL)</h3>
  <pre>${metricsVsDbText}</pre>
</div>

<!-- PAGE 6: PART 6 (WORKING ACTIONS TAKEN UI) -->
<div class="page">
  <h1>Answer Part 6: Working Actions Taken UI</h1>
  <p>The Actions Taken system (<a href="file:///C:/Users/Lenovo/toktickit/client/src/components/ActionsTaken.tsx"><code>ActionsTaken.tsx</code></a>) tracks operational steps under each ticket. It supports creation, assignment to active IT Staff, lifecycle transitions, validation rules, terminal locks, and Requester read-only isolation.</p>

  <div class="img-grid-2">
    <div class="img-container">
      <img src="${imgActTable}" alt="Actions Taken Table Desktop">
      <div class="img-caption">Figure 6.1: Actions Taken Table under Ticket Detail &mdash; Status Badges, Performed By, Assignee</div>
    </div>
    <div class="img-container">
      <img src="${imgActCreate}" alt="Create Action Modal">
      <div class="img-caption">Figure 6.2: Create Action Taken Modal &mdash; Date/Time, Assignee Dropdown, Follow-Up Fields</div>
    </div>
  </div>

  <div class="img-grid-3">
    <div class="img-container">
      <img src="${imgActError}" alt="Validation Error">
      <div class="img-caption">Figure 6.3: Validation Error: Mandatory Description</div>
    </div>
    <div class="img-container">
      <img src="${imgActAssignee}" alt="Assignee Selection">
      <div class="img-caption">Figure 6.4: Assignee Dropdown & Follow-Up Note</div>
    </div>
    <div class="img-container">
      <img src="${imgActEdit}" alt="Edit Modal Completed">
      <div class="img-caption">Figure 6.5: Transitioning to COMPLETED with Required Result</div>
    </div>
  </div>

  <div class="img-grid-3">
    <div class="img-container">
      <img src="${imgActLocked}" alt="Terminal Locked Action">
      <div class="img-caption">Figure 6.6: Terminal Lock on COMPLETED Action (Immutable)</div>
    </div>
    <div class="img-container">
      <img src="${imgActTablet}" alt="Actions Taken Tablet">
      <div class="img-caption">Figure 6.7: Actions Taken Tablet Responsive View (768px)</div>
    </div>
    <div class="img-container">
      <img src="${imgActMobile}" alt="Actions Taken Mobile">
      <div class="img-caption">Figure 6.8: Actions Taken Mobile Cards (375px, 0px Overflow)</div>
    </div>
  </div>

  <h3>Inactive Assignee Validation & Terminal Action Lock Logic</h3>
  <pre>// server/src/routes/actions.ts: Assignee & Terminal State Guardrails
if (assigneeId) {
  const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
  if (!assignee || !assignee.isActive || !['STAFF', 'ADMIN'].includes(assignee.role)) {
    return res.status(400).json({ error: 'Assignee must be an active IT Staff or Administrator.', code: 'INACTIVE_ASSIGNEE' });
  }
}
if (['COMPLETED', 'CANCELLED'].includes(existingAction.status)) {
  return res.status(400).json({ error: 'Terminal actions cannot be modified.', code: 'TERMINAL_ACTION_LOCKED' });
}</pre>
</div>

<!-- PAGE 7: PART 7 (WORKING TICKET WORKFLOW, RESOLUTION GATE & CONCURRENCY) -->
<div class="page">
  <h1>Answer Part 7: Working Ticket Workflow, Resolution Gate, and Concurrency</h1>
  <p>Sprint 4 strictly enforces state transition validity, the 4-condition Resolution Gate, transactional append-only audit logging, and optimistic concurrency control (OCC).</p>

  <div class="img-grid-2">
    <div class="img-container">
      <img src="${imgGateChecklist}" alt="Resolution Gate Checklist">
      <div class="img-caption">Figure 7.1: Resolution Gate Prerequisite Checklist in Staff Ticket Detail</div>
    </div>
    <div class="img-container">
      <img src="${imgGateBlocked}" alt="Resolution Gate Blocked Error">
      <div class="img-caption">Figure 7.2: Resolution Gate Rejection Alert (400 RESOLUTION_GATE_FAILED)</div>
    </div>
  </div>

  <div class="img-grid-2">
    <div class="img-container">
      <img src="${imgGateSuccess}" alt="Resolution Gate Success">
      <div class="img-caption">Figure 7.3: Ticket Successfully Transitioned to RESOLVED after Satisfying All Gate Conditions</div>
    </div>
    <div class="img-container">
      <img src="${imgOccConflict}" alt="OCC 409 Conflict Banner">
      <div class="img-caption">Figure 7.4: Optimistic Concurrency Control (OCC) HTTP 409 Conflict Banner</div>
    </div>
  </div>

  <div class="img-container" style="margin: 6px 0;">
    <img src="${imgHistoryTimeline}" alt="Ticket Status History Timeline" style="max-height: 140px; object-fit: contain;">
    <div class="img-caption">Figure 7.5: Append-Only TicketStatusHistory Chronological Audit Timeline Widget</div>
  </div>

  <h3>Transactional Append-Only Audit Proof</h3>
  <pre>${appendOnlyText}</pre>
</div>

<!-- PAGE 8: PART 8 (REQUESTER DASHBOARD & REGRESSION) -->
<div class="page">
  <h1>Answer Part 8: Working Requester Dashboard and Final Regression UI</h1>
  <p>The Requester Dashboard (<a href="file:///C:/Users/Lenovo/toktickit/client/src/pages/RequesterDashboard.tsx"><code>RequesterDashboard.tsx</code></a>) provides personal metrics, recent ticket summaries, 1-click drilldowns, and the advisory resolution toggle without mutating official status.</p>

  <div class="img-grid-2">
    <div class="img-container">
      <img src="${imgReqDesktop}" alt="Requester Dashboard Desktop">
      <div class="img-caption">Figure 8.1: Requester Dashboard Desktop View &mdash; My Open Tickets, Waiting on Me, Recently Resolved</div>
    </div>
    <div class="img-container">
      <img src="${imgReqQuick}" alt="Requester Quick Actions">
      <div class="img-caption">Figure 8.2: Requester Quick Actions (+ Create Ticket, View My Tickets)</div>
    </div>
  </div>

  <div class="img-grid-3">
    <div class="img-container">
      <img src="${imgReqTablet}" alt="Requester Tablet">
      <div class="img-caption">Figure 8.3: Requester Dashboard Tablet (768px)</div>
    </div>
    <div class="img-container">
      <img src="${imgReqMobile}" alt="Requester Mobile">
      <div class="img-caption">Figure 8.4: Requester Dashboard Mobile (375px)</div>
    </div>
    <div class="img-container">
      <img src="${imgAdvisoryToggle}" alt="Advisory Resolved Toggle">
      <div class="img-caption">Figure 8.5: Advisory "Problem Appears Resolved" Toggle</div>
    </div>
  </div>
</div>

<!-- PAGE: PART 8 (CONT.) READONLY ACTIONS & REGRESSION -->
<div class="page">
  <h2>Answer Part 8 (Cont.): Requester Actions Taken & Regression Verification</h2>

  <div class="img-grid-2">
    <div class="img-container">
      <img src="${imgReqReadonly}" alt="Requester Actions Readonly">
      <div class="img-caption">Figure 8.6: Actions Taken Read-Only Presentation for Requester (Add Action Button Hidden)</div>
    </div>
    <div class="img-container">
      <img src="${imgReqDrillOpen}" alt="Requester Drilldown Open">
      <div class="img-caption">Figure 8.7: 1-Click Drilldown into My Open Tickets (<code>/tickets?status=open</code>)</div>
    </div>
  </div>

  <h3>Full System Regression Verification (Labs 1, 2, and 3 Continuity)</h3>
  <table>
    <thead>
      <tr>
        <th>Subsystem</th>
        <th>Regression Behavior Verified</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Authentication & Password (Lab 3)</strong></td>
        <td>JWT cookies, forced first-login password change, inactive account rejection.</td>
        <td><span class="badge badge-success">Verified (Pass)</span></td>
      </tr>
      <tr>
        <td><strong>Staff Ticket Queue & Filters (Lab 3)</strong></td>
        <td>Search query, category/priority/status filters, pagination, claim ticket.</td>
        <td><span class="badge badge-success">Verified (Pass)</span></td>
      </tr>
      <tr>
        <td><strong>Comments & Internal Notes (Lab 3)</strong></td>
        <td>Public comments visible to both; internal notes restricted to IT Staff/Admin (403).</td>
        <td><span class="badge badge-success">Verified (Pass)</span></td>
      </tr>
      <tr>
        <td><strong>User Management (Lab 3)</strong></td>
        <td>Admin user creation, deactivation, role assignment, password reset.</td>
        <td><span class="badge badge-success">Verified (Pass)</span></td>
      </tr>
      <tr>
        <td><strong>Attachments & Cascading (Lab 2)</strong></td>
        <td>Secure attachment upload, download authentication, and cascading deletes.</td>
        <td><span class="badge badge-success">Verified (Pass)</span></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- PAGE 9: PART 9 (ZEN GREEN UI, RESPONSIVE, ACCESSIBILITY & CONCLUSION) -->
<div class="page">
  <h1>Answer Part 9: Zen Green UI, Responsive, Accessibility, and Final Polish</h1>
  <p>The entire user interface strictly implements the canonical Zen Green design system with explicit SVG dimension bounds and verified zero horizontal page scrolling.</p>

  <h3>Design Tokens & Universal SVG Guardrail Compliance</h3>
  <table>
    <thead>
      <tr>
        <th>Design Token</th>
        <th>CSS Variable / Hex Code</th>
        <th>Usage & Architectural Boundary</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Primary Forest Green</strong></td>
        <td><code>var(--primary)</code> / <code>#006B3C</code></td>
        <td>Primary buttons, headers, active navigation pills, brand mark.</td>
      </tr>
      <tr>
        <td><strong>Secondary Accent Green</strong></td>
        <td><code>var(--secondary)</code> / <code>#0B7A46</code></td>
        <td>Interactive highlights, secondary actions, badge borders.</td>
      </tr>
      <tr>
        <td><strong>Surface Pale Mint</strong></td>
        <td><code>var(--pale-green)</code> / <code>#F0FDF4</code></td>
        <td>Metric card backgrounds, table header fills, highlight banners.</td>
      </tr>
      <tr>
        <td><strong>Background Neutral</strong></td>
        <td><code>var(--background)</code> / <code>#F5F7F6</code></td>
        <td>Application shell background, card container contrast.</td>
      </tr>
      <tr>
        <td><strong>Universal SVG Guardrail</strong></td>
        <td><code>max-width: 64px !important;</code></td>
        <td>Enforces all inline SVG icons <= 64px across every component (0 emojis).</td>
      </tr>
    </tbody>
  </table>

  <h3>Automated Axe-Core Accessibility Scan (UI-08 / AC-14)</h3>
  <div class="alert-box alert-success">
    <strong>Zero Violations:</strong> Automated scan in <code>client/tests/lab-04/A11yScan.test.tsx</code> evaluated Requester Dashboard, Staff Dashboard, Actions Taken, and Ticket History timeline against WCAG 2.1 AA rules. Result: <strong>0 critical and 0 serious accessibility violations</strong>.
  </div>

  <h3>Responsive Viewport Verification (0px Horizontal Overflow)</h3>
  <table>
    <thead>
      <tr>
        <th>Viewport Mode</th>
        <th>Dimensions</th>
        <th>Max ScrollWidth vs InnerWidth</th>
        <th>Horizontal Overflow</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Mobile Screen</strong></td>
        <td>375 x 812 px</td>
        <td><code>scrollWidth == innerWidth (375px)</code></td>
        <td><span class="badge badge-success">0 px (No Scroll)</span></td>
      </tr>
      <tr>
        <td><strong>Tablet Screen</strong></td>
        <td>768 x 1024 px</td>
        <td><code>scrollWidth == innerWidth (768px)</code></td>
        <td><span class="badge badge-success">0 px (No Scroll)</span></td>
      </tr>
      <tr>
        <td><strong>Desktop Screen</strong></td>
        <td>1280 x 800 px</td>
        <td><code>scrollWidth == innerWidth (1280px)</code></td>
        <td><span class="badge badge-success">0 px (No Scroll)</span></td>
      </tr>
    </tbody>
  </table>

  <h3>Sprint 4 Final Definition of Done (DoD) Sign-Off</h3>
  <table>
    <thead>
      <tr>
        <th>Deliverable Category</th>
        <th>Criteria & Verification Standard</th>
        <th>DoD Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Spec DD Deliverables</strong></td>
        <td><code>docs/lab-04/specification.md</code>, <code>ui-spec.md</code>, <code>api-spec.md</code>, <code>tests.md</code>, <code>reviewer.md</code>, <code>ai-use.md</code></td>
        <td><span class="badge badge-success">100% Complete</span></td>
      </tr>
      <tr>
        <td><strong>Database & REST APIs</strong></td>
        <td>Prisma migrations, seed data, ActionTaken lifecycle, Resolution Gate, OCC 409 Conflict.</td>
        <td><span class="badge badge-success">100% Complete</span></td>
      </tr>
      <tr>
        <td><strong>Automated Test Coverage</strong></td>
        <td>68 Server Vitest + 29 Client RTL + 5 Playwright E2E = 102 passing tests (0 failures).</td>
        <td><span class="badge badge-success">100% Complete</span></td>
      </tr>
      <tr>
        <td><strong>Peer Review & Sign-Off</strong></td>
        <td>Bidirectional reviews approved by @pimchayasupr-hash across all PRs (#38, #40, #42, #44, #46, #48, #50).</td>
        <td><span class="badge badge-success">100% Complete</span></td>
      </tr>
      <tr>
        <td><strong>Staged Release to Main</strong></td>
        <td>Clean staged merge of <code>lab4-staging</code> into <code>main</code> with zero conflicts and full git history.</td>
        <td><span class="badge badge-success">Ready for Release</span></td>
      </tr>
    </tbody>
  </table>
</div>

</body>
</html>`;

  const htmlPath = path.join(rootDir, 'LAB4_SUBMISSION.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`Saved HTML report to ${htmlPath}`);

  // Launch Playwright Chromium to export PDF
  console.log('Rendering HTML to PDF via Playwright Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('file:///' + htmlPath.replace(/\\\\/g, '/'), { waitUntil: 'networkidle' });

  const pdfPath = path.join(rootDir, 'LAB4_SUBMISSION.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '14mm',
      left: '12mm',
      right: '12mm',
    },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="font-size: 8pt; width: 100%; text-align: center; color: #6b7280; font-family: sans-serif;">TokTickIT Lab 4 Sprint Report &mdash; Supattra Kongsiripat (67070505228) &mdash; Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
  });

  await browser.close();
  console.log(`Successfully compiled PDF report to ${pdfPath}`);
}

buildReport().catch(err => {
  console.error(err);
  process.exit(1);
});
