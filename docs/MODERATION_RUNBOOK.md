# FHM Church Moderation Runbook

Last verified: 2026-08-31
Service owner: Father’s Heart Ministries
Published contact: `Media@fathersheartministry.ca`

This runbook is the human-response procedure behind the app’s user-generated-content controls. Automation assists triage; a trained administrator remains responsible for each final decision.

## Service-level objective

- Every new report receives an immediate acknowledgement in the app.
- A moderation alert is attempted immediately and retried by the scheduled escalation function.
- Reports must be reviewed and resolved within 24 hours.
- Reports within two hours of the deadline, and failed notification deliveries, are escalated every 15 minutes on the published Netlify deployment.
- Credible imminent threats, child-safety concerns, or illegal-content allegations are escalated immediately to appropriate emergency or legal channels. Do not wait for the 24-hour target.

## Where moderators work

1. Sign in with an administrator account.
2. Open **Admin → Safety Reports** (`/admin/reports`).
3. Work the **Open reports** list in deadline order. Items marked urgent are closest to the 24-hour deadline.
4. Use resolved history and the user’s previous-report count to check context and repeat behavior.

The queue shows the report reason, optional reporter context, reporter, reported member, team, content type, evidence, notification status, and deadline. It does not put user content into email. Email contains only a report ID, reason, deadline, and admin-queue link.

## Review procedure

1. Confirm the reported item and its team/user relationship match the report record.
2. For text or poll content, review the preserved evidence in the queue.
3. Select an outcome and enter a specific internal note. Notes are part of the audit trail; do not include irrelevant personal data.
4. Apply one action:

   - **Dismiss** — the content does not violate the Community Guidelines.
   - **Remove content** — soft-removes the item from member chat while preserving evidence and audit records.
   - **Warn user** — records a warning without suspending access.
   - **Suspend 7 days** — disables the account temporarily and removes the reported content.
   - **Ban user** — disables the account indefinitely and removes the reported content.
   - **Restore content** — reverses a content removal after a documented correction or appeal.

5. Verify the report moved into resolved history and that the audit entry was created.

## Action guidance

Use proportionate decisions, while treating child exploitation, credible threats, targeted harassment, hate speech, doxxing, sexual content, and facilitation of illegal activity as serious violations.

- Remove content when it violates the zero-tolerance Community Guidelines.
- Warn for a lower-severity first incident where account restriction is not required for safety.
- Suspend for repeated or material misconduct when a temporary restriction is proportionate.
- Ban for severe abuse, credible threats, exploitation, evasion after suspension, or repeated serious misconduct.
- Preserve neutrality: church role, personal relationship, or disagreement with a viewpoint must not affect enforcement.

## Blocking and reports

- A member can report any incoming team-chat message using the message’s safety menu.
- A member can block the sender from the same menu. Blocking is immediate in that member’s UI and server-side results.
- A block automatically creates a safety report so potentially abusive content is still reviewed.
- Blocking never deletes or hides the evidence from administrators.
- Members can review and reverse their own blocks at **Profile → Blocked Users**.

## Notification failures

If a report shows a failed alert:

1. Use **Retry alert** in the Safety Reports queue.
2. Confirm `RESEND_API_KEY`, `MODERATION_ALERT_FROM` (or `PASSWORD_RESET_FROM`), `MODERATION_ALERT_TO`, and `NEXT_PUBLIC_APP_URL` are present in Netlify’s secure environment.
3. Confirm the scheduled `moderation-escalation` function is present on the published deploy and inspect its function log for report IDs only.
4. If email remains unavailable, assign a moderator to keep the queue open and check it manually until delivery is restored.
5. Never copy report evidence into email or a third-party incident system unless the ministry’s privacy/legal owner has approved that data flow.

## Privacy and evidence handling

- Rejected text is not stored; the moderation event stores a one-way content hash, categories, surface, and outcome.
- Published or reported chat evidence remains in the application database for moderation and audit needs, even when a reporter blocks its sender.
- Moderator actions are recorded in `ModerationAudit`; filter decisions are recorded in `ContentModerationEvent`.
- Access to the queue is administrator-only. New moderation tables have row-level security enabled and grant no browser-client access.
- Data retention and deletion decisions must follow the published Privacy Policy and any preservation obligation for safety/legal matters.

## Daily operational check

- Open Safety Reports and confirm there are no overdue reports.
- Retry failed alerts.
- Confirm the health endpoint and member sign-in work.
- Confirm at least two trained people monitor `Media@fathersheartministry.ca` or the configured moderation inbox.

## Release check

Before each production release:

1. Run `npm test`, `npx tsc --noEmit`, `npm run build`, and `npm audit --omit=dev`.
2. Run `npx prisma migrate status`; confirm both Guideline 1.2 migrations are applied before deploying code that depends on them. Verify that `ChatReport` and `UserBlock` expose no `anon`/`authenticated` grants.
3. Verify the report, block, unblock, text rejection, notification retry, remove, suspend, ban, and restore flows using fictional data.
4. Test on a physical iPhone and iPad with VoiceOver, Dynamic Type, rotation, safe areas, and offline/error states.
5. Keep the App Review demo account active, assigned to a sample team, and free of real member data throughout review.

## Incident contacts

- Product/support/moderation: `Media@fathersheartministry.ca`
- Emergency or legal escalation: use the ministry’s approved internal incident contact list; do not store personal emergency contacts in this repository.
