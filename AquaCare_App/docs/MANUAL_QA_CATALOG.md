# AquaCare Manual QA Catalog

This catalog records repeatable exploratory checks for the AquaCare Flutter app.
It is documentation only: completing an item requires a suitable test account,
device, backend fixture, and environment configuration.

## How to Use This Catalog

1. Record the app version, platform, device, account role, and backend environment.
2. Run the relevant cases after changes to a screen, service, model, or shared widget.
3. Capture evidence for failures and note whether the issue is reproducible.
4. Treat the expected result as guidance; product requirements remain authoritative.

## Test Cases

## Onboarding

### QA-001 — Initial rendering
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Allow the screen to render without interacting while reviewing the onboarding pages and progress controls.
- Expected: Content settles without exceptions, clipped controls, overlapping text, or unexpected layout movement.

### QA-002 — Loading state
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Observe the interface while its first data request is pending while reviewing the onboarding pages and progress controls.
- Expected: A clear loading state appears and interactive controls do not submit incomplete data.

### QA-003 — Empty data
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Use an account or fixture with no records for this area while reviewing the onboarding pages and progress controls.
- Expected: An understandable empty state appears without fake values, broken spacing, or dead-end navigation.

### QA-004 — Slow network
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Throttle the connection and repeat the primary action while reviewing the onboarding pages and progress controls.
- Expected: The interface remains responsive and communicates that work is still in progress.

### QA-005 — Offline behavior
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Disable network access immediately before the primary action while reviewing the onboarding pages and progress controls.
- Expected: Failure is explained clearly and the app remains usable enough to retry or navigate away.

### QA-006 — Server error
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Return a controlled server error for the primary request while reviewing the onboarding pages and progress controls.
- Expected: A safe error message appears without exposing secrets, stack traces, or raw response bodies.

### QA-007 — Retry path
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Cause one request to fail, restore the connection, and use retry while reviewing the onboarding pages and progress controls.
- Expected: The request succeeds once, stale errors disappear, and duplicate records are not created.

### QA-008 — Repeated tap
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Tap the primary action several times in quick succession while reviewing the onboarding pages and progress controls.
- Expected: Only one logical action is performed and progress feedback prevents accidental duplicates.

### QA-009 — Portrait rotation
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Rotate away from portrait and back while the screen is open while reviewing the onboarding pages and progress controls.
- Expected: State is preserved and the restored portrait layout has no overflow or missing controls.

### QA-010 — Small display
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Render at the smallest supported phone dimensions while reviewing the onboarding pages and progress controls.
- Expected: Essential content remains readable and reachable by scrolling without horizontal overflow.

### QA-011 — Large text
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Set the operating-system text scale to a large accessibility value while reviewing the onboarding pages and progress controls.
- Expected: Important labels remain understandable and actions remain visible and tappable.

### QA-012 — Keyboard handling
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Focus each editable field and move through the form using the keyboard while reviewing the onboarding pages and progress controls.
- Expected: Focused fields stay visible and submission or dismissal does not leave the layout obstructed.

### QA-013 — Back navigation
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Change local state and invoke the platform back action while reviewing the onboarding pages and progress controls.
- Expected: Navigation returns to the expected screen without exiting unexpectedly or corrupting state.

### QA-014 — Background resume
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Send the app to the background during use and resume it while reviewing the onboarding pages and progress controls.
- Expected: The screen restores safely and refreshes only data that may have become stale.

### QA-015 — Manual refresh
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Use the available refresh action after changing remote data while reviewing the onboarding pages and progress controls.
- Expected: Current values replace stale values without duplicating cards, rows, alerts, or messages.

### QA-016 — Rapid navigation
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Navigate into and away from the area repeatedly while requests are active while reviewing the onboarding pages and progress controls.
- Expected: Disposed screens do not update, crash, flash stale content, or leak visible progress indicators.

### QA-017 — Data labels
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Review normal, long, zero, negative, and missing display values while reviewing the onboarding pages and progress controls.
- Expected: Labels use clear units and fallbacks while long values wrap or truncate intentionally.

### QA-018 — Touch targets
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Use each icon button and compact control near the edge of its hit area while reviewing the onboarding pages and progress controls.
- Expected: Targets respond reliably without triggering neighboring controls or requiring pixel-perfect taps.

### QA-019 — Contrast and state
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Compare enabled, disabled, selected, warning, and error appearances while reviewing the onboarding pages and progress controls.
- Expected: Every state is distinguishable by more than color alone and text remains legible.

### QA-020 — Session recovery
- Setup: Start from a fresh installation at the onboarding flow.
- Verify: Expire or revoke the session before returning to this area while reviewing the onboarding pages and progress controls.
- Expected: Protected data is hidden and the user is guided to authenticate again without an infinite loop.

## Authentication

### QA-021 — Initial rendering
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Allow the screen to render without interacting while reviewing the email, password, and sign-in controls.
- Expected: Content settles without exceptions, clipped controls, overlapping text, or unexpected layout movement.

### QA-022 — Loading state
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Observe the interface while its first data request is pending while reviewing the email, password, and sign-in controls.
- Expected: A clear loading state appears and interactive controls do not submit incomplete data.

### QA-023 — Empty data
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Use an account or fixture with no records for this area while reviewing the email, password, and sign-in controls.
- Expected: An understandable empty state appears without fake values, broken spacing, or dead-end navigation.

### QA-024 — Slow network
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Throttle the connection and repeat the primary action while reviewing the email, password, and sign-in controls.
- Expected: The interface remains responsive and communicates that work is still in progress.

### QA-025 — Offline behavior
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Disable network access immediately before the primary action while reviewing the email, password, and sign-in controls.
- Expected: Failure is explained clearly and the app remains usable enough to retry or navigate away.

### QA-026 — Server error
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Return a controlled server error for the primary request while reviewing the email, password, and sign-in controls.
- Expected: A safe error message appears without exposing secrets, stack traces, or raw response bodies.

