# FHM UI Audit Progress

Last updated: 2026-08-27 (America/Vancouver)

## Complete task objective

Resolve Apple Guideline 4 – Design rejection by completing a frontend-only audit and responsive redesign of the FHM Capacitor iOS app for every supported iPhone and iPad size. The work includes an intentional iPad experience, a professional Articles redesign, local multi-verse Bible selection with ordered copy/share output, accessibility and appearance review, automated and device verification, release build, commit, push, build upload, App Review notes, and an exact final report.

## App Store rejection reference

- Submission ID: `d0084ef4-a463-478e-889e-f5cab7e821bc`
- Review date: 2026-08-26
- Review devices: iPhone 17 Pro Max and iPad Air 11-inch (M3)
- Guideline: 4 – Design
- Apple issue: “The app is not optimized to support all screen sizes or resolutions.”
- Full source request: `C:\Users\Admin\.codex\attachments\3db02cdd-2872-4147-a613-80dc751af5be\pasted-text.txt`
- Continuity requirements: `C:\Users\Admin\.codex\attachments\a02b805a-3d0f-427b-ab65-4fd224305355\pasted-text.txt`

## Non-negotiable requirements

- Preserve the app’s purpose, identity, content, roles, authentication, permissions, and useful behavior.
- Fix responsive layout across supported iPhone/iPad sizes, orientations, appearance modes, Dynamic Type, and iPad multitasking widths.
- Make iPad layouts intentional rather than stretched phone layouts.
- Redesign Articles list/detail states while preserving existing content and interfaces.
- Add accessible, local-only, multi-verse selection for consecutive and non-consecutive verses, ordered copy/share text, clear count, deselection, and cancel/clear behavior.
- Verify public sermons remain public and Tuesday/team content remains authorization-gated.
- Run relevant tests/builds, inspect logs, capture representative screenshots, and report honest gaps.
- Commit and push only intended changes after validation, then use the configured upload process without exposing credentials.
- Do not submit automatically for App Review unless existing project instructions explicitly authorize it.

## Backend protection

The backend must remain unchanged. Do not change database schemas or data, Prisma/Netlify migrations, RLS/security policies, authentication providers/rules, storage configuration, server/Edge Functions, API endpoints or contracts, backend environment variables, server permissions, media sources, or access-control logic. Existing backend files and contracts will be compared against the starting commit before completion.

## Repository baseline

- Framework: Next.js/React web frontend packaged for iOS with Capacitor (initial identification; details still being audited)
- Current branch: `agent/account-security-policies`
- Starting commit: `63a7c8343003f15fb5c8280d950d6a3405146522`
- Upstream: `origin/agent/account-security-policies`
- Existing worktree changes to preserve:
  - Modified: `src/app/articles/[id]/page.tsx`
  - Modified: `src/styles/globals.css`
  - Untracked: `.tmp-app-store-screenshots/`

## Milestones

1. **Project and repository inspection** — complete
2. **Supported-device and layout audit** — complete (available captures/static audit; Apple simulator matrix blocked on Windows)
3. **Responsive design system** — complete
4. **Global screen-size fixes** — complete
5. **Articles redesign** — complete
6. **Bible multi-verse selection** — complete
7. **Colors, Dark Mode, and accessibility** — complete
8. **Complete iPhone and iPad verification** — complete within Windows/browser capabilities; Xcode-only matrix documented
9. **Backend-change verification** — complete
10. **Release build** — web release build and Capacitor sync complete; native Xcode archive blocked on Windows
11. **Commit and push** — pending
12. **Build upload and final App Review report** — pending

## Completed milestones

### 1. Project and repository inspection

- Confirmed Next.js 14.1/React 18 frontend hosted by Netlify and presented in a Capacitor 8 remote-server iOS shell.
- Confirmed universal iPhone/iPad target, iOS 15 minimum, app version 1.0, Xcode project build number 2, bundle ID `com.savankajo.fhm`, all iPad orientations, and phone portrait plus both landscape orientations.
- Confirmed there is no checked-in GitHub/remote Apple build workflow. Existing release instructions require Xcode archive/upload on macOS.
- Audited route inventory, navigation, theme provider, major public/authenticated screens, media/Bible flows, and access-control boundaries.
- Verified public media filtering and private media filtering continue through `canSeeAudience`; Calendar queries expose public events plus authenticated team/invitation events; Teams queries only assigned teams for non-admin members; chat/API membership checks are server enforced.
- Audited and preserved the initial article/CSS diff and screenshot directory.

