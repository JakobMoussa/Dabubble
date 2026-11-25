# DABubble – Design-Spezifikation (aus Figma)

Quelle: Figma „DABubble (Slack Clone)“, Seiten *Prototype* und *Components*.

## Farben
| Token | Wert | Verwendung |
|---|---|---|
| `--purple-1` | `#444DF2` | Primär-Buttons, aktive Icons, Überschriften |
| `--purple-2` | `#797EF3` | Hover, Avatar-Platzhalter, Links |
| `--purple-3` | `#535AF1` | Button pressed |
| `--bg-color` | `#ECEEFE` | Seitenhintergrund, Inputs |
| `--light-purple` | `#ADB0D9` | Linien, Rahmen |
| `--text-gray` | `#686868` | Sekundärtext, Placeholder |
| `--online-green` | `#92C83E` | Online-Status |
| `--error-pink` | `#ED1E79` | Fehlermeldungen |

Für Text auf hellem Grund sind einige Figma-Farben minimal abgedunkelt, damit der Kontrast mindestens 4,5:1 erreicht (WCAG AA). Flächen, Rahmen und Punkte behalten die Figma-Farbe.

| Token | Wert | Figma-Farbe | Verwendung |
|---|---|---|---|
| `--purple-3-text` | `#4E55F0` | `#535AF1` | Links und Hover-Text auf `--bg-color` |
| `--online-text` | `#3F7A12` | `#92C83E` | Text „Aktiv“ im Profil |
| `--link-blue` | `#0B66CC` | `#1381FF` | E-Mail-Adresse im Profil |
| `--error-text` | `#CF1468` | `#ED1E79` | Text von Fehlermeldungen |

## Schatten
- Header / Karten: `0 2px 10px rgba(0,0,0,.08)`
- Overlays / Popups: `0 6px 10px rgba(0,0,0,.2)`

## Typografie (Nunito)
46 · 38 · 32 · 26 · 22 · 18 · 15 · 12 px (Basis 18px = 1rem).
Display: Bold 46px Desktop / Bold 32px Mobil, Zeilenhöhe 120 %.

## Breakpoints
- Desktop-Frames 1920 × 1080, Content zentriert, ab 1920px begrenzen
- Mobile-Frames 430 × 932, responsiv bis 320px prüfen

## Animationen und Übergänge
| Element | Auslöser | Animation |
|---|---|---|
| Logo-Intro | Seitenstart (1× pro Sitzung) | 0,5 s warten → Step 1 in 0,3 s ease-out → Final in 0,5 s ease-out |
| Buttons, Icons, Listeneinträge | Hover | 80–100 ms ease-in |
| Button gedrückt | Press | 80 ms ease-in (`--purple-3`) |
| Overlays (Profil, Mitglieder, Channel) | Klick | Einblenden 100 ms |
| Erfolgs-Meldung (Konto erstellt, E-Mail gesendet) | Submit | von der Seite hereingleiten 100 ms ease-out, nach Timeout 200 ms ausblenden, danach Weiterleitung |
| Mobile Menüs (Profil, Logout) | Klick | von oben 100 ms |
| Mitglieder hinzufügen (mobil) | Klick | von oben 300 ms ease-out |

## Flows (Prototype)
- Start Desktop: `00-Intro` → `01-Log In`; Start Mobil: `00-Intro` (mobil)
- Login: *Anmelden* / *Gäste-Login* → Workspace; *Konto erstellen* → `02-Sign In` → `03-Choose avatar` → Meldung → Workspace
- Passwort vergessen: `04-Send email` → Meldung → E-Mail → `05-Reset password` → Meldung → Login
- Workspace: Channel / DM öffnen, *Antworten* öffnet Thread rechts (mobil eigener Screen), Menü über Icon ein-/ausblenden

## Assets im Repo
- `src/assets/icons/figma/*-default.svg` / `*-hover.svg` – Material Symbols aus Figma
- `src/assets/img/emojis/` – Reaktions-Emojis (Emojitwo, siehe Figma-Hinweis)
- `src/assets/img/logo/` – Logo und Intro-Zwischenstufen