### QA-027 — Retry path
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Cause one request to fail, restore the connection, and use retry while reviewing the email, password, and sign-in controls.
- Expected: The request succeeds once, stale errors disappear, and duplicate records are not created.

### QA-028 — Repeated tap
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Tap the primary action several times in quick succession while reviewing the email, password, and sign-in controls.
- Expected: Only one logical action is performed and progress feedback prevents accidental duplicates.

### QA-029 — Portrait rotation
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Rotate away from portrait and back while the screen is open while reviewing the email, password, and sign-in controls.
- Expected: State is preserved and the restored portrait layout has no overflow or missing controls.

### QA-030 — Small display
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Render at the smallest supported phone dimensions while reviewing the email, password, and sign-in controls.
- Expected: Essential content remains readable and reachable by scrolling without horizontal overflow.

### QA-031 — Large text
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Set the operating-system text scale to a large accessibility value while reviewing the email, password, and sign-in controls.
- Expected: Important labels remain understandable and actions remain visible and tappable.

### QA-032 — Keyboard handling
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Focus each editable field and move through the form using the keyboard while reviewing the email, password, and sign-in controls.
- Expected: Focused fields stay visible and submission or dismissal does not leave the layout obstructed.

### QA-033 — Back navigation
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Change local state and invoke the platform back action while reviewing the email, password, and sign-in controls.
- Expected: Navigation returns to the expected screen without exiting unexpectedly or corrupting state.

### QA-034 — Background resume
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Send the app to the background during use and resume it while reviewing the email, password, and sign-in controls.
- Expected: The screen restores safely and refreshes only data that may have become stale.

### QA-035 — Manual refresh
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Use the available refresh action after changing remote data while reviewing the email, password, and sign-in controls.
- Expected: Current values replace stale values without duplicating cards, rows, alerts, or messages.

### QA-036 — Rapid navigation
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Navigate into and away from the area repeatedly while requests are active while reviewing the email, password, and sign-in controls.
- Expected: Disposed screens do not update, crash, flash stale content, or leak visible progress indicators.

### QA-037 — Data labels
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Review normal, long, zero, negative, and missing display values while reviewing the email, password, and sign-in controls.
- Expected: Labels use clear units and fallbacks while long values wrap or truncate intentionally.

### QA-038 — Touch targets
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Use each icon button and compact control near the edge of its hit area while reviewing the email, password, and sign-in controls.
- Expected: Targets respond reliably without triggering neighboring controls or requiring pixel-perfect taps.

### QA-039 — Contrast and state
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Compare enabled, disabled, selected, warning, and error appearances while reviewing the email, password, and sign-in controls.
- Expected: Every state is distinguishable by more than color alone and text remains legible.

### QA-040 — Session recovery
- Setup: Open the sign-in screen with a signed-out account.
- Verify: Expire or revoke the session before returning to this area while reviewing the email, password, and sign-in controls.
- Expected: Protected data is hidden and the user is guided to authenticate again without an infinite loop.

## Password recovery

### QA-041 — Initial rendering
- Setup: Open the forgot-password or reset-password flow.
- Verify: Allow the screen to render without interacting while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Content settles without exceptions, clipped controls, overlapping text, or unexpected layout movement.

### QA-042 — Loading state
- Setup: Open the forgot-password or reset-password flow.
- Verify: Observe the interface while its first data request is pending while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: A clear loading state appears and interactive controls do not submit incomplete data.

### QA-043 — Empty data
- Setup: Open the forgot-password or reset-password flow.
- Verify: Use an account or fixture with no records for this area while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: An understandable empty state appears without fake values, broken spacing, or dead-end navigation.

### QA-044 — Slow network
- Setup: Open the forgot-password or reset-password flow.
- Verify: Throttle the connection and repeat the primary action while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: The interface remains responsive and communicates that work is still in progress.

### QA-045 — Offline behavior
- Setup: Open the forgot-password or reset-password flow.
- Verify: Disable network access immediately before the primary action while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Failure is explained clearly and the app remains usable enough to retry or navigate away.

### QA-046 — Server error
- Setup: Open the forgot-password or reset-password flow.
- Verify: Return a controlled server error for the primary request while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: A safe error message appears without exposing secrets, stack traces, or raw response bodies.

### QA-047 — Retry path
- Setup: Open the forgot-password or reset-password flow.
- Verify: Cause one request to fail, restore the connection, and use retry while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: The request succeeds once, stale errors disappear, and duplicate records are not created.

### QA-048 — Repeated tap
- Setup: Open the forgot-password or reset-password flow.
- Verify: Tap the primary action several times in quick succession while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Only one logical action is performed and progress feedback prevents accidental duplicates.

### QA-049 — Portrait rotation
- Setup: Open the forgot-password or reset-password flow.
- Verify: Rotate away from portrait and back while the screen is open while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: State is preserved and the restored portrait layout has no overflow or missing controls.

### QA-050 — Small display
- Setup: Open the forgot-password or reset-password flow.
- Verify: Render at the smallest supported phone dimensions while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Essential content remains readable and reachable by scrolling without horizontal overflow.

### QA-051 — Large text
- Setup: Open the forgot-password or reset-password flow.
- Verify: Set the operating-system text scale to a large accessibility value while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Important labels remain understandable and actions remain visible and tappable.

### QA-052 — Keyboard handling
- Setup: Open the forgot-password or reset-password flow.
- Verify: Focus each editable field and move through the form using the keyboard while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Focused fields stay visible and submission or dismissal does not leave the layout obstructed.

### QA-053 — Back navigation
- Setup: Open the forgot-password or reset-password flow.
- Verify: Change local state and invoke the platform back action while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Navigation returns to the expected screen without exiting unexpectedly or corrupting state.

### QA-054 — Background resume
- Setup: Open the forgot-password or reset-password flow.
- Verify: Send the app to the background during use and resume it while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: The screen restores safely and refreshes only data that may have become stale.

### QA-055 — Manual refresh
- Setup: Open the forgot-password or reset-password flow.
- Verify: Use the available refresh action after changing remote data while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Current values replace stale values without duplicating cards, rows, alerts, or messages.