### 2. Supported-device and layout audit

- Inspected the existing 1284×2778 iPhone and 1640×2360 iPad capture sets, including Home, Media tabs, Article list, media detail, Bible, Teams, Calendar, and Account & Security.
- Reproduced the systemic rejection issue in the captures: the root `.container` and `.bottom-nav` are capped at 480px, leaving the entire app as a centered phone column on full-screen iPad.
- Identified missing tablet page composition, stretched single-column cards, large unused space, weak Articles hierarchy, fixed phone spacing, and inconsistent page-width rules.
- Identified Bible-specific issues: hard-coded dark palette, fixed bottom note sheet, single selected verse coupled to note editing, no ordered multi-select/copy/share workflow, limited selected-state semantics, and no tablet reading composition.
- Xcode and `xcrun simctl` are unavailable on this Windows host, so there are no installed Apple runtimes/simulators to enumerate here. Browser viewport/device emulation will cover layout categories; real Xcode simulator, Split View, Stage Manager, VoiceOver, archive, and upload remain macOS verification requirements.

### 3. Responsive design system

- Replaced the 480px root shell with a fluid 1280px-capped application shell and separate readable content widths.
- Added full-width bottom navigation for phones and narrow iPad windows plus a regular-width iPad/landscape navigation rail.
- Added safe-area-aware shell/nav padding, 44px minimum controls, 16px form inputs, visible keyboard focus, reduced-motion support, text wrapping, theme compatibility aliases, and enabled user zoom by removing `maximumScale: 1`.
- Added `aria-current="page"` to the active primary destination.

### 4. Global screen-size fixes

- Added intentional tablet compositions: two-column Home hero/verse layout, grid-based Media and recent content, two-column Calendar content, grid-based Teams, and profile master/detail composition.
- Added tablet/narrow-window breakpoints based on available width rather than device model.
- Verified no horizontal document overflow at 393×852, 820×1180, and 1180×820 browser viewports.

### 5. Articles redesign

- Added editorial intro, featured article treatment, responsive story grid, image/fallback journal artwork, content/access label, author/date metadata, summary truncation, and clear read affordance.
- Search now matches title, author, and summary; empty search and unpublished states use distinct copy.
- Article detail now has a readable 68-character line length, responsive serif typography, theme-aware body/summary, proper date metadata, image alternative text/fallback, and preserves existing PDF/in-app link behavior.
- Returning from detail reopens the Articles tab. Added accessible tab/panel relationships plus loading skeletons and retryable error states.

### 6. Bible multi-verse selection

- Added local-only multi-selection for consecutive/non-consecutive verses with tap and keyboard activation, individual deselection, clear/cancel, live selection count, ordered reference ranges, Copy, Share, and single-verse Note access.
- Selected verses use a checkmark, border, background, `aria-pressed`, focusability, and per-verse VoiceOver labels; selection announcements use an `aria-live` region.
- Copy/share output sorts biblical order regardless of selection order and formats compact ranges such as `John 3:16–18, 21 (NIV)`.
- Existing local annotations/highlights remain separate from selection state. Selection clears when changing chapter/version and survives orientation/layout changes while the chapter remains mounted.
- Added focused tests for normalization, toggle/deselect, range formatting, and copy text.

### 7. Colors, Dark Mode, and accessibility

- Converted Bible and redesigned Articles surfaces from hard-coded dark colors to theme variables and verified Light/Dark rendering through the Settings UI.
- Raised dark muted-text contrast, added theme-aware legacy utility aliases, improved alert contrast, enabled pinch zoom, respected reduced motion, and added visible focus rings.
- Repaired shared input label/error associations, account-security form labels, global-search naming, poll-composer labels, and Verse of the Day Like/Share semantics and behavior.
- Replaced all warned raw `<img>` usage with the project’s existing unoptimized Next Image configuration. Current lint is clean.

### 8. Complete iPhone and iPad verification

