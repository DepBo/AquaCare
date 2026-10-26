# Kết quả từng test tự động đã chạy

Nguồn: TAP backend/web và JSON Flutter của phiên24/10/2026. ID bên dưới là mã bằng chứng của phiên,không phải ID của178 test case hệ thống.

| Mã | Tên test thực tế | Kết quả | Log nguồn |
|---|---|---|---|
| <a id="be-01"></a>BE-01 | annual dashboard groups Vietnam months and allocates delivered revenue to device versions | **PASS** | [backend.tap](backend.tap) |
| <a id="be-02"></a>BE-02 | annual dashboard shows empty current year without inventing a peak or decline | **PASS** | [backend.tap](backend.tap) |
| <a id="be-03"></a>BE-03 | dashboard groups delivered order value by Vietnam calendar date | **PASS** | [backend.tap](backend.tap) |
| <a id="be-04"></a>BE-04 | dashboard API requires a valid admin session before reading aggregates | **PASS** | [backend.tap](backend.tap) |
| <a id="be-05"></a>BE-05 | annual API validates the year and requires admin access | **PASS** | [backend.tap](backend.tap) |
| <a id="be-06"></a>BE-06 | gửi cảnh báo qua Brevo HTTP khi có API key | **PASS** | [backend.tap](backend.tap) |
| <a id="be-07"></a>BE-07 | báo thất bại khi Brevo từ chối email | **PASS** | [backend.tap](backend.tap) |
| <a id="be-08"></a>BE-08 | one-time ON runs once and only logs the actual command | **PASS** | [backend.tap](backend.tap) |
| <a id="be-09"></a>BE-09 | daily schedule runs on a new day, not twice in one minute | **PASS** | [backend.tap](backend.tap) |
| <a id="be-10"></a>BE-10 | one-time OFF across midnight uses following date | **PASS** | [backend.tap](backend.tap) |
| <a id="be-11"></a>BE-11 | one-time schedule tolerates a one-minute delay but does not replay old events | **PASS** | [backend.tap](backend.tap) |
| <a id="be-12"></a>BE-12 | retries database update without republishing or double logging | **PASS** | [backend.tap](backend.tap) |
| <a id="be-13"></a>BE-13 | inactive devices and disconnected MQTT do not run schedules | **PASS** | [backend.tap](backend.tap) |
| <a id="web-01"></a>WEB-01 | uses the selected on time for duration presets | **PASS** | [web.tap](web.tap) |
| <a id="web-02"></a>WEB-02 | fills an empty on time from the user clock | **PASS** | [web.tap](web.tap) |
| <a id="web-03"></a>WEB-03 | wraps the off time past midnight | **PASS** | [web.tap](web.tap) |
| <a id="fl-01"></a>FL-01 | minimum build blocks only older installations | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-02"></a>FL-02 | old build cannot reach app content | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-03"></a>FL-03 | current build opens app | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-04"></a>FL-04 | returning to app enforces a newly raised minimum build | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-05"></a>FL-05 | failed check blocks app until retry succeeds | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-06"></a>FL-06 | revenue panels fit width 280.0 dark=false at large text | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-07"></a>FL-07 | revenue panels fit width 280.0 dark=true at large text | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-08"></a>FL-08 | Koi temperature uses the species range and backend warning margin | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-09"></a>FL-09 | other sensors use their species thresholds too | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-10"></a>FL-10 | missing species preserves backend defaults | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-11"></a>FL-11 | revenue panels fit width 320.0 dark=false at large text | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-12"></a>FL-12 | auth actions are visible without scrolling at Size(320.0, 480.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-13"></a>FL-13 | shield uses the same priority as the web overview | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-14"></a>FL-14 | shield images are bundled with the mobile app | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-15"></a>FL-15 | all nine pond photos are included in the Flutter asset bundle | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-16"></a>FL-16 | revenue panels fit width 320.0 dark=true at large text | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-17"></a>FL-17 | auth actions are visible without scrolling at Size(320.0, 568.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-18"></a>FL-18 | revenue panels fit width 390.0 dark=false at large text | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-19"></a>FL-19 | auth actions are visible without scrolling at Size(360.0, 640.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-20"></a>FL-20 | revenue panels fit width 390.0 dark=true at large text | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-21"></a>FL-21 | auth actions are visible without scrolling at Size(393.0, 852.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-22"></a>FL-22 | add tank button follows light and dark theme | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-23"></a>FL-23 | revenue panels fit width 600.0 dark=false at large text | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-24"></a>FL-24 | pond notification settings fit Size(280.0, 640.0) with larger text | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-25"></a>FL-25 | hero fits width 280.0 and text scale 1.0 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-26"></a>FL-26 | hero fits width 280.0 and text scale 1.5 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-27"></a>FL-27 | hero fits width 280.0 and text scale 2.0 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-28"></a>FL-28 | auth actions are visible without scrolling at Size(430.0, 932.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-29"></a>FL-29 | hero fits width 320.0 and text scale 1.0 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-30"></a>FL-30 | pond notification settings fit Size(320.0, 700.0) with larger text | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-31"></a>FL-31 | hero fits width 320.0 and text scale 1.5 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-32"></a>FL-32 | revenue panels fit width 600.0 dark=true at large text | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-33"></a>FL-33 | hero fits width 320.0 and text scale 2.0 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-34"></a>FL-34 | hero fits width 360.0 and text scale 1.0 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-35"></a>FL-35 | splash finishes before opening the existing destination | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-36"></a>FL-36 | hero fits width 360.0 and text scale 1.5 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-37"></a>FL-37 | hero fits width 360.0 and text scale 2.0 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-38"></a>FL-38 | pond notification settings fit Size(360.0, 780.0) with larger text | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-39"></a>FL-39 | missing months and empty revenue render without invented values | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-40"></a>FL-40 | hero fits width 390.0 and text scale 1.0 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-41"></a>FL-41 | hero fits width 390.0 and text scale 1.5 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-42"></a>FL-42 | login and register keep their controls on a compact phone | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-43"></a>FL-43 | hero fits width 390.0 and text scale 2.0 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-44"></a>FL-44 | hero fits width 430.0 and text scale 1.0 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-45"></a>FL-45 | hero fits width 430.0 and text scale 1.5 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-46"></a>FL-46 | hero fits width 430.0 and text scale 2.0 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-47"></a>FL-47 | hero fits width 600.0 and text scale 1.0 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-48"></a>FL-48 | hero fits width 600.0 and text scale 1.5 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-49"></a>FL-49 | hero fits width 600.0 and text scale 2.0 | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-50"></a>FL-50 | Get Started opens the existing destination | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-51"></a>FL-51 | onboarding fits a compact phone screen | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-52"></a>FL-52 | customer theme is restored after switching to light mode | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-53"></a>FL-53 | overview sensor card renders its SVG at phone width | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-54"></a>FL-54 | aquarium hero image is bundled | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-55"></a>FL-55 | sensor status follows web thresholds and missing data stays unknown | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-56"></a>FL-56 | slideshow cycles nine photos and disposes its timer | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-57"></a>FL-57 | tank creation persists a numeric ID and deletion is owner scoped | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-58"></a>FL-58 | tank creation saves details and attaches an available device | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-59"></a>FL-59 | mobile relay schedules write to device_schedules | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-60"></a>FL-60 | floating role navigation fits a narrow phone and keeps badges | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-61"></a>FL-61 | all admin tabs fit Size(280.0, 640.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-62"></a>FL-62 | forgot password action opens the recovery request form | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-63"></a>FL-63 | all staff tabs fit Size(280.0, 640.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-64"></a>FL-64 | all admin tabs fit Size(320.0, 700.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-65"></a>FL-65 | all staff tabs fit Size(320.0, 700.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-66"></a>FL-66 | all admin tabs fit Size(360.0, 780.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-67"></a>FL-67 | all staff tabs fit Size(360.0, 780.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-68"></a>FL-68 | all admin tabs fit Size(430.0, 900.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-69"></a>FL-69 | all staff tabs fit Size(430.0, 900.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-70"></a>FL-70 | customer alert and control screens fit a narrow phone | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-71"></a>FL-71 | customer dashboard fits Size(280.0, 640.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-72"></a>FL-72 | customer dashboard fits Size(320.0, 700.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-73"></a>FL-73 | customer dashboard fits Size(360.0, 780.0) | **PASS** | [flutter-results.json](flutter-results.json) |
| <a id="fl-74"></a>FL-74 | customer dashboard fits Size(430.0, 900.0) | **PASS** | [flutter-results.json](flutter-results.json) |