### QA-056 — Rapid navigation
- Setup: Open the forgot-password or reset-password flow.
- Verify: Navigate into and away from the area repeatedly while requests are active while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Disposed screens do not update, crash, flash stale content, or leak visible progress indicators.

### QA-057 — Data labels
- Setup: Open the forgot-password or reset-password flow.
- Verify: Review normal, long, zero, negative, and missing display values while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Labels use clear units and fallbacks while long values wrap or truncate intentionally.

### QA-058 — Touch targets
- Setup: Open the forgot-password or reset-password flow.
- Verify: Use each icon button and compact control near the edge of its hit area while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Targets respond reliably without triggering neighboring controls or requiring pixel-perfect taps.

### QA-059 — Contrast and state
- Setup: Open the forgot-password or reset-password flow.
- Verify: Compare enabled, disabled, selected, warning, and error appearances while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Every state is distinguishable by more than color alone and text remains legible.

### QA-060 — Session recovery
- Setup: Open the forgot-password or reset-password flow.
- Verify: Expire or revoke the session before returning to this area while reviewing the recovery form, confirmation state, and return-to-login action.
- Expected: Protected data is hidden and the user is guided to authenticate again without an infinite loop.

## Dashboard

### QA-061 — Initial rendering
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Allow the screen to render without interacting while reviewing the dashboard summary, cards, and latest readings.
- Expected: Content settles without exceptions, clipped controls, overlapping text, or unexpected layout movement.

### QA-062 — Loading state
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Observe the interface while its first data request is pending while reviewing the dashboard summary, cards, and latest readings.
- Expected: A clear loading state appears and interactive controls do not submit incomplete data.

### QA-063 — Empty data
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Use an account or fixture with no records for this area while reviewing the dashboard summary, cards, and latest readings.
- Expected: An understandable empty state appears without fake values, broken spacing, or dead-end navigation.

### QA-064 — Slow network
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Throttle the connection and repeat the primary action while reviewing the dashboard summary, cards, and latest readings.
- Expected: The interface remains responsive and communicates that work is still in progress.

### QA-065 — Offline behavior
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Disable network access immediately before the primary action while reviewing the dashboard summary, cards, and latest readings.
- Expected: Failure is explained clearly and the app remains usable enough to retry or navigate away.

### QA-066 — Server error
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Return a controlled server error for the primary request while reviewing the dashboard summary, cards, and latest readings.
- Expected: A safe error message appears without exposing secrets, stack traces, or raw response bodies.

### QA-067 — Retry path
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Cause one request to fail, restore the connection, and use retry while reviewing the dashboard summary, cards, and latest readings.
- Expected: The request succeeds once, stale errors disappear, and duplicate records are not created.

### QA-068 — Repeated tap
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Tap the primary action several times in quick succession while reviewing the dashboard summary, cards, and latest readings.
- Expected: Only one logical action is performed and progress feedback prevents accidental duplicates.

### QA-069 — Portrait rotation
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Rotate away from portrait and back while the screen is open while reviewing the dashboard summary, cards, and latest readings.
- Expected: State is preserved and the restored portrait layout has no overflow or missing controls.

### QA-070 — Small display
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Render at the smallest supported phone dimensions while reviewing the dashboard summary, cards, and latest readings.
- Expected: Essential content remains readable and reachable by scrolling without horizontal overflow.

### QA-071 — Large text
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Set the operating-system text scale to a large accessibility value while reviewing the dashboard summary, cards, and latest readings.
- Expected: Important labels remain understandable and actions remain visible and tappable.

### QA-072 — Keyboard handling
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Focus each editable field and move through the form using the keyboard while reviewing the dashboard summary, cards, and latest readings.
- Expected: Focused fields stay visible and submission or dismissal does not leave the layout obstructed.

### QA-073 — Back navigation
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Change local state and invoke the platform back action while reviewing the dashboard summary, cards, and latest readings.
- Expected: Navigation returns to the expected screen without exiting unexpectedly or corrupting state.

### QA-074 — Background resume
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Send the app to the background during use and resume it while reviewing the dashboard summary, cards, and latest readings.
- Expected: The screen restores safely and refreshes only data that may have become stale.

### QA-075 — Manual refresh
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Use the available refresh action after changing remote data while reviewing the dashboard summary, cards, and latest readings.
- Expected: Current values replace stale values without duplicating cards, rows, alerts, or messages.

### QA-076 — Rapid navigation
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Navigate into and away from the area repeatedly while requests are active while reviewing the dashboard summary, cards, and latest readings.
- Expected: Disposed screens do not update, crash, flash stale content, or leak visible progress indicators.

### QA-077 — Data labels
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Review normal, long, zero, negative, and missing display values while reviewing the dashboard summary, cards, and latest readings.
- Expected: Labels use clear units and fallbacks while long values wrap or truncate intentionally.

### QA-078 — Touch targets
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Use each icon button and compact control near the edge of its hit area while reviewing the dashboard summary, cards, and latest readings.
- Expected: Targets respond reliably without triggering neighboring controls or requiring pixel-perfect taps.

### QA-079 — Contrast and state
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Compare enabled, disabled, selected, warning, and error appearances while reviewing the dashboard summary, cards, and latest readings.
- Expected: Every state is distinguishable by more than color alone and text remains legible.

### QA-080 — Session recovery
- Setup: Sign in as a standard user and open the dashboard.
- Verify: Expire or revoke the session before returning to this area while reviewing the dashboard summary, cards, and latest readings.
- Expected: Protected data is hidden and the user is guided to authenticate again without an infinite loop.

## Pond monitoring

### QA-081 — Initial rendering
- Setup: Sign in with access to at least one pond.
- Verify: Allow the screen to render without interacting while reviewing the pond selector, status values, and monitoring details.
- Expected: Content settles without exceptions, clipped controls, overlapping text, or unexpected layout movement.

### QA-082 — Loading state
- Setup: Sign in with access to at least one pond.
- Verify: Observe the interface while its first data request is pending while reviewing the pond selector, status values, and monitoring details.
- Expected: A clear loading state appears and interactive controls do not submit incomplete data.

