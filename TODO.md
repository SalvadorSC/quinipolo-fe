- Make a dashboard for each league.
  - Has to display: - Leaderboard button - DONE Quinipolos to answer - DONE Quinipolos to Correct (if the user is the moderator of this specific league)
  <!-- - Make screen to show quinipolo correction results. Has to generate a message and must have options to share it automatically. -->
- Make the teams schema better. It shouldn't be all in the same array. Each should be an entry, with information such as SPORT, LEAGUE (optional) and SEX.
- Make stronger login with JWT.
<!-- - Fix handleCloseFeedback -->
- Chequear el QR code a ver si va.
- Fix pete al hacer clic en una opción seleccionada en la corrección
  - Comprobar comportamiento en el formulario de respuesta.
- Add date to Quinipolo corrected message.
- Stop using ANTd and use shadcn instead for date handling.

TO DO:

- check the acceptance or declining of petitions for leagues.
- check joining a league if it's private
- check joinign a league if it's public
- Check all the translations, at least in spanish.
- Update all instances of SetFeedback as I mostly missed them in regards to i18n
- Make date picker responsive to theme changes by adding theme-specific styles and configuration

Extra TO DO:

Future features (from League Info & Edit flow):

- Edit/add league photo in the edit modal (image upload and update)
- Archive League action
- Kick Participant action
- Backend API for updating moderator roles (currently using optimistic updates)
- Make a way to create quinipolos at the same time for all leagues managed by the quinipolo team

COMPLETED:

- ✅ check the creating of a league. (COMPLETED - New Stripe + Supabase implementation)
- ✅ STRIPE implementation from scratch if possible, using SUPABASE. (COMPLETED)
- ✅ Password reset flow implementation (COMPLETED - Full flow with email, reset page, and environment-aware redirects)
- ✅ Do a user profile tab.
  (check if it works) Give option to change password.
