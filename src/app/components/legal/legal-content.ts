export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalPage {
  title: string;
  sections: LegalSection[];
}

const TEAM = 'Raphael Neuberger, Jakob Moussa und Samrawit Tesfay';

export const LEGAL_PAGES: Record<'imprint' | 'privacy', LegalPage> = {
  imprint: {
    title: 'Impressum',
    sections: [
      {
        heading: 'Projekt',
        paragraphs: [
          'DABubble ist ein nicht-kommerzielles Lernprojekt, entstanden im Rahmen der Weiterbildung zum Fullstack-Entwickler an der Developer Akademie.',
          `Umgesetzt von: ${TEAM}.`
        ]
      },
      {
        heading: 'Haftung für Inhalte',
        paragraphs: [
          'Die Inhalte dieser Anwendung dienen ausschließlich Demonstrations- und Lernzwecken. Für Inhalte, die Nutzerinnen und Nutzer selbst einstellen, übernehmen wir keine Gewähr.'
        ]
      }
    ]
  },
  privacy: {
    title: 'Datenschutzerklärung',
    sections: [
      {
        heading: 'Welche Daten wir verarbeiten',
        paragraphs: [
          'Bei der Registrierung speichern wir Name, E-Mail-Adresse und den gewählten Avatar. Nachrichten, Reaktionen und Channel-Mitgliedschaften werden gespeichert, damit der Chat funktioniert.',
          'Beim Gäste-Login wird ein anonymes Konto ohne personenbezogene Angaben angelegt.'
        ]
      },
      {
        heading: 'Hosting und Dienstleister',
        paragraphs: [
          'Anmeldung und Datenbank laufen über Google Firebase (Authentication, Cloud Firestore) mit Datenspeicherung in der Region europe-west3 (Frankfurt). Die Anmeldung mit Google erfolgt über Google als Identitätsanbieter.',
          'Die Anwendung selbst wird auf einem Server der Developer Akademie ausgeliefert.'
        ]
      },
      {
        heading: 'Speicherung im Browser',
        paragraphs: [
          'Wir speichern im Browser nur technisch notwendige Daten: die Anmeldesitzung, ob die Startanimation bereits gezeigt wurde, und zuletzt genutzte Emojis. Es werden keine Tracking- oder Werbe-Cookies verwendet.'
        ]
      },
      {
        heading: 'Deine Rechte',
        paragraphs: [
          'Du hast das Recht auf Auskunft, Berichtigung und Löschung deiner Daten. Da es sich um ein Lernprojekt handelt, werden Testdaten regelmäßig entfernt.'
        ]
      }
    ]
  }
};