### QA-083 — Empty data
- Setup: Sign in with access to at least one pond.
- Verify: Use an account or fixture with no records for this area while reviewing the pond selector, status values, and monitoring details.
- Expected: An understandable empty state appears without fake values, broken spacing, or dead-end navigation.

### QA-084 — Slow network
- Setup: Sign in with access to at least one pond.
- Verify: Throttle the connection and repeat the primary action while reviewing the pond selector, status values, and monitoring details.
- Expected: The interface remains responsive and communicates that work is still in progress.

### QA-085 — Offline behavior
- Setup: Sign in with access to at least one pond.
- Verify: Disable network access immediately before the primary action while reviewing the pond selector, status values, and monitoring details.
- Expected: Failure is explained clearly and the app remains usable enough to retry or navigate away.

### QA-086 — Server error
- Setup: Sign in with access to at least one pond.
- Verify: Return a controlled server error for the primary request while reviewing the pond selector, status values, and monitoring details.
- Expected: A safe error message appears without exposing secrets, stack traces, or raw response bodies.

### QA-087 — Retry path
- Setup: Sign in with access to at least one pond.
- Verify: Cause one request to fail, restore the connection, and use retry while reviewing the pond selector, status values, and monitoring details.
- Expected: The request succeeds once, stale errors disappear, and duplicate records are not created.

### QA-088 — Repeated tap
- Setup: Sign in with access to at least one pond.
- Verify: Tap the primary action several times in quick succession while reviewing the pond selector, status values, and monitoring details.
- Expected: Only one logical action is performed and progress feedback prevents accidental duplicates.

### QA-089 — Portrait rotation
- Setup: Sign in with access to at least one pond.
- Verify: Rotate away from portrait and back while the screen is open while reviewing the pond selector, status values, and monitoring details.
- Expected: State is preserved and the restored portrait layout has no overflow or missing controls.

### QA-090 — Small display
- Setup: Sign in with access to at least one pond.
- Verify: Render at the smallest supported phone dimensions while reviewing the pond selector, status values, and monitoring details.
- Expected: Essential content remains readable and reachable by scrolling without horizontal overflow.

### QA-091 — Large text
- Setup: Sign in with access to at least one pond.
- Verify: Set the operating-system text scale to a large accessibility value while reviewing the pond selector, status values, and monitoring details.
- Expected: Important labels remain understandable and actions remain visible and tappable.

### QA-092 — Keyboard handling
- Setup: Sign in with access to at least one pond.
- Verify: Focus each editable field and move through the form using the keyboard while reviewing the pond selector, status values, and monitoring details.
- Expected: Focused fields stay visible and submission or dismissal does not leave the layout obstructed.

### QA-093 — Back navigation
- Setup: Sign in with access to at least one pond.
- Verify: Change local state and invoke the platform back action while reviewing the pond selector, status values, and monitoring details.
- Expected: Navigation returns to the expected screen without exiting unexpectedly or corrupting state.

### QA-094 — Background resume
- Setup: Sign in with access to at least one pond.
- Verify: Send the app to the background during use and resume it while reviewing the pond selector, status values, and monitoring details.
- Expected: The screen restores safely and refreshes only data that may have become stale.

### QA-095 — Manual refresh
- Setup: Sign in with access to at least one pond.
- Verify: Use the available refresh action after changing remote data while reviewing the pond selector, status values, and monitoring details.
- Expected: Current values replace stale values without duplicating cards, rows, alerts, or messages.

### QA-096 — Rapid navigation
- Setup: Sign in with access to at least one pond.
- Verify: Navigate into and away from the area repeatedly while requests are active while reviewing the pond selector, status values, and monitoring details.
- Expected: Disposed screens do not update, crash, flash stale content, or leak visible progress indicators.

### QA-097 — Data labels
- Setup: Sign in with access to at least one pond.
- Verify: Review normal, long, zero, negative, and missing display values while reviewing the pond selector, status values, and monitoring details.
- Expected: Labels use clear units and fallbacks while long values wrap or truncate intentionally.

### QA-098 — Touch targets
- Setup: Sign in with access to at least one pond.
- Verify: Use each icon button and compact control near the edge of its hit area while reviewing the pond selector, status values, and monitoring details.
- Expected: Targets respond reliably without triggering neighboring controls or requiring pixel-perfect taps.

### QA-099 — Contrast and state
- Setup: Sign in with access to at least one pond.
- Verify: Compare enabled, disabled, selected, warning, and error appearances while reviewing the pond selector, status values, and monitoring details.
- Expected: Every state is distinguishable by more than color alone and text remains legible.

### QA-100 — Session recovery
- Setup: Sign in with access to at least one pond.
- Verify: Expire or revoke the session before returning to this area while reviewing the pond selector, status values, and monitoring details.
- Expected: Protected data is hidden and the user is guided to authenticate again without an infinite loop.

## Alerts

### QA-101 — Initial rendering
- Setup: Open the alerts screen with an authenticated account.
- Verify: Allow the screen to render without interacting while reviewing the alert list, severity information, and filters.
- Expected: Content settles without exceptions, clipped controls, overlapping text, or unexpected layout movement.

### QA-102 — Loading state
- Setup: Open the alerts screen with an authenticated account.
- Verify: Observe the interface while its first data request is pending while reviewing the alert list, severity information, and filters.
- Expected: A clear loading state appears and interactive controls do not submit incomplete data.

### QA-103 — Empty data
- Setup: Open the alerts screen with an authenticated account.
- Verify: Use an account or fixture with no records for this area while reviewing the alert list, severity information, and filters.
- Expected: An understandable empty state appears without fake values, broken spacing, or dead-end navigation.

### QA-104 — Slow network
- Setup: Open the alerts screen with an authenticated account.
- Verify: Throttle the connection and repeat the primary action while reviewing the alert list, severity information, and filters.
- Expected: The interface remains responsive and communicates that work is still in progress.

