# FHM App Store UI Audit Report

Date: 2026-08-27  
Branch: `agent/account-security-policies`  
Starting commit: `63a7c8343003f15fb5c8280d950d6a3405146522`  
App version/build: `1.0 (17)`

## Outcome

The universal Capacitor/Next.js interface has been redesigned to use the available iPhone, iPad, and iPad multitasking width instead of rendering the entire product inside a 480px phone column. The navigation now adapts from a safe-area-aware bottom bar to an iPad navigation rail, major pages gain intentional tablet grids/columns, Articles has an editorial list/detail experience, and the Bible supports accessible local multi-verse selection.

The production web build, lint, focused Bible tests, Capacitor iOS sync, a 56-case responsive route matrix, guest-access checks, media playback, Articles, Bible selection/copy/clear, and Light/Dark appearance checks passed. Apple simulator, archive, signing, TestFlight upload, real VoiceOver, and system Dynamic Type verification require macOS/Xcode and remain explicitly outside this Windows host's capabilities.

## Problems found and fixes

- The root application shell and bottom navigation were capped at 480px, producing black gutters and a centered phone UI on iPad. The shell is now fluid and capped at 1280px, with content-specific readable widths.
- Full-screen iPad pages were stretched single-column phone layouts. Home, Articles/Media, Calendar, Teams, Profile, and Bible now use adaptive grids or columns; the primary navigation becomes a rail at regular iPad/landscape widths.
- Safe areas and compact windows were inconsistently handled. Shell and navigation padding now use safe-area insets, controls have a 44px minimum target, inputs remain at least 16px, and narrow Split View retains bottom navigation.
- Pinch zoom was disabled. The restrictive maximum-scale viewport setting was removed.
- Several shared controls lacked explicit labels or state semantics. Input/error associations, search naming, poll labels, privacy labels, active navigation, Like/Share state, and Bible selection semantics were repaired.
- Five raw-image lint warnings were removed using the project's unoptimized Next Image configuration.
- Articles lacked editorial hierarchy, tablet composition, missing-image treatment, and route states. The redesign adds a journal intro, featured layout, metadata, summaries, fallback artwork, search, readable detail typography, skeletons, retryable errors, and correct return-to-tab behavior.
- The Bible reader was hard-coded dark and limited selection to one verse/note context. It is now theme-aware and supports ordered consecutive/non-consecutive local selection, individual deselection, clear, Copy, Share, and a single-verse Note action.

## Articles redesign

- Media tabs have explicit tablist/tab/tabpanel relationships and support deep linking through `?tab=articles`.
- Articles use an editorial “Father's Heart Journal” heading, a featured story on tablet, compact cards on phones, author/date/summary metadata, and a clear read affordance.
- Search includes title, author, and summary. Empty search, no-content, loading, and error states have distinct accessible messaging.
- Missing images use branded FHM Journal fallback art. Existing images retain responsive cropping and alternative text.
- Detail pages use constrained readable line length, responsive serif display typography, theme-aware body copy, semantic dates, and preserved PDF/link behavior.

## Bible multi-verse selection

- Tap or keyboard Enter/Space toggles any verse in the open chapter; tapping a selected verse deselects it.
- Selection state is frontend-only and clears when the book/chapter/version changes.
- Consecutive and non-consecutive verses are normalized into biblical order and formatted as compact ranges, for example `1–2, 5`.
- Copy and Share combine the selected verse text with book, chapter, verse range, and translation. A browser clipboard fallback is included when native sharing is unavailable.
- The toolbar displays count, range, Copy, Share, Clear, and Note for a single selection.
- Each selected verse has a checkmark, outline, background, `aria-pressed`, keyboard focus, and a descriptive selected/deselected label. Live status announces changes.
- Focused tests cover normalization, toggle/deselect behavior, range formatting, and ordered copy text.

## Visual system and accessibility

