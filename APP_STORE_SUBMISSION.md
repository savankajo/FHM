# FHM Church App Store Submission

## Completed in the app

- In-app account deletion: Profile → Settings → Delete Account.
- Public Privacy Policy, Terms/Community Standards, and Support pages.
- Team-chat reporting and user blocking, with blocked messages filtered server-side.
- Chat length validation, membership authorization, 48-hour message expiry, safe-area layout, app icon and launch assets.
- iOS bundle ID: `com.savankajo.fhm`; display name: `FHMChurch`.

## Required owner actions before submission

1. Replace `privacy@fhmchurch.ca` and `support@fhmchurch.ca` if those inboxes are not monitored. Publish `/privacy` and `/support` at stable HTTPS URLs.
2. Apply the `20260710000000_app_store_safety` database migration to production.
3. Set strong production `JWT_SECRET`, `DATABASE_URL`, and `DIRECT_URL` values. Never ship with the fallback JWT secret.
4. Create a non-admin App Review demo account that belongs to a team, and include credentials in Review Notes. Keep the backend available throughout review.
5. In App Store Connect, complete the privacy nutrition label from the actual production data flow. Expected declared data includes contact info (name, email, optional phone), user content (chat), identifiers (account ID), and product interaction (team/event/volunteer activity); mark data as linked to identity. Confirm against every production provider/SDK.
6. Provide screenshots showing real Home, Sermons/Podcasts, Events, Teams, Chat, and Profile screens—not only login or splash screens. Use fictional demo data.
7. Set the honest age rating based on all administrator-posted sermons, podcasts, linked videos, and chat content. Do not select the Kids Category without a separate children-privacy review.
8. Archive and test on physical iPhone and iPad: registration, sign-in/out, account deletion, every external link/media URL, calendar export, chat report/block, offline/error states, rotation, safe areas, Dynamic Type, VoiceOver, and dark-mode contrast.
9. Confirm ownership/licenses for the logo, Unsplash imagery, sermon/podcast media, Bible translation text, and all screenshots.
10. Configure signing, version/build numbers, App Store category, description, keywords, copyright, Support URL, Privacy Policy URL, and review contact in App Store Connect.

## Suggested Review Notes

FHM Church is a church community app for public sermons, podcasts, Bible content, and events. Registered members can access assigned teams, volunteer schedules, event voting, and temporary team chat. Chat messages expire after 48 hours. Reviewers can report a message or block its sender directly beneath any incoming message. Account deletion is available at Profile → Settings → Delete Account and permanently removes the member record and related data. No purchases, subscriptions, advertising, or cross-app tracking are included.

Demo account: `[ADD EMAIL]` / `[ADD PASSWORD]`

To review member features: sign in, open Teams, select `[ADD TEAM]`, and open Team Chat.