### QA-105 — Offline behavior
- Setup: Open the alerts screen with an authenticated account.
- Verify: Disable network access immediately before the primary action while reviewing the alert list, severity information, and filters.
- Expected: Failure is explained clearly and the app remains usable enough to retry or navigate away.

### QA-106 — Server error
- Setup: Open the alerts screen with an authenticated account.
- Verify: Return a controlled server error for the primary request while reviewing the alert list, severity information, and filters.
- Expected: A safe error message appears without exposing secrets, stack traces, or raw response bodies.

### QA-107 — Retry path
- Setup: Open the alerts screen with an authenticated account.
- Verify: Cause one request to fail, restore the connection, and use retry while reviewing the alert list, severity information, and filters.
- Expected: The request succeeds once, stale errors disappear, and duplicate records are not created.

### QA-108 — Repeated tap
- Setup: Open the alerts screen with an authenticated account.
- Verify: Tap the primary action several times in quick succession while reviewing the alert list, severity information, and filters.
- Expected: Only one logical action is performed and progress feedback prevents accidental duplicates.

### QA-109 — Portrait rotation
- Setup: Open the alerts screen with an authenticated account.
- Verify: Rotate away from portrait and back while the screen is open while reviewing the alert list, severity information, and filters.
- Expected: State is preserved and the restored portrait layout has no overflow or missing controls.

### QA-110 — Small display
- Setup: Open the alerts screen with an authenticated account.
- Verify: Render at the smallest supported phone dimensions while reviewing the alert list, severity information, and filters.
- Expected: Essential content remains readable and reachable by scrolling without horizontal overflow.

### QA-111 — Large text
- Setup: Open the alerts screen with an authenticated account.
- Verify: Set the operating-system text scale to a large accessibility value while reviewing the alert list, severity information, and filters.
- Expected: Important labels remain understandable and actions remain visible and tappable.

### QA-112 — Keyboard handling
- Setup: Open the alerts screen with an authenticated account.
- Verify: Focus each editable field and move through the form using the keyboard while reviewing the alert list, severity information, and filters.
- Expected: Focused fields stay visible and submission or dismissal does not leave the layout obstructed.

### QA-113 — Back navigation
- Setup: Open the alerts screen with an authenticated account.
- Verify: Change local state and invoke the platform back action while reviewing the alert list, severity information, and filters.
- Expected: Navigation returns to the expected screen without exiting unexpectedly or corrupting state.

### QA-114 — Background resume
- Setup: Open the alerts screen with an authenticated account.
- Verify: Send the app to the background during use and resume it while reviewing the alert list, severity information, and filters.
- Expected: The screen restores safely and refreshes only data that may have become stale.

### QA-115 — Manual refresh
- Setup: Open the alerts screen with an authenticated account.
- Verify: Use the available refresh action after changing remote data while reviewing the alert list, severity information, and filters.
- Expected: Current values replace stale values without duplicating cards, rows, alerts, or messages.

### QA-116 — Rapid navigation
- Setup: Open the alerts screen with an authenticated account.
- Verify: Navigate into and away from the area repeatedly while requests are active while reviewing the alert list, severity information, and filters.
- Expected: Disposed screens do not update, crash, flash stale content, or leak visible progress indicators.

### QA-117 — Data labels
- Setup: Open the alerts screen with an authenticated account.
- Verify: Review normal, long, zero, negative, and missing display values while reviewing the alert list, severity information, and filters.
- Expected: Labels use clear units and fallbacks while long values wrap or truncate intentionally.

### QA-118 — Touch targets
- Setup: Open the alerts screen with an authenticated account.
- Verify: Use each icon button and compact control near the edge of its hit area while reviewing the alert list, severity information, and filters.
- Expected: Targets respond reliably without triggering neighboring controls or requiring pixel-perfect taps.

### QA-119 — Contrast and state
- Setup: Open the alerts screen with an authenticated account.
- Verify: Compare enabled, disabled, selected, warning, and error appearances while reviewing the alert list, severity information, and filters.
- Expected: Every state is distinguishable by more than color alone and text remains legible.

### QA-120 — Session recovery
- Setup: Open the alerts screen with an authenticated account.
- Verify: Expire or revoke the session before returning to this area while reviewing the alert list, severity information, and filters.
- Expected: Protected data is hidden and the user is guided to authenticate again without an infinite loop.

## Device control

### QA-121 — Initial rendering
- Setup: Open a pond that has a controllable device.
- Verify: Allow the screen to render without interacting while reviewing the device state, manual controls, and schedule editor.
- Expected: Content settles without exceptions, clipped controls, overlapping text, or unexpected layout movement.

### QA-122 — Loading state
- Setup: Open a pond that has a controllable device.
- Verify: Observe the interface while its first data request is pending while reviewing the device state, manual controls, and schedule editor.
- Expected: A clear loading state appears and interactive controls do not submit incomplete data.

### QA-123 — Empty data
- Setup: Open a pond that has a controllable device.
- Verify: Use an account or fixture with no records for this area while reviewing the device state, manual controls, and schedule editor.
- Expected: An understandable empty state appears without fake values, broken spacing, or dead-end navigation.

### QA-124 — Slow network
- Setup: Open a pond that has a controllable device.
- Verify: Throttle the connection and repeat the primary action while reviewing the device state, manual controls, and schedule editor.
- Expected: The interface remains responsive and communicates that work is still in progress.

### QA-125 — Offline behavior
- Setup: Open a pond that has a controllable device.
- Verify: Disable network access immediately before the primary action while reviewing the device state, manual controls, and schedule editor.
- Expected: Failure is explained clearly and the app remains usable enough to retry or navigate away.

### QA-126 — Server error
- Setup: Open a pond that has a controllable device.
- Verify: Return a controlled server error for the primary request while reviewing the device state, manual controls, and schedule editor.
- Expected: A safe error message appears without exposing secrets, stack traces, or raw response bodies.

