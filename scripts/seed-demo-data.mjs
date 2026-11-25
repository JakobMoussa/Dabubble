/**
 * Fills the Firebase project with believable demo data for reviewers.
 * Usage: SEED_PASSWORD=<demo-password> node scripts/seed-demo-data.mjs
 * Reads the web config from src/environments/environment.ts.
 */
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, doc, getFirestore, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';

const PASSWORD = process.env.SEED_PASSWORD;
if (!PASSWORD || PASSWORD.length < 8) {
  throw new Error('Bitte SEED_PASSWORD (mind. 8 Zeichen) setzen.');
}

const app = initializeApp(readConfig());
const auth = getAuth(app);
const db = getFirestore(app);

const PEOPLE = {
  sofia: { name: 'Sofia Müller', avatar: 'assets/img/sofia-mueller.png' },
  noah: { name: 'Noah Braun', avatar: 'assets/img/noah-braun.png' },
  elise: { name: 'Elise Roth', avatar: 'assets/img/elise-roth.png' },
  elias: { name: 'Elias Neumann', avatar: 'assets/img/elias-neumann.png' },
  steffen: { name: 'Steffen Hoffmann', avatar: 'assets/img/steffen-hoffmann.png' }
};
const uids = {};


/** Reads the Firebase web config from the environment file. */
function readConfig() {
  const source = readFileSync(new URL('../src/environments/environment.ts', import.meta.url), 'utf8');
  const block = source.slice(source.indexOf('firebase:') + 9, source.lastIndexOf('}') - 1);
  return Function(`return (${block.trim().replace(/,\s*$/, '')})`)();
}


/** Signs in as the demo user, creating the account if it does not exist. */
async function signInAs(key) {
  const email = `${key}@dabubble-demo.de`;
  await signOut(auth);
  try {
    return (await signInWithEmailAndPassword(auth, email, PASSWORD)).user;
  } catch {
    return (await createUserWithEmailAndPassword(auth, email, PASSWORD)).user;
  }
}


/** Creates the demo accounts and their profile documents. */
async function createPeople() {
  for (const [key, person] of Object.entries(PEOPLE)) {
    const user = await signInAs(key);
    uids[key] = user.uid;
    const profile = { uid: user.uid, email: user.email, status: 'offline', isGuest: false, ...person };
    await setDoc(doc(db, 'users', user.uid), profile);
  }
}


/** Creates a default channel that all demo users are members of. */
async function createChannel(id, name, description, ownerKey) {
  await signInAs(ownerKey);
  await setDoc(doc(db, 'channels', id), {
    name, nameLower: name.toLowerCase(), description, isDefault: true,
    createdBy: uids[ownerKey], memberIds: Object.values(uids), createdAt: Date.now() - 864e5 * 3
  });
}


/** Adds a message to a channel and returns its id. */
async function post(channelId, authorKey, text, minutesAgo, reactions = {}) {
  await signInAs(authorKey);
  const reactionMap = Object.fromEntries(Object.entries(reactions).map(([e, keys]) => [e, keys.map((k) => uids[k])]));
  const message = {
    text, authorId: uids[authorKey], createdAt: Date.now() - minutesAgo * 6e4,
    editedAt: null, reactions: reactionMap, threadCount: 0, lastThreadAt: null
  };
  return (await addDoc(collection(db, `channels/${channelId}/messages`), message)).id;
}


/** Adds a thread reply to a message and updates the thread counter. */
async function reply(channelId, messageId, authorKey, text, minutesAgo) {
  await signInAs(authorKey);
  const createdAt = Date.now() - minutesAgo * 6e4;
  const base = `channels/${channelId}/messages/${messageId}`;
  await addDoc(collection(db, `${base}/thread`), {
    text, authorId: uids[authorKey], createdAt, editedAt: null, reactions: {}, threadCount: 0, lastThreadAt: null
  });
  await updateDoc(doc(db, base), { threadCount: increment(1), lastThreadAt: createdAt });
}


/** Seeds the development team channel with messages, a thread and reactions. */
async function seedEntwicklerteam() {
  await createChannel('entwicklerteam', 'Entwicklerteam', 'Dieser Channel ist für alles rund um die Entwicklung von DABubble vorgesehen.', 'noah');
  const question = await post('entwicklerteam', 'noah', 'Welche Version von Angular nutzen wir aktuell für DABubble?', 1500);
  await reply('entwicklerteam', question, 'sofia', 'Angular 19 mit Standalone Components und Signals.', 1480);
  await reply('entwicklerteam', question, 'elias', 'Genau, und Firebase für Login und Echtzeit-Daten.', 1460);
  await post('entwicklerteam', 'sofia', 'Ich habe die Reaktionen fertig, bitte einmal testen 🚀', 95, { '🚀': ['noah', 'elias'], '✅': ['steffen'] });
  await post('entwicklerteam', 'steffen', 'Das Review für die Channel-Verwaltung mache ich heute Nachmittag.', 40, { '👍': ['sofia'] });
}


/** Seeds the office team channel with messages and a reaction. */
async function seedOfficeTeam() {
  await createChannel('office-team', 'Office-team', 'Organisation, Termine und alles, was nicht Code ist.', 'elise');
  await post('office-team', 'elise', 'Guten Morgen zusammen! Daily ist heute um 9:30 Uhr.', 300, { '☀️': ['noah', 'steffen'] });
  await post('office-team', 'elias', 'Ich bin heute ab 15 Uhr im Homeoffice erreichbar.', 120);
}


await createPeople();
await seedEntwicklerteam();
await seedOfficeTeam();
await signOut(auth);
console.log('Demo-Daten angelegt:', Object.keys(uids).join(', '));
process.exit(0);
