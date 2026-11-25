# DABubble

DABubble is a team messenger inspired by Slack, built with **Angular 19** and **Firebase**. Teams talk in channels, direct messages and threads, react with emojis and mention each other with `@` and `#`.

**Live demo:** <https://dabubble-3309.developerakademie.net/> – click **Guest login** to try it without an account.

---

## Features

- **Accounts:** sign up, login, Google login, guest login, forgot / reset password, avatar choice
- **Channels:** create, rename, add members, leave; new accounts join the default channels automatically
- **Messaging:** real-time messages, threads with reply count, editing your own messages, emoji reactions with "who reacted" tooltip
- **Direct messages** between all members, including a note-to-self chat
- **Mentions:** `@member` and `#channel` suggestions while typing
- **Search** across all channels you are a member of, with jump to the message
- **Presence:** online / away status
- **Responsive** from 320 px to widescreen, legal notice and privacy policy

## Tech stack

| Area | Technology |
|---|---|
| Framework | Angular 19 (standalone components, signals) |
| Language | TypeScript, SCSS |
| Backend | Firebase Authentication, Cloud Firestore (region `europe-west3`) |
| Data access | AngularFire, RxJS |
| Fonts | Nunito, served locally from `src/assets/fonts` (no external CDN) |

---

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) 20 or 22 with npm 10+
- Optional: Angular CLI (`npm install -g @angular/cli`)

### Install and run

```bash
git clone https://github.com/JakobMoussa/Dabubble.git
cd Dabubble
npm install
npm start
```

Open <http://localhost:4200/>.

> The Firebase API key only accepts requests from `localhost:4200` and the live domain. If you start the dev server on another port, login fails with a network error.

### Firebase configuration

The web config lives in `src/environments/environment.ts`. These values are public by design; access is protected by the Firestore security rules and an HTTP-referrer restricted API key. To run DABubble against your own Firebase project:

1. Create a project and a web app in the [Firebase console](https://console.firebase.google.com/) and paste its config into `environment.ts`.
2. Authentication: enable **Email/Password**, **Google** and **Anonymous**.
3. Firestore: create a database and deploy the rules:

   ```bash
   npx firebase-tools deploy --only firestore:rules --project <your-project-id>
   ```

4. Authentication → Settings → Authorized domains: add your hosting domain.

### Demo data

`scripts/seed-demo-data.mjs` creates demo users, channels, messages, threads and reactions:

```bash
SEED_PASSWORD=<at-least-8-characters> node scripts/seed-demo-data.mjs
```

---

## Scripts

| Command | Purpose |
|---|---|
| `npm start` | Dev server on `localhost:4200` |
| `npm run build` | Production build into `dist/dabubble/browser/` |
| `npm test` | Unit tests with Karma / Jasmine |

## Deployment

The app uses hash routing (`/#/dashboard`), so it runs on any static web server without rewrite rules.

1. `npm run build`
2. Upload the **contents** of `dist/dabubble/browser/` to the web root (including `.htaccess`).
3. Reload with `Ctrl + F5` and test the guest login.

## Security

- Firestore rules (`firestore.rules`): only signed-in users read data; only channel or chat members read and write messages; only the author edits a message, while every member may react and reply; nobody can remove other members from a channel; deleting is disabled.
- Emails are trimmed and lower-cased before they are stored.

---

## Project structure

```text
src/
├── app/
│   ├── components/
│   │   ├── dashboard/          # Workspace: sidebar, chat, threads, dialogs
│   │   ├── login/              # Login, guest login, intro animation
│   │   ├── sign-up/            # Registration and avatar choice
│   │   ├── forgot-password/    # Request a reset email
│   │   ├── reset-password/     # Set a new password
│   │   └── legal/              # Legal notice and privacy policy
│   ├── models/                 # Firestore and view models
│   ├── services/               # Auth, users, channels, messages, presence, workspace store
│   └── shared/                 # Pipes, validators, guards, shared components and styles
├── assets/                     # Icons, images, fonts
├── environments/               # Firebase web config
└── styles.scss                 # Global styles and design tokens
docs/design-spec.md             # Colors, typography and animations from Figma
firestore.rules                 # Firestore security rules
scripts/seed-demo-data.mjs      # Demo data
```

## Team workflow

1. Update `main`: `git checkout main && git pull`
2. Create a branch: `git checkout -b fix/short-name`
3. Commit small, focused changes with [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `style:`, `docs:`)
4. Push and open a pull request into `main`; a teammate reviews and merges it.

## Team

Developed by Jakob Moussa, Raphael Neuberger and Samrawit Tesfay as part of the Developer Akademie frontend course.