### QA-127 — Retry path
- Setup: Open a pond that has a controllable device.
- Verify: Cause one request to fail, restore the connection, and use retry while reviewing the device state, manual controls, and schedule editor.
- Expected: The request succeeds once, stale errors disappear, and duplicate records are not created.

### QA-128 — Repeated tap
- Setup: Open a pond that has a controllable device.
- Verify: Tap the primary action several times in quick succession while reviewing the device state, manual controls, and schedule editor.
- Expected: Only one logical action is performed and progress feedback prevents accidental duplicates.

### QA-129 — Portrait rotation
- Setup: Open a pond that has a controllable device.
- Verify: Rotate away from portrait and back while the screen is open while reviewing the device state, manual controls, and schedule editor.
- Expected: State is preserved and the restored portrait layout has no overflow or missing controls.

### QA-130 — Small display
- Setup: Open a pond that has a controllable device.
- Verify: Render at the smallest supported phone dimensions while reviewing the device state, manual controls, and schedule editor.
- Expected: Essential content remains readable and reachable by scrolling without horizontal overflow.

### QA-131 — Large text
- Setup: Open a pond that has a controllable device.
- Verify: Set the operating-system text scale to a large accessibility value while reviewing the device state, manual controls, and schedule editor.
- Expected: Important labels remain understandable and actions remain visible and tappable.

### QA-132 — Keyboard handling
- Setup: Open a pond that has a controllable device.
- Verify: Focus each editable field and move through the form using the keyboard while reviewing the device state, manual controls, and schedule editor.
- Expected: Focused fields stay visible and submission or dismissal does not leave the layout obstructed.

### QA-133 — Back navigation
- Setup: Open a pond that has a controllable device.
- Verify: Change local state and invoke the platform back action while reviewing the device state, manual controls, and schedule editor.
- Expected: Navigation returns to the expected screen without exiting unexpectedly or corrupting state.

### QA-134 — Background resume
- Setup: Open a pond that has a controllable device.
- Verify: Send the app to the background during use and resume it while reviewing the device state, manual controls, and schedule editor.
- Expected: The screen restores safely and refreshes only data that may have become stale.

### QA-135 — Manual refresh
- Setup: Open a pond that has a controllable device.
- Verify: Use the available refresh action after changing remote data while reviewing the device state, manual controls, and schedule editor.
- Expected: Current values replace stale values without duplicating cards, rows, alerts, or messages.

### QA-136 — Rapid navigation
- Setup: Open a pond that has a controllable device.
- Verify: Navigate into and away from the area repeatedly while requests are active while reviewing the device state, manual controls, and schedule editor.
- Expected: Disposed screens do not update, crash, flash stale content, or leak visible progress indicators.

### QA-137 — Data labels
- Setup: Open a pond that has a controllable device.
- Verify: Review normal, long, zero, negative, and missing display values while reviewing the device state, manual controls, and schedule editor.
- Expected: Labels use clear units and fallbacks while long values wrap or truncate intentionally.

### QA-138 — Touch targets
- Setup: Open a pond that has a controllable device.
- Verify: Use each icon button and compact control near the edge of its hit area while reviewing the device state, manual controls, and schedule editor.
- Expected: Targets respond reliably without triggering neighboring controls or requiring pixel-perfect taps.

### QA-139 — Contrast and state
- Setup: Open a pond that has a controllable device.
- Verify: Compare enabled, disabled, selected, warning, and error appearances while reviewing the device state, manual controls, and schedule editor.
- Expected: Every state is distinguishable by more than color alone and text remains legible.

### QA-140 — Session recovery
- Setup: Open a pond that has a controllable device.
- Verify: Expire or revoke the session before returning to this area while reviewing the device state, manual controls, and schedule editor.
- Expected: Protected data is hidden and the user is guided to authenticate again without an infinite loop.

## Sensor history

### QA-141 — Initial rendering
- Setup: Open the sensor history drill-down for a pond.
- Verify: Allow the screen to render without interacting while reviewing the chart, time range, labels, and data points.
- Expected: Content settles without exceptions, clipped controls, overlapping text, or unexpected layout movement.

### QA-142 — Loading state
- Setup: Open the sensor history drill-down for a pond.
- Verify: Observe the interface while its first data request is pending while reviewing the chart, time range, labels, and data points.
- Expected: A clear loading state appears and interactive controls do not submit incomplete data.

### QA-143 — Empty data
- Setup: Open the sensor history drill-down for a pond.
- Verify: Use an account or fixture with no records for this area while reviewing the chart, time range, labels, and data points.
- Expected: An understandable empty state appears without fake values, broken spacing, or dead-end navigation.

### QA-144 — Slow network
- Setup: Open the sensor history drill-down for a pond.
- Verify: Throttle the connection and repeat the primary action while reviewing the chart, time range, labels, and data points.
- Expected: The interface remains responsive and communicates that work is still in progress.

### QA-145 — Offline behavior
- Setup: Open the sensor history drill-down for a pond.
- Verify: Disable network access immediately before the primary action while reviewing the chart, time range, labels, and data points.
- Expected: Failure is explained clearly and the app remains usable enough to retry or navigate away.

### QA-146 — Server error
- Setup: Open the sensor history drill-down for a pond.
- Verify: Return a controlled server error for the primary request while reviewing the chart, time range, labels, and data points.
- Expected: A safe error message appears without exposing secrets, stack traces, or raw response bodies.

### QA-147 — Retry path
- Setup: Open the sensor history drill-down for a pond.
- Verify: Cause one request to fail, restore the connection, and use retry while reviewing the chart, time range, labels, and data points.
- Expected: The request succeeds once, stale errors disappear, and duplicate records are not created.

### QA-148 — Repeated tap
- Setup: Open the sensor history drill-down for a pond.
- Verify: Tap the primary action several times in quick succession while reviewing the chart, time range, labels, and data points.
- Expected: Only one logical action is performed and progress feedback prevents accidental duplicates.

### QA-149 — Portrait rotation
- Setup: Open the sensor history drill-down for a pond.
- Verify: Rotate away from portrait and back while the screen is open while reviewing the chart, time range, labels, and data points.
- Expected: State is preserved and the restored portrait layout has no overflow or missing controls.