- Ran an eight-route matrix (Home, Articles, Bible, Teams, Calendar, Login, Register, Search) at 320×568, 393×852, 430×932, 744×1133, 820×1180, 1180×820, and 1366×1024: 56/56 cases passed with visible navigation, no application error, and no document-level horizontal overflow.
- Verified bottom navigation at phone/narrow iPad widths and the navigation rail at regular landscape/large-iPad widths.
- Verified Light and Dark through the Settings UI, Articles list/detail, Bible single/consecutive/non-consecutive selection, ordered Copy, Clear/live announcements, guest access, and public embedded sermon playback.
- Captured ten representative final screenshots in `.tmp-fhm-ui-audit/`, including phone/tablet, portrait/landscape, Split View, Articles list/detail, Bible single/multiple selection, and Light/Dark.
- Browser logs after the clean preview restart contained no current application runtime errors; an earlier missing-chunk error was caused solely by running `next build` against the still-open dev server and was cleared by restarting the preview.
- Authenticated reviewer/team permutations, Apple simulator/device safe areas, real Dynamic Type/VoiceOver, native keyboards, Slide Over/Stage Manager, and native rotation remain macOS/device checks.

### 9. Backend-change verification

- Compared protected backend paths with starting commit `63a7c8343003f15fb5c8280d950d6a3405146522`; no Prisma, migration, Netlify/database, API route, authentication, audience/access-control, environment, or backend-contract file changed.
- Guest access continues to show public sermons/events, gate Teams behind sign-in, and redirect Profile to Login. Private authorization code and server-enforced team/chat permissions are untouched.
- No dependencies, database migrations, data, media sources, or server interfaces were added or changed.

### 10. Release build

- Incremented the Xcode project build number from the stale local value 2 to 17 for both Debug and Release, matching the successor to rejected build 16; marketing version remains 1.0.
- `npm run lint`, `npm run test:verse-selection`, and `npm run build` pass; the production build compiles and type-checks all 65 routes.
- `npx cap sync ios` passes and synchronizes the existing Capacitor Browser plugin. No plugin/config output changed beyond the intended Xcode build number.
- Native Xcode archive/validation cannot be created on Windows and no remote Apple build workflow exists in the repository.

## Current milestone

Milestone 11: Commit and push. Run the final clean validation/diff audit, commit only the intended frontend/native-build-number/docs files, push the existing branch, then perform the linked Netlify preview and production deploy. Native upload remains a precisely documented external blocker.

## Files changed by this task

- `docs/FHM_UI_AUDIT_PROGRESS.md` — durable audit checkpoint (created).
- `src/app/layout.tsx` — accessible responsive app shell/viewport.
- `src/components/layout/bottom-nav.tsx` — active-page semantics.
- `src/styles/globals.css` — shared responsive system, tablet layouts, Articles/Bible themes, focus/contrast/states.
- `src/app/sermons-and-podcasts/media-client.tsx` — redesigned Articles tab and accessible tab state.
- `src/app/sermons-and-podcasts/loading.tsx`, `error.tsx` — Media route states.
- `src/app/articles/[id]/page.tsx`, `loading.tsx`, `error.tsx` — redesigned article detail and route states (includes preserved pre-existing detail work).
- `src/app/bible/reader.tsx` — adaptive reader and multi-verse selection.
- `src/app/bible/verse-selection.ts`, `verse-selection.test.ts` — isolated selection formatting logic/tests.
- `src/components/home/verse-of-day.tsx` — functional accessible favorite/share actions.
- `src/components/ui/input.tsx`, `global-search.tsx` — accessible shared inputs.
- `src/app/profile/privacy/privacy-form.tsx` — explicit label associations.
- `src/app/chat/[teamId]/chat-room.tsx` — accessible poll composer.
- `src/app/page.tsx` and three admin media forms — warned raw image replacement.
- `package.json` — focused selection test command.
- `ios/App/App.xcodeproj/project.pbxproj` — build number 17 for the successor to rejected build 16.
- `docs/FHM_UI_AUDIT_REPORT.md` — durable final findings, matrix, screenshots, self-test instructions, risks, and App Review notes.

Pre-existing worktree changes remain unattributed until inspected and will not be overwritten.

## Design decisions

- Preserve the six primary destinations but present them as bottom navigation on phones/narrow Split View and as a compact navigation rail at regular iPad widths.
- Use one fluid universal shell with capped readable feature regions instead of device-model checks.
- Compose Home, Media/Articles, Calendar, Teams, Profile, and Bible intentionally at tablet widths using grids/columns; retain linear phone flow below the content breakpoint.
- Use theme variables for all redesigned surfaces, maintain orange as the identity/accent color, and add shape/border/checkmark affordances where state must not depend on color alone.
- Keep Bible selection state local and separate from the existing local annotation store.