- The orange identity color remains the primary accent, now paired with theme-aware surfaces and borders.
- Muted text in dark appearance was raised for readability; light and dark surfaces use shared semantic variables.
- Selection and active states use shape, outline, text/checkmarks, and color so color is never the only signal.
- Visible `:focus-visible` rings, reduced-motion support, text wrapping, enabled zoom, logical landmark/tab semantics, and 44px targets were added globally.
- Browser accessibility-tree inspection confirmed labels, pressed/selected state, logical focus order, and live selection announcements. Real VoiceOver remains a required macOS/device check.

## Verification matrix

Eight routes were exercised at each of seven viewport categories: Home, Articles, Bible, Teams, Calendar, Login, Register, and Search. All 56 cases had visible navigation, no application error, and no document-level horizontal overflow.

| Category | Browser viewport | Orientation / purpose | Result |
|---|---:|---|---|
| Small supported phone | 320×568 | Portrait / minimum width | Pass |
| Standard phone | 393×852 | Portrait | Pass |
| Large/Max phone | 430×932 | Portrait / iPhone 17 Pro Max approximation | Pass |
| Narrow iPad window | 744×1133 | Portrait Split View / resizable window | Pass |
| iPad Air 11-inch approximation | 820×1180 | Portrait | Pass |
| iPad Air 11-inch approximation | 1180×820 | Landscape | Pass |
| Large iPad | 1366×1024 | Landscape | Pass |

Additional manual browser checks:

- Light and Dark themes applied through the in-app Settings UI: Pass.
- Articles phone/tablet list, missing-image fallback, search structure, and detail/PDF: Pass.
- Bible single, consecutive, and non-consecutive selection (`1–2, 5`): Pass.
- Bible deselect logic: Pass in focused test; direct selection toggles passed in browser.
- Bible Copy ordered range and Clear/live announcement: Pass.
- Guest Media shows the public Saturday collection and public sermon details: Pass.
- Guest Teams shows sign-in instead of assigned/private teams: Pass.
- Guest Profile redirects to Login: Pass.
- Guest Calendar shows the public Saturday meeting and explains team-event sign-in: Pass.
- Public sermon preview opens the embedded YouTube player: Pass.
- Reviewer-authenticated and unauthorized-team permutations: Not run because reviewer credentials are intentionally absent.

## Automated and build results

- `npm run lint`: Pass, zero warnings/errors.
- `npm run test:verse-selection`: Pass, 3/3 tests.
- `npm run build`: Pass, 65 routes compiled/generated and type checked.
- `npm run review:preflight`: Database checks pass; overall preflight stops only because reviewer credentials are not supplied in the environment.
- `npx cap sync ios`: Pass; one existing Capacitor Browser plugin synchronized.
- Backend diff against the starting commit: empty for Prisma, Netlify/database, API, authentication, audience/access-control, migration, and environment paths.

## Screenshot set

The final browser-emulated screenshots are local, uncommitted audit artifacts in `.tmp-fhm-ui-audit/`:

1. `01-small-phone-home-dark.png`
2. `02-standard-phone-articles-dark.png`
3. `03-large-phone-bible-multi-dark.png`
4. `04-ipad-split-calendar-dark.png`
5. `05-ipad-air-articles-dark.png`
6. `06-ipad-air-bible-multi-light.png`
7. `07-ipad-air-calendar-landscape-dark.png`
8. `08-large-ipad-home-landscape-dark.png`
9. `09-ipad-air-article-detail-dark.png`
10. `10-standard-phone-bible-single-dark.png`

The pre-redesign `.tmp-app-store-screenshots/` directory was preserved and not committed.

## Exact macOS/Xcode self-test instructions

