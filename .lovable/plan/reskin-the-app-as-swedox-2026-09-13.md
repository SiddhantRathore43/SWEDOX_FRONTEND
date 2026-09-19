## Reskin the app as Swedox

### Build
- Replace the existing homepage with a responsive Swedox landing page in this order: navigation, hero, three financial services, three-step process, security, and footer.
- Restyle the shared visual system around light neutrals, deep navy, and restrained teal accents.
- Replace the current login and signup screens with minimal static Swedox forms; remove all live authentication calls.
- Add a responsive post-login shell with a collapsible left navigation, email display, logout control, and placeholder pages for Dashboard, Loans, Insurance, and Bill Payment.
- Update browser metadata and visible brand references to Swedox.

### Technical details
- Keep all screens client-side and static; no database, authentication, or API calls.
- Reuse the existing React Router and UI controls, adding focused Swedox page components where needed.
- Preserve unrelated legacy routes while making the requested Swedox journeys primary.
- Verify the homepage, auth screens, desktop dashboard, and mobile navigation in the running preview.