## Commands already run

- `git status --short --branch`
- `git branch --show-current`
- `git rev-parse HEAD`
- `git log -5 --oneline --decorate`
- `git remote -v`
- `rg --files` (project inventory)
- Top-level directory listing
- Project/release/iOS configuration inspection
- Route, layout, CSS risk, and access-control searches
- Existing screenshot dimension and visual inspection
- `npm run lint`
- `npm run build`
- `npm run review:preflight`
- Responsive in-app browser checks at 393×852, 820×1180, and 1180×820
- Live Articles and Bible interaction checks
- `npm run test:verse-selection`
- Full 56-case browser viewport/route matrix
- Guest access and public media playback browser smoke tests
- Bible single/multiple selection, Copy, deselect/clear browser checks
- Final screenshot capture at ten representative configurations
- Protected backend-path diff against the starting commit
- `npx cap sync ios`
- `npx netlify status`

## Test and build results

- Baseline `npm run lint`: PASS with five pre-existing `@next/next/no-img-element` warnings (three admin preview forms, Home logo, Article detail image).
- Baseline `npm run build`: PASS; all 65 pages generated/compiled and type checking succeeded.
- Baseline `npm run review:preflight`: database PASS; overall FAIL only because App Review credentials were intentionally not supplied in environment variables.
- Focused verse-selection tests: PASS (3/3).
- Post-feature `npm run build`: PASS after resolving a TypeScript target compatibility issue; all 65 routes compiled/generated.
- Current `npm run lint`: PASS with no warnings or errors after replacing five warned raw images.
- Browser UI: Articles responsive featured layout PASS at 820×1180; Bible two-column book grid and Light Mode PASS at 820×1180; Bible multi-select/toolbar/no-overflow PASS at 393×852 and 820×1180.
- Responsive route matrix: PASS 56/56 across seven viewport categories and eight major routes; zero app errors and zero document-level horizontal overflows.
- Guest permissions: PASS for public Media/Event access, Teams sign-in gate, and Profile-to-Login redirect. Authenticated private-team permutations are untested without reviewer credentials.
- Public media playback: PASS; video preview opened a live embedded YouTube player with direct fallback.
- Bible browser actions: PASS for single, consecutive, and non-consecutive ordered selection, Copy range, Clear, keyboard selection, count, and selected-state semantics.
- Capacitor iOS sync: PASS.
- Backend protected-path diff: PASS, empty.

## Known failures or constraints

- The named `$codebase-design` skill is not installed in this session; repository-native conventions are being used as the fallback.
- Xcode and Apple simulators are unavailable on this Windows host. No configured remote Apple build/upload workflow was found.
- The initial worktree is not clean; existing article/CSS edits and screenshots must be preserved and audited.
- Xcode project build number is now 17, but archive validation and upload require macOS/Xcode/signing.
- App Review preflight requires credentials supplied out-of-repository; they are not present in this execution environment and must never be printed or committed.
- A pre-existing tracked deployment helper contains hard-coded secrets. It remains unchanged under the backend/environment freeze; rotate those credentials and remove the helper in a separate security change.

## Remaining tasks

- Run final clean validation after stopping the development server.
- Commit and push intended files only; leave pre-existing/untracked screenshot artifacts uncommitted.
- Run Netlify preview, inspect it, then publish production if successful.
- Report native Xcode/TestFlight upload as blocked on this Windows host unless an external configured path appears.
- Update this checkpoint and the final report with commit, push, deploy URLs/status, and final diff state.

## Exact next action

Stop the local dev server, run the final lint/test/build/diff checks, stage only intended files, commit, push `agent/account-security-policies`, then use the authenticated linked Netlify project for preview and production deploys.

## Publishing status

- Commit: pending final validation.
- Push: pending final validation.
- Web release build: PASS.
- Capacitor sync: PASS; Xcode build number 17.
- Netlify authentication/link: confirmed for project `fhmapp`; deploy pending final validation.
- iOS archive/TestFlight upload: blocked on Windows because Xcode/codesigning/Transporter and a remote Apple workflow are unavailable.
- App Review submission: not authorized and not attempted.
