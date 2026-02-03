## Packages
(none needed)

## Notes
Uses existing shadcn/ui components already present in client/src/components/ui
Auth is via Replit OIDC endpoints: /api/login, /api/logout, /api/auth/user (no custom login forms)
Admin UI is conditionally shown by probing GET /api/admin/overview; if 401/403, hide admin nav
All fetches use credentials: "include"
Tailwind fontFamily is already wired to CSS variables via tailwind.config.ts (sans/serif/mono)
