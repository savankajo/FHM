# FHM Church App Store Submission

## Completed in the app

- In-app account deletion: Profile → Settings → Delete Account.
- Public Privacy Policy, Terms, Community Guidelines, Policies, and Support pages with the monitored contact `Media@fathersheartministry.ca`.
- Explicit zero-tolerance Terms/Community Guidelines agreement before registration or sign-in, with versioned acceptance records.
- Server-side text and poll filtering before publication. Voice messaging is not offered in this release.
- Team-chat reporting and immediate user blocking, with automatic safety reports on block and blocked messages filtered server-side.
- A deadline-ordered administrator queue with remove, warn, suspend, ban, restore, notification retry, and audit controls.
- Production is live at `https://fhmapp.netlify.app`; its scheduled moderation-escalation function is deployed.
- Chat membership authorization, 48-hour message expiry, safe-area layout, app icon and launch assets.
- iOS bundle ID: `com.savankajo.fhm`; display name: `FHMChurch`.
- Native APNs notifications for team messages, event invitations and two-hour reminders, live services, and newly published media, with category preferences and deep links.

## Required owner actions before submission

1. Confirm `Media@fathersheartministry.ca` is monitored by at least two trained people and received the privacy-safe test moderation alert.
2. The `20260831230000_app_store_guideline_1_2` and `20260901010000_harden_moderation_security_and_pending_voice` migrations have been applied to production. Re-run `npx prisma migrate status` immediately before release.
3. Rotate the database password and JWT secret because prior values existed in Git history, then update `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` in the secure hosting environment. Production now refuses the fallback JWT secret.
4. Create a non-admin App Review demo account that belongs to a team, and include credentials in Review Notes. Keep the backend available throughout review.
5. In App Store Connect, complete the privacy nutrition label from the actual production data flow. Expected declared data includes contact info (name, email, optional phone), user content (chat), identifiers (account ID), and product interaction (team/event/volunteer activity); mark data as linked to identity. Confirm against every production provider/SDK.
6. Provide screenshots showing real Home, Sermons/Podcasts, Events, Teams, Chat, and Profile screens—not only login or splash screens. Use fictional demo data.
7. Set the honest age rating based on all administrator-posted sermons, podcasts, linked videos, and chat content. Do not select the Kids Category without a separate children-privacy review.
8. Archive and test on physical iPhone and iPad: policy consent/decline, registration, sign-in/out, account deletion, every external link/media URL, calendar export, text/poll rejection, chat report/block/unblock, admin sanctions, offline/error states, rotation, safe areas, Dynamic Type, VoiceOver, and dark-mode contrast. Record results in `docs/APP_STORE_GUIDELINE_1_2.md`.
9. Confirm ownership/licenses for the logo, Unsplash imagery, sermon/podcast media, Bible translation text, and all screenshots.
10. Configure signing, version/build numbers, App Store category, description, keywords, copyright, Support URL, Privacy Policy URL, and review contact in App Store Connect.
11. Enable Push Notifications for the `com.savankajo.fhm` App ID, create an APNs signing key, and configure the five `APNS_*` environment variables in Netlify before uploading build 19.

## Suggested Review Notes

FHM Church is a church community app for public sermons, podcasts, Bible content, and events. Registered members can access assigned teams, volunteer schedules, event voting, and temporary text-and-poll team chat. Chat messages expire after 48 hours, and text and polls are filtered by the server before publication. Reviewers can report a message or block its sender from the three-dot safety menu on any incoming message. Blocks are immediate and automatically create a safety report. Administrators review the deadline-ordered Safety Reports queue and can remove content, warn, suspend, ban, or restore with an audit record. Account deletion is available in Profile settings. No purchases, subscriptions, advertising, or cross-app tracking are included.

Demo account: `[ADD EMAIL]` / `[ADD PASSWORD]`

To review member features: accept the current Terms and Community Guidelines, sign in, open Teams, select `[ADD TEAM]`, and open Team Chat. Open an incoming message’s three-dot menu to see Report and Block. Blocks can be managed at Profile → Blocked Users.

## 2026 rejection-cycle verified review notes

FHM Church is intentionally bilingual in English and Arabic; Arabic content uses RTL layout. Guests can access Home, Media, Bible, the public Teams directory, the public Calendar (including the weekly Saturday Meeting), privacy policy, and support without signing in. Members can access assigned team chat, schedules, private team events, RSVP, and notification history. Notifications cover team messages, event invitations and reminders, live services, and newly published media; each category can be disabled in Profile settings and permission is requested there in context. Sermons play inside the app without autoplay; the small provider link is an optional fallback. Account deletion is available under Profile → Account & Security. There are no purchases, subscriptions, advertising, or cross-app tracking.

Enter the verified demo credentials only in App Store Connect, never in this repository. To test member features: sign in, open Teams, select the assigned App Review Test Team, open Team Chat, then open Calendar and Notifications. The backend health check is `https://fhmapp.netlify.app/api/health`.
