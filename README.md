# 💬 DABubble

**DABubble** ist eine moderne Chat- und Messaging-Webanwendung (inspiriert von Slack), entwickelt mit **Angular 19**. Das Projekt ermöglicht Team-Kommunikation über Channels, Direktnachrichten und Threads.

---

## 📋 Inhaltsverzeichnis

- [Voraussetzungen](#-voraussetzungen)
- [Installation & Setup](#-installation--setup)
- [Entwicklungsserver starten](#-entwicklungsserver-starten)
- [Build für Produktion](#-build-für-produktion)
- [Projektstruktur](#-projektstruktur)
- [Tech-Stack](#-tech-stack)
- [Git Workflow für Teammitglieder](#-git-workflow-für-teammitglieder)

---

## ⚙️ Voraussetzungen

Stelle sicher, dass folgende Werkzeuge auf deinem System installiert sind:

- **Git**: [git-scm.com](https://git-scm.com/)
- **Node.js**: Version `20.x` oder `22.x` empfohlen ([nodejs.org](https://nodejs.org/))
- **npm**: Version `10.x` oder höher (wird mit Node.js installiert)
- *(Optional)* **Angular CLI**:
  ```bash
  npm install -g @angular/cli
  ```

---

## 🚀 Installation & Setup

Befolge diese Schritte, um das Projekt lokal bei dir einzurichten:

### 1. Repository klonen

```bash
git clone https://github.com/JakobMoussa/Dabubble.git
```

### 2. In das Projektverzeichnis wechseln

```bash
cd Dabubble
```
*(Hinweis: Falls der lokale Ordnername abweicht, wechsle in den entsprechenden Projektordner).*

### 3. Abhängigkeiten installieren

```bash
npm install
```

---

## 💻 Entwicklungsserver starten

Nach erfolgreicher Installation der Abhängigkeiten kannst du den lokalen Entwicklungsserver starten:

```bash
npm start
```
*(Alternativ: `ng serve`)*

Sobald der Build abgeschlossen ist, öffne deinen Browser unter:

👉 **[http://localhost:4200/](http://localhost:4200/)**

> **Tipp:** Der Server verfügt über Hot-Reloading. Änderungen im Code werden automatisch im Browser aktualisiert.

---

## 📦 Build für Produktion

Um einen optimierten Produktions-Build zu generieren:

```bash
npm run build
```

Die fertigen Artefakte befinden sich anschließend im Ordner `dist/dabubble/`.

---

## 🗂️ Projektstruktur

```text
dabubble/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/          # Haupt-Dashboard (Chat, Header, Sidebar)
│   │   │   │   ├── add-channel-modal/
│   │   │   │   ├── profile-popup/
│   │   │   │   └── thread-panel/
│   │   │   ├── login/              # Authentifizierung: Login
│   │   │   ├── sign-up/            # Registrierung
│   │   │   ├── forgot-password/    # Passwort vergessen
│   │   │   └── reset-password/     # Passwort zurücksetzen
│   │   ├── models/                 # TypeScript Datenmodelle / Interfaces
│   │   ├── services/               # State- und Datendienste
│   │   ├── shared/                 # Wiederverwendbare Layouts & Styles
│   │   ├── app.routes.ts           # Routing-Konfiguration
│   │   └── app.config.ts           # App-Konfiguration
│   ├── assets/                     # Bilder, Icons, Fonts
│   └── styles.scss                 # Globale Styles & Variablen
├── angular.json                    # Angular CLI Konfiguration
└── package.json                    # Dependencies & NPM Scripts
```

---

## 🛠️ Tech-Stack

- **Framework:** [Angular 19](https://angular.dev/)
- **Sprache:** TypeScript
- **Styling:** SCSS
- **Reaktivität:** RxJS

---

## 🤝 Git Workflow für Teammitglieder

Damit wir reibungslos zusammenarbeiten können, empfiehlt sich folgender Workflow:

1. **Neuesten Stand von `main` abholen:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Neuen Feature-Branch erstellen:**
   ```bash
   git checkout -b feature/dein-feature-name
   ```
3. **Änderungen committen:**
   ```bash
   git add .
   git commit -m "feat: kurze Beschreibung deiner Änderung"
   ```
4. **Branch pushen & Pull Request erstellen:**
   ```bash
   git push origin feature/dein-feature-name
   ```
   Erstelle anschließend auf GitHub einen Pull Request in den `main`-Branch.