1. Check out `agent/account-security-policies`, install dependencies with `npm ci`, then run `npm run lint`, `npm run test:verse-selection`, and `npm run build`.
2. Run `npx cap sync ios`, then `npx cap open ios`. In Xcode select the `App` scheme and confirm version/build `1.0 (17)`.
3. In **Product → Destination**, test the smallest installed iPhone, a standard iPhone, iPhone 17 Pro Max, a smaller iPad, iPad Air 11-inch (M3), and the largest installed iPad Pro. Use the closest installed equivalent if an exact runtime is unavailable.
4. Use the Simulator **Device → Rotate Left/Right** commands and test every orientation allowed by the target. Rotate while Articles, an article detail, Calendar, and an active Bible selection are open.
5. Use Simulator **Features → Toggle Appearance** and also Profile → Theme in the app to test Light and Dark. Confirm system bars and the web UI agree.
6. In the simulated device, open **Settings → Accessibility → Display & Text Size → Larger Text**, enable Larger Accessibility Sizes, and test the default plus at least two larger sizes. Also use Xcode's Environment Overrides while debugging. Check tabs, long article titles, Arabic Bible text, forms, toolbar wrapping, and the bottom/side navigation.
7. Enable VoiceOver at **Settings → Accessibility → VoiceOver** (or use Accessibility Inspector). Swipe through primary navigation, Articles tabs/cards, Bible translations, verses, selection toolbar, forms, errors, and dialogs. Confirm selected verses announce selected/deselected state and count changes.
8. On iPad, use the multitasking control to place the app in narrow and wide Split View, Slide Over where available, and Stage Manager. Resize continuously with Articles, Calendar, Teams, and the Bible open; verify the bottom bar changes to/from the navigation rail without losing content or Bible selection.
9. For Articles: open Media → Articles, search by title/author/summary, open the featured article, scroll/read the PDF or body, test the external/in-app link, rotate, then use Back and confirm the Articles tab remains selected.
10. For Bible: open a book/chapter, select one verse, select consecutive verses, add a non-consecutive verse, deselect one, Copy, Share, open Note for a single verse, Clear, switch chapter/version, rotate, and repeat in Light/Dark and an iPad narrow window.
11. Test guest access while signed out: public Saturday sermons and events must be visible; Tuesday/team/private content must not be visible; Teams must request sign-in; Profile must route to Login. Then sign in with an authorized reviewer/member and a member outside the target team to verify both allowed and denied states.
12. Start at least one public video and one authorized private video, confirm the embedded player loads, background/rotation behavior is acceptable, and the direct YouTube fallback works.
13. In Xcode, inspect the debug console for WebKit errors, crashes, signing issues, rotation warnings, and constraint warnings. Finally choose **Product → Archive**, validate the archive, and upload it to App Store Connect/TestFlight using the configured signing team.

## Remaining risks and external blockers

- Windows has no Xcode, `xcrun simctl`, Apple runtimes, codesigning identities, or Transporter; native enumeration, archive, validation, and TestFlight upload cannot be performed here.
- Real safe-area hardware behavior, software-keyboard presentation, system Dynamic Type, VoiceOver gestures, Split View/Slide Over/Stage Manager, and rotation must be confirmed on macOS/device using the steps above.
- Authenticated reviewer/team permission checks need credentials supplied outside the repository.
- A pre-existing tracked deployment helper contains hard-coded deployment secrets. It was not changed because backend/environment changes were prohibited, but the credentials should be rotated and the helper removed from version control in a dedicated security change.

## App Review notes

Version 1.0 build 17 replaces the fixed-width phone shell with adaptive layouts across all supported iPhone and iPad widths. Full-screen iPad now uses intentional grids/columns and a navigation rail; compact and Split View windows use a safe-area-aware bottom navigation. Articles were redesigned for readable phone/tablet presentation, and the Bible now has accessible local multi-verse selection. We verified the public UI across seven phone/tablet viewport categories in portrait, landscape, and representative Split View widths, with no document overflow or clipped primary navigation. Public/private access rules and backend contracts were not changed.

## Release status

- Commit: pending final validation.
- Push: pending final validation.
- Netlify publish: pending final validation.
- iOS build upload: blocked on this Windows host pending macOS/Xcode archive and signing.
- App Review submission: not attempted; not authorized for automatic submission.
