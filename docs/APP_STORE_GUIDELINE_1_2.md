# App Store Guideline 1.2 Remediation Evidence

Submission reference: `d008...`
Rejected build: 17
Review date/device: 2026-08-31, iPad Air (M3)
Implementation date: 2026-08-31

## Decision summary

The app’s member-only text-and-poll team chat is user-generated content. It now has all four controls explicitly required by App Review Guideline 1.2: pre-publication filtering, member reporting with timely response, member blocking, and published developer contact information. The implementation also adds explicit zero-tolerance consent, account sanctions, evidence preservation, and administrator audit trails. Voice messaging is not offered in this release.

This document is engineering/compliance evidence, not legal advice. Final policy language and App Store privacy answers require owner/legal approval.

## Requirement matrix

| Requirement | Implementation | Evidence path | Status |
|---|---|---|---|
| Filter objectionable material | Text and poll fields pass deterministic server-side English/Arabic moderation before storage/publication. Unicode, spacing, punctuation, repeated-character, common leetspeak evasion, directed insults, and common abusive profanity are normalized and checked. The service fails closed when moderation cannot complete. | `src/lib/moderation.ts`, `src/lib/safety-service.ts`, `src/app/api/chat/[teamId]/route.ts` | Implemented and unit tested |
| Report objectionable content | Each incoming message has a safety menu with report reason and optional details. The server validates team membership and the exact message/sender relationship, creates a 24-hour deadline, and acknowledges immediately. | `src/app/chat/[teamId]/chat-room.tsx`, `src/app/api/chat/moderation/route.ts` | Implemented |
| Timely developer response | Immediate privacy-safe email alert, retry UI, notification state, and a scheduled 15-minute escalation for failures and reports near deadline. Admin queue is ordered by deadline. | `src/lib/email.ts`, `src/lib/safety-service.ts`, `netlify/functions/moderation-escalation.ts`, `src/app/admin/reports/page.tsx` | Implemented and published; scheduled function verified active on Netlify |
| Block abusive users | Blocking takes effect immediately in the UI, is enforced in server results, automatically creates a safety report, and can be reversed only by the blocker. | `src/app/api/safety/blocks/route.ts`, `src/app/profile/blocked-users/page.tsx` | Implemented |
| Published contact | Community Guidelines, Policies, Privacy, Terms, and Support publish `Media@fathersheartministry.ca`. | `/community-guidelines`, `/policies`, `/privacy`, `/terms`, `/support` | Implemented; confirm monitored inbox |
| Developer removes violators | Moderators can dismiss, remove content, warn, suspend seven days, ban, or restore. Suspension/ban is enforced during session validation. | `src/app/admin/reports/page.tsx`, `src/lib/safety-service.ts`, `src/lib/auth.ts` | Implemented |
| Explicit consent | Registration and sign-in require an unchecked agreement to the current Terms and Community Guidelines. Decline stops authentication; existing accounts must accept the current version before UGC access. | `src/components/auth/terms-gate.tsx`, `src/lib/terms.ts`, auth API routes | Implemented |
| Preserve evidence/audit | Soft removal preserves content; reports remain reviewable after blocking; filter events store hashes rather than rejected text; moderator actions are auditable. | Prisma models/migration, `src/lib/safety-service.ts` | Implemented |

## Filter approach and limitations

The filter is deliberately server-authoritative: a modified client cannot bypass it. It evaluates the complete text message and every poll question/option after Unicode and evasion normalization. It blocks defined severe-safety categories before publication and returns a neutral revision message. Rejected text is never written to the database or logs; a SHA-256 hash supports incident correlation without preserving the text.

No finite word/rule filter understands all context, dialects, or coded language. The safeguards therefore operate as layers: terms consent, pre-publication checks, per-message reporting, blocking, automatic report creation on block, human review, sanctions, escalation, and published contact.

## UGC surface audit

| Surface | User supplied? | Publication control |
|---|---:|---|
| Team chat text | Yes | Server filter before publication |
| Team chat polls | Yes | Question and each option filtered before publication |
| Profile name/phone | Yes | Length/control validation; not a public feed |
| Event votes/RSVP/volunteering | Yes, structured | Authenticated, authorized, fixed-value actions; no free-form public content |
| Sermons, podcasts, articles, events | Administrator supplied | Role/permission controlled; administrator remains responsible for content |
| Bible selections/favorites | Private/structured | No public publication |

No other public free-form UGC surface was found in the current repository.

## Apple guideline cross-check

- **1.2 User-Generated Content:** filter, report, timely response, block, contact, and developer removal controls are implemented.
- **1.6 Data Security:** production JWT configuration fails closed; secrets were removed from tracked deployment files; moderation evidence is access-controlled.
- **2.1 App Completeness:** production backend, sample team, current demo credentials, and physical-device flows must be available during review.
- **2.3 Accurate Metadata:** review notes must describe member-only text-and-poll chat, reports, blocks, and navigation accurately.
- **2.4.1 Hardware Compatibility:** validate iPhone and iPad layout/orientation on actual supported devices.
- **5.1.1 Privacy and Data Collection:** privacy policy covers collection, use, retention, deletion, safety processing, contact, and in-app account deletion.
- **5.1.2 Data Use and Sharing:** confirm every production provider and the final App Store privacy nutrition label.

