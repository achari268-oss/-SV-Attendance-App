# SV Attendance App

This is a working mobile-first PWA prototype.

## Included
- Login screen
- BCA A-D classes
- Add class
- Add students (name, ID, parent phone)
- Present/Absent toggle
- Parent notification prototype
- Teacher check-in and history
- Profile
- Settings
- Automatic local saving
- Backup export
- Installable PWA / offline cache

## Run on a laptop
A service worker needs HTTP, so do not open index.html directly with file://.

If Python is installed:
1. Open Command Prompt in this folder.
2. Run: `python -m http.server 8080`
3. Open: `http://localhost:8080`

## Important for a REAL online app
This version saves data on the device. It does not yet have:
- cloud database / multi-teacher accounts
- secure server-side password authentication
- real SMS

Those require a backend (for example Supabase/Firebase) and an SMS provider. The UI and app flow are already prepared so those can be added next.