### QA-150 — Small display
- Setup: Open the sensor history drill-down for a pond.
- Verify: Render at the smallest supported phone dimensions while reviewing the chart, time range, labels, and data points.
- Expected: Essential content remains readable and reachable by scrolling without horizontal overflow.

### QA-151 — Large text
- Setup: Open the sensor history drill-down for a pond.
- Verify: Set the operating-system text scale to a large accessibility value while reviewing the chart, time range, labels, and data points.
- Expected: Important labels remain understandable and actions remain visible and tappable.

### QA-152 — Keyboard handling
- Setup: Open the sensor history drill-down for a pond.
- Verify: Focus each editable field and move through the form using the keyboard while reviewing the chart, time range, labels, and data points.
- Expected: Focused fields stay visible and submission or dismissal does not leave the layout obstructed.

### QA-153 — Back navigation
- Setup: Open the sensor history drill-down for a pond.
- Verify: Change local state and invoke the platform back action while reviewing the chart, time range, labels, and data points.
- Expected: Navigation returns to the expected screen without exiting unexpectedly or corrupting state.

### QA-154 — Background resume
- Setup: Open the sensor history drill-down for a pond.
- Verify: Send the app to the background during use and resume it while reviewing the chart, time range, labels, and data points.
- Expected: The screen restores safely and refreshes only data that may have become stale.

### QA-155 — Manual refresh
- Setup: Open the sensor history drill-down for a pond.
- Verify: Use the available refresh action after changing remote data while reviewing the chart, time range, labels, and data points.
- Expected: Current values replace stale values without duplicating cards, rows, alerts, or messages.

### QA-156 — Rapid navigation
- Setup: Open the sensor history drill-down for a pond.
- Verify: Navigate into and away from the area repeatedly while requests are active while reviewing the chart, time range, labels, and data points.
- Expected: Disposed screens do not update, crash, flash stale content, or leak visible progress indicators.

### QA-157 — Data labels
- Setup: Open the sensor history drill-down for a pond.
- Verify: Review normal, long, zero, negative, and missing display values while reviewing the chart, time range, labels, and data points.
- Expected: Labels use clear units and fallbacks while long values wrap or truncate intentionally.

### QA-158 — Touch targets
- Setup: Open the sensor history drill-down for a pond.
- Verify: Use each icon button and compact control near the edge of its hit area while reviewing the chart, time range, labels, and data points.
- Expected: Targets respond reliably without triggering neighboring controls or requiring pixel-perfect taps.

### QA-159 — Contrast and state
- Setup: Open the sensor history drill-down for a pond.
- Verify: Compare enabled, disabled, selected, warning, and error appearances while reviewing the chart, time range, labels, and data points.
- Expected: Every state is distinguishable by more than color alone and text remains legible.

### QA-160 — Session recovery
- Setup: Open the sensor history drill-down for a pond.
- Verify: Expire or revoke the session before returning to this area while reviewing the chart, time range, labels, and data points.
- Expected: Protected data is hidden and the user is guided to authenticate again without an infinite loop.

## Administration

### QA-161 — Initial rendering
- Setup: Sign in with an administrator account.
- Verify: Allow the screen to render without interacting while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Content settles without exceptions, clipped controls, overlapping text, or unexpected layout movement.

### QA-162 — Loading state
- Setup: Sign in with an administrator account.
- Verify: Observe the interface while its first data request is pending while reviewing the fish, device, staff, order, and subscription management views.
- Expected: A clear loading state appears and interactive controls do not submit incomplete data.

### QA-163 — Empty data
- Setup: Sign in with an administrator account.
- Verify: Use an account or fixture with no records for this area while reviewing the fish, device, staff, order, and subscription management views.
- Expected: An understandable empty state appears without fake values, broken spacing, or dead-end navigation.

### QA-164 — Slow network
- Setup: Sign in with an administrator account.
- Verify: Throttle the connection and repeat the primary action while reviewing the fish, device, staff, order, and subscription management views.
- Expected: The interface remains responsive and communicates that work is still in progress.

### QA-165 — Offline behavior
- Setup: Sign in with an administrator account.
- Verify: Disable network access immediately before the primary action while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Failure is explained clearly and the app remains usable enough to retry or navigate away.

### QA-166 — Server error
- Setup: Sign in with an administrator account.
- Verify: Return a controlled server error for the primary request while reviewing the fish, device, staff, order, and subscription management views.
- Expected: A safe error message appears without exposing secrets, stack traces, or raw response bodies.

### QA-167 — Retry path
- Setup: Sign in with an administrator account.
- Verify: Cause one request to fail, restore the connection, and use retry while reviewing the fish, device, staff, order, and subscription management views.
- Expected: The request succeeds once, stale errors disappear, and duplicate records are not created.

### QA-168 — Repeated tap
- Setup: Sign in with an administrator account.
- Verify: Tap the primary action several times in quick succession while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Only one logical action is performed and progress feedback prevents accidental duplicates.

### QA-169 — Portrait rotation
- Setup: Sign in with an administrator account.
- Verify: Rotate away from portrait and back while the screen is open while reviewing the fish, device, staff, order, and subscription management views.
- Expected: State is preserved and the restored portrait layout has no overflow or missing controls.

### QA-170 — Small display
- Setup: Sign in with an administrator account.
- Verify: Render at the smallest supported phone dimensions while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Essential content remains readable and reachable by scrolling without horizontal overflow.

### QA-171 — Large text
- Setup: Sign in with an administrator account.
- Verify: Set the operating-system text scale to a large accessibility value while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Important labels remain understandable and actions remain visible and tappable.

### QA-172 — Keyboard handling
- Setup: Sign in with an administrator account.
- Verify: Focus each editable field and move through the form using the keyboard while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Focused fields stay visible and submission or dismissal does not leave the layout obstructed.

### QA-173 — Back navigation
- Setup: Sign in with an administrator account.
- Verify: Change local state and invoke the platform back action while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Navigation returns to the expected screen without exiting unexpectedly or corrupting state.