Authoritative source: Apple App Review Guidelines, <https://developer.apple.com/app-store/review/guidelines/>.

## Verification completed

- Prisma schema formatted and client generated.
- Production migrations `20260831230000_app_store_guideline_1_2` and `20260901010000_harden_moderation_security_and_pending_voice` applied additively; existing chat records were preserved. The voice composer and microphone permission were subsequently removed, new voice submissions are rejected server-side, and legacy voice records are hidden from members.
- Row-level security is enabled and `anon`/`authenticated` privileges are revoked for terms, reports, blocks, moderation audit, and moderation-event evidence.
- Automated safety tests cover allowed English/Arabic conversation, direct threats, abusive English/Arabic phrases, common evasion, privacy-safe hash results, and the current terms version.
- TypeScript type-check, ESLint, and the optimized production build passed on 2026-09-02.
- The production dependency audit reported zero known vulnerabilities on 2026-09-01.
- Responsive browser validation completed for login consent and policy pages at iPhone- and iPad-sized viewports.
- A privacy-safe test moderation alert was accepted by the configured email provider; inbox receipt still requires a human confirmation.
- Production is live at `https://fhmapp.netlify.app`; the deployed `moderation-escalation` function is active.
- Live smoke checks returned HTTP 200 for health/database connectivity, Terms, Community Guidelines, login consent, and Support contact.

## Physical iOS validation matrix

These checks cannot be truthfully completed on this Windows workstation. Record the result on a release-signed build before resubmission.

| Test | iPhone | iPad Air (M3) | Evidence |
|---|---|---|---|
| Fresh registration: agreement unchecked; Continue disabled | Pending | Pending | Screenshot |
| Decline blocks registration/sign-in | Pending | Pending | Screenshot |
| Existing-account agreement renewal | Pending | Pending | Screenshot |
| Objectionable text/poll rejected and never appears | Pending | Pending | Screen recording |
| Report acknowledgement and admin queue entry | Pending | Pending | Screen recording |
| Block immediately removes sender’s messages; unblock restores future visibility | Pending | Pending | Screen recording |
| Admin remove/warn/suspend/ban/restore | Pending | Pending | Admin/member video |
| VoiceOver focus order and labels | Pending | Pending | Checklist |
| Dynamic Type, portrait/landscape, safe areas, dark contrast | Pending | Pending | Screenshots |
| Offline/API failure behavior | Pending | Pending | Notes/video |
| Account deletion | Pending | Pending | Screen recording |

Suggested evidence filename: `FHM-Guideline-1.2-UGC-Controls-iPhone-iPad.mp4`. Do not claim it exists until captured.

## App Review navigation

1. Launch the app. The reviewer sees the current Terms and Community Guidelines agreement before sign-in.
2. Agree, then sign in with the non-admin review account supplied only in App Store Connect.
3. Open **Teams**, choose **App Review Test Team**, and open **Team Chat**.
4. Open the three-dot safety menu on an incoming message to see **Report message** and **Block user**.
5. Open **Profile → Blocked Users** to manage blocks.
6. Sign in with the admin review account only if Apple requests moderator evidence; open **Admin → Safety Reports**.
7. Public contact and policies are available at **Support**, **Community Guidelines**, **Policies**, **Privacy**, and **Terms**.

## Draft reply to App Review

Hello App Review,

Thank you for identifying the Guideline 1.2 issue. We implemented a complete user-generated-content safety flow for member team chat:

- server-side objectionable-content filtering before text and poll publication, including normalization for common evasion;
- per-message reporting with immediate acknowledgement, a 24-hour response deadline, moderator alerts/retries, and an administrator queue;
- immediate user blocking enforced by the server, with a safety report automatically created when a user is blocked;
- public Community Guidelines, Terms, Privacy, Policies, and Support pages with a monitored developer contact;
- explicit zero-tolerance Terms/Community Guidelines agreement before sign-in or registration;
- administrator controls to remove content, warn, suspend, ban, and restore, with an audit trail.

To test: agree to the policies, sign in with the review account in App Store Connect, open **Teams → App Review Test Team → Team Chat**, then use the three-dot menu on an incoming message. Blocks can be managed under **Profile → Blocked Users**. Account deletion remains available in Profile settings.

The backend and review account will remain available throughout review. We have included the exact demo credentials and any requested video only in App Store Connect.

Thank you.

## Remaining owner gates before resubmission

- Rotate the database password and JWT secret because previous values existed in Git history; update secure hosting variables atomically.
- Confirm the moderation/support inbox received the test alert and is monitored by at least two trained people.
- Create/verify the non-admin review account and team data; enter credentials only in App Store Connect.
- Complete the physical iPhone/iPad matrix and attach truthful evidence.
- Obtain final legal approval for Terms, Community Guidelines, Privacy, and App Store privacy answers.
- Enter accurate Support and Privacy URLs, age rating, privacy nutrition labels, release notes, and review notes.