### QA-174 — Background resume
- Setup: Sign in with an administrator account.
- Verify: Send the app to the background during use and resume it while reviewing the fish, device, staff, order, and subscription management views.
- Expected: The screen restores safely and refreshes only data that may have become stale.

### QA-175 — Manual refresh
- Setup: Sign in with an administrator account.
- Verify: Use the available refresh action after changing remote data while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Current values replace stale values without duplicating cards, rows, alerts, or messages.

### QA-176 — Rapid navigation
- Setup: Sign in with an administrator account.
- Verify: Navigate into and away from the area repeatedly while requests are active while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Disposed screens do not update, crash, flash stale content, or leak visible progress indicators.

### QA-177 — Data labels
- Setup: Sign in with an administrator account.
- Verify: Review normal, long, zero, negative, and missing display values while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Labels use clear units and fallbacks while long values wrap or truncate intentionally.

### QA-178 — Touch targets
- Setup: Sign in with an administrator account.
- Verify: Use each icon button and compact control near the edge of its hit area while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Targets respond reliably without triggering neighboring controls or requiring pixel-perfect taps.

### QA-179 — Contrast and state
- Setup: Sign in with an administrator account.
- Verify: Compare enabled, disabled, selected, warning, and error appearances while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Every state is distinguishable by more than color alone and text remains legible.

### QA-180 — Session recovery
- Setup: Sign in with an administrator account.
- Verify: Expire or revoke the session before returning to this area while reviewing the fish, device, staff, order, and subscription management views.
- Expected: Protected data is hidden and the user is guided to authenticate again without an infinite loop.

## Navigation and lifecycle

### QA-181 — Initial rendering
- Setup: Launch the app and navigate between several available screens.
- Verify: Allow the screen to render without interacting while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Content settles without exceptions, clipped controls, overlapping text, or unexpected layout movement.

### QA-182 — Loading state
- Setup: Launch the app and navigate between several available screens.
- Verify: Observe the interface while its first data request is pending while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: A clear loading state appears and interactive controls do not submit incomplete data.

### QA-183 — Empty data
- Setup: Launch the app and navigate between several available screens.
- Verify: Use an account or fixture with no records for this area while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: An understandable empty state appears without fake values, broken spacing, or dead-end navigation.

### QA-184 — Slow network
- Setup: Launch the app and navigate between several available screens.
- Verify: Throttle the connection and repeat the primary action while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: The interface remains responsive and communicates that work is still in progress.

### QA-185 — Offline behavior
- Setup: Launch the app and navigate between several available screens.
- Verify: Disable network access immediately before the primary action while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Failure is explained clearly and the app remains usable enough to retry or navigate away.

### QA-186 — Server error
- Setup: Launch the app and navigate between several available screens.
- Verify: Return a controlled server error for the primary request while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: A safe error message appears without exposing secrets, stack traces, or raw response bodies.

### QA-187 — Retry path
- Setup: Launch the app and navigate between several available screens.
- Verify: Cause one request to fail, restore the connection, and use retry while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: The request succeeds once, stale errors disappear, and duplicate records are not created.

### QA-188 — Repeated tap
- Setup: Launch the app and navigate between several available screens.
- Verify: Tap the primary action several times in quick succession while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Only one logical action is performed and progress feedback prevents accidental duplicates.

### QA-189 — Portrait rotation
- Setup: Launch the app and navigate between several available screens.
- Verify: Rotate away from portrait and back while the screen is open while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: State is preserved and the restored portrait layout has no overflow or missing controls.

### QA-190 — Small display
- Setup: Launch the app and navigate between several available screens.
- Verify: Render at the smallest supported phone dimensions while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Essential content remains readable and reachable by scrolling without horizontal overflow.

### QA-191 — Large text
- Setup: Launch the app and navigate between several available screens.
- Verify: Set the operating-system text scale to a large accessibility value while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Important labels remain understandable and actions remain visible and tappable.

### QA-192 — Keyboard handling
- Setup: Launch the app and navigate between several available screens.
- Verify: Focus each editable field and move through the form using the keyboard while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Focused fields stay visible and submission or dismissal does not leave the layout obstructed.

### QA-193 — Back navigation
- Setup: Launch the app and navigate between several available screens.
- Verify: Change local state and invoke the platform back action while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Navigation returns to the expected screen without exiting unexpectedly or corrupting state.

### QA-194 — Background resume
- Setup: Launch the app and navigate between several available screens.
- Verify: Send the app to the background during use and resume it while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: The screen restores safely and refreshes only data that may have become stale.

### QA-195 — Manual refresh
- Setup: Launch the app and navigate between several available screens.
- Verify: Use the available refresh action after changing remote data while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Current values replace stale values without duplicating cards, rows, alerts, or messages.

### QA-196 — Rapid navigation
- Setup: Launch the app and navigate between several available screens.
- Verify: Navigate into and away from the area repeatedly while requests are active while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Disposed screens do not update, crash, flash stale content, or leak visible progress indicators.

### QA-197 — Data labels
- Setup: Launch the app and navigate between several available screens.
- Verify: Review normal, long, zero, negative, and missing display values while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Labels use clear units and fallbacks while long values wrap or truncate intentionally.

### QA-198 — Touch targets
- Setup: Launch the app and navigate between several available screens.
- Verify: Use each icon button and compact control near the edge of its hit area while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Targets respond reliably without triggering neighboring controls or requiring pixel-perfect taps.

### QA-199 — Contrast and state
- Setup: Launch the app and navigate between several available screens.
- Verify: Compare enabled, disabled, selected, warning, and error appearances while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Every state is distinguishable by more than color alone and text remains legible.

### QA-200 — Session recovery
- Setup: Launch the app and navigate between several available screens.
- Verify: Expire or revoke the session before returning to this area while reviewing the navigation controls, route state, and app lifecycle behavior.
- Expected: Protected data is hidden and the user is guided to authenticate again without an infinite loop.
