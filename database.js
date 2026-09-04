/**
 * Akhi Homeo Hall (আঁখি হোমিও হল)
 * SQLite Database Manager using Native Node 24 SQLite Engine
 */

const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');

const DB_PATH = path.join(__dirname, 'akhi_homeo.db');
const db = new DatabaseSync(DB_PATH);

// Helper for secure password hashing with PBKDF2
function hashPassword(password, salt = null) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const check = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return check === hash;
}

// Initialize Database Tables
function initDatabase() {
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // 1. Users & Security Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT NOT NULL
    );
  `);

  // 2. Patients Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      reg_no TEXT UNIQUE,
      name TEXT NOT NULL,
      age TEXT,
      gender TEXT,
      mobile TEXT NOT NULL,
      blood_group TEXT,
      address TEXT,
      chief_complaint TEXT,
      symptoms TEXT,
      modalities TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 3. Prescriptions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      rx_date TEXT NOT NULL,
      medicines_json TEXT NOT NULL,
      advice TEXT,
      next_visit TEXT,
      total_fee REAL DEFAULT 0,
      paid REAL DEFAULT 0,
      due REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    );
  `);

  // 4. Daily Ledger & Transactions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT,
      patient_name TEXT,
      mobile TEXT,
      amount REAL NOT NULL,
      paid REAL NOT NULL,
      due REAL DEFAULT 0,
      note TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 5. Remedies / Medicines Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS remedies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bangla_name TEXT,
      category TEXT,
      rack TEXT,
      stock INTEGER DEFAULT 10,
      potencies_json TEXT,
      indication TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 6. Clinic Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // 7. Security Audit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      timestamp TEXT NOT NULL
    );
  `);

  // Seed default Admin User if not exists (Default: admin / admin123, PIN: 1234)
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const { hash: passHash, salt } = hashPassword('admin123');
    const { hash: pinHash } = hashPassword('1234', salt);
    db.prepare(`
      INSERT INTO users (id, username, password_hash, salt, pin_hash, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('usr_admin', 'admin', passHash, salt, pinHash, 'admin', new Date().toISOString());

    logAudit('SYSTEM_INIT', 'Default admin user created with username "admin" and PIN "1234"');
  }

  // Seed default settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get().count;
  if (settingsCount === 0) {
    const defaultSettings = {
      pharmacyName: "আঁখি হোমিও হল (Akhi Homeo Hall)",
      doctorName: "ডাঃ মোঃ আবু হুরায়রা (DHMS, RHMP)",
      address: "মিরপুর-১০, ঢাকা | মোবাইল: 01712-000000",
      slogan: "অভিজ্ঞ হোমিও চিকিৎসক দ্বারা সার্বিক চিকিৎসা ও খাঁটি ঔষধের বিশ্বস্ত প্রতিষ্ঠান",
      autoLockMinutes: "10"
    };
    for (const [key, val] of Object.entries(defaultSettings)) {
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, val);
    }
  }

  // Seed standard remedies if empty
  const remediesCount = db.prepare('SELECT COUNT(*) as count FROM remedies').get().count;
  if (remediesCount === 0) {
    const remediesModule = require('./remedies_db.js');
    // Note: remedies_db is browser script or we can read DEFAULT_REMEDIES directly
    seedInitialRemedies();
  }

  console.log('✅ SQLite Database initialized successfully at:', DB_PATH);
}

function seedInitialRemedies() {
  const remediesList = [
    { id: 'rem_1', name: 'Aconitum Napellus (Aconite)', banglaName: 'একোনাইট নেপেলাস', potencies: ['Q', '30C', '200C', '1M'], category: 'Dilution', rack: 'A-01', indication: 'হঠাৎ তীব্র জ্বর, ভয়, অস্থিরতা, ঠান্ডা বাতাসে কাশি', stock: 12 },
    { id: 'rem_2', name: 'Arnica Montana', banglaName: 'আর্নিকা মন্টানা', potencies: ['Q', '30C', '200C', '1M', '10M'], category: 'Mother Tincture / Dilution', rack: 'A-02', indication: 'আঘাত লাগা, থেঁতলে যাওয়া ব্যথা, পেশীর ক্লান্তি, রক্ত জমাট', stock: 25 },
    { id: 'rem_3', name: 'Arsenicum Album', banglaName: 'আর্সেনিক অ্যালবাম', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'A-03', indication: 'ফুড পয়জনিং, ডায়রিয়া, জ্বালাকর পেটব্যথা, ঘনঘন অল্প পানি পিপাসা', stock: 18 },
    { id: 'rem_4', name: 'Belladonna', banglaName: 'বেলাডোনা', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'B-01', indication: 'উচ্চ জ্বর, লালচে মুখমণ্ডল, গলাব্যথা, টনসিলাইটিস, তীব্র মাথাব্যথা', stock: 15 },
    { id: 'rem_5', name: 'Bryonia Alba', banglaName: 'ব্রায়োনিয়া অ্যালবা', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'B-02', indication: 'নড়াচড়ায় বৃদ্ধি, শুষ্ক কাশি, অতিরিক্ত পানি পিপাসা, কোষ্ঠকাঠিন্য', stock: 14 },
    { id: 'rem_6', name: 'Calcarea Carbonica', banglaName: 'ক্যালকেরিয়া কার্ব', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'C-01', indication: 'স্থূলতা, মাথায় ঘাম, ঠান্ডা লাগার প্রবণতা, শিশুদের দেরিতে হাঁটা ও দাঁত ওঠা', stock: 10 },
    { id: 'rem_7', name: 'Calcarea Phosphorica', banglaName: 'ক্যালকেরিয়া ফস', potencies: ['6X', '12X', '30X', '200X'], category: 'Biochemic', rack: 'BIO-01', indication: 'হাড়ের দুর্বলতা, ক্যালসিয়াম ঘাটতি, রক্তস্বল্পতা, রিকেট', stock: 30 },
    { id: 'rem_8', name: 'Cantharis', banglaName: 'ক্যান্থারিস', potencies: ['Q', '30C', '200C'], category: 'Dilution / MT', rack: 'C-02', indication: 'প্রস্রাবে প্রচণ্ড জ্বালাপোড়া, ইউরিনারি ইনফেকশন (UTI), আগুনে পোড়া ঘা', stock: 8 },
    { id: 'rem_9', name: 'Carbo Vegetabilis', banglaName: 'কার্বো ভেজ', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'C-03', indication: 'পেটে গ্যাস, পেট ফাঁপা, শীতল শরীর কিন্তু মুক্ত বাতাস চায়, বদহজম', stock: 16 },
    { id: 'rem_10', name: 'Chamomilla', banglaName: 'ক্যামোমিলা', potencies: ['30C', '200C'], category: 'Dilution', rack: 'C-04', indication: 'শিশুদের দাঁত ওঠার সময়ের খিটখিটে মেজাজ ও ডায়রিয়া, অসহ্য ব্যথা', stock: 11 },
    { id: 'rem_11', name: 'Cinchona Officinalis (China)', banglaName: 'চায়না অফিসিনালিস', potencies: ['Q', '30C', '200C'], category: 'Dilution / MT', rack: 'C-05', indication: 'অতিরিক্ত রক্তক্ষরণ বা তরল ক্ষয়ের পর দুর্বলতা, ম্যালেরিয়া জ্বর, গ্যাস', stock: 20 },
    { id: 'rem_12', name: 'Dulcamara', banglaName: 'ডালকামারা', potencies: ['30C', '200C'], category: 'Dilution', rack: 'D-01', indication: 'বৃষ্টি বা স্যাঁতসেঁতে আবহাওয়ায় রোগবৃদ্ধি, বাতব্যথা, ঠান্ডা লাগা', stock: 9 },
    { id: 'rem_13', name: 'Ferrum Phosphoricum', banglaName: 'ফেরাম ফস', potencies: ['6X', '12X', '30X'], category: 'Biochemic', rack: 'BIO-02', indication: 'জ্বরের প্রথম পর্যায়, রক্তস্বল্পতা (Anemia), প্রদাহ, দুর্বলতা', stock: 22 },
    { id: 'rem_14', name: 'Gelsemium', banglaName: 'জেলসিমিয়াম', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'G-01', indication: 'মাথাঘোরা, তন্দ্রাচ্ছন্নতা, ভীতি বা পরীক্ষার পূর্বে বুক ধড়ফড় ও ডায়রিয়া', stock: 14 },
    { id: 'rem_15', name: 'Hepar Sulphuris Calcareum', banglaName: 'হিপার সালফ', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'H-01', indication: 'ফোঁড়া, পুঁজ সৃষ্টি, ঠান্ডায় অতি সংবেদনশীলতা, গলায় কাঁটা ফোটার মত ব্যথা', stock: 12 },
    { id: 'rem_16', name: 'Hypericum Perforatum', banglaName: 'হাইপেরিকাম', potencies: ['Q', '30C', '200C', '1M'], category: 'Dilution / MT', rack: 'H-02', indication: 'স্নায়ু বা নার্ভে আঘাত (যেমন আঙ্গুল চাপা পড়া, সুচ ফোটা), স্পাইনাল ইনজুরি', stock: 15 },
    { id: 'rem_17', name: 'Ignatia Amara', banglaName: 'ইগনেশিয়া', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'I-01', indication: 'শোক, দুঃখ, মানসিক আঘাত, হিস্ট্রিয়া, ঘন ঘন দীর্ঘশ্বাস ফেলা', stock: 10 },
    { id: 'rem_18', name: 'Kali Bichromicum', banglaName: 'কালি বাইক্রমিকাম', potencies: ['30C', '200C'], category: 'Dilution', rack: 'K-01', indication: 'সাইনাসাইটিস, আঠালো ঘন কফ ও সর্দি, পেটের আলসার', stock: 8 },
    { id: 'rem_19', name: 'Kali Muriaticum', banglaName: 'কালি মিউর', potencies: ['6X', '12X'], category: 'Biochemic', rack: 'BIO-03', indication: 'জিহ্বায় সাদা প্রলেপ, কানের সংক্রমণ, চর্মরোগ, খুশকি', stock: 19 },
    { id: 'rem_20', name: 'Lachesis Mutus', banglaName: 'ল্যাকেসিস', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'L-01', indication: 'বামদিকের সমস্যা, গলায় টাইট পোশাক অপছন্দ, মেনোপজের জটিলতা, হিংসুটে ভাব', stock: 7 },
    { id: 'rem_21', name: 'Lycopodium Clavatum', banglaName: 'লাইকোপোডিয়াম', potencies: ['30C', '200C', '1M', '10M'], category: 'Dilution', rack: 'L-02', indication: 'বিকাল ৪টা-৮টায় বৃদ্ধি, পেটের নিচের অংশে গ্যাস, লিভার ও প্রস্রাবের রোগ', stock: 18 },
    { id: 'rem_22', name: 'Magnesia Phosphorica', banglaName: 'ম্যাগনেশিয়া ফস', potencies: ['6X', '12X', '30X'], category: 'Biochemic', rack: 'BIO-04', indication: 'মাসিক বা পেটের তীব্র খিঁচুনিযুক্ত ব্যথা (গরম সেকে উপশম), সায়াটিকা', stock: 24 },
    { id: 'rem_23', name: 'Natrum Muriaticum', banglaName: 'ন্যাট্রাম মিউর', potencies: ['30C', '200C', '1M', '6X', '12X'], category: 'Dilution / Biochemic', rack: 'N-01', indication: 'লবণ খাওয়ার তীব্র ইচ্ছা, মানসিক হতাশা, রোদে মাথাব্যথা, একজিমা', stock: 17 },
    { id: 'rem_24', name: 'Natrum Sulphuricum', banglaName: 'ন্যাট্রাম সালফ', potencies: ['6X', '12X', '30C', '200C'], category: 'Dilution / Biochemic', rack: 'BIO-05', indication: 'স্যাঁতসেঁতে আবহাওয়ায় হাঁপানি/অ্যাজমা, লিভারের সমস্যা, পিত্তবমি', stock: 15 },
    { id: 'rem_25', name: 'Nux Vomica', banglaName: 'নাক্স ভমিকা', potencies: ['30C', '200C', '1M', '10M'], category: 'Dilution', rack: 'N-02', indication: 'অতিরিক্ত ধূমপান/মশলাযুক্ত খাবারে বদহজম, কোষ্ঠকাঠিন্য, রাগ, অনিদ্রা', stock: 35 },
    { id: 'rem_26', name: 'Phosphorus', banglaName: 'ফসফরাস', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'P-01', indication: 'ঠান্ডা পানীয়র ইচ্ছা, রক্তক্ষরণের প্রবণতা, ফুসফুসের সংক্রমণ, উদ্বেগ', stock: 14 },
    { id: 'rem_27', name: 'Pulsatilla Nigricans', banglaName: 'পালসেটিলা', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'P-02', indication: 'পিপাসাহীনতা, পরিবর্তনশীল লক্ষণ, নরম মেজাজ, মুক্ত বাতাসে উপশম, অনিয়মিত মাসিক', stock: 22 },
    { id: 'rem_28', name: 'Rhus Toxicodendron', banglaName: 'রাস টক্স', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'R-01', indication: 'প্রথম নড়াচড়ায় কষ্ট কিন্তু অনবরত চললে উপশম, বাতব্যথা, ভিজে জ্বর', stock: 26 },
    { id: 'rem_29', name: 'Ruta Graveolens', banglaName: 'রুটা গ্র্যাভিওলেন্স', potencies: ['Q', '30C', '200C'], category: 'Dilution / MT', rack: 'R-02', indication: 'টেন্ডন, লিগামেন্ট ও চোখের স্নায়ুর চাপ/ব্যথা, মচকানো চোট', stock: 13 },
    { id: 'rem_30', name: 'Sepia Officinalis', banglaName: 'সিপিয়া', potencies: ['30C', '200C', '1M'], category: 'Dilution', rack: 'S-01', indication: 'জরায়ু ও হরমোনজনিত সমস্যা, মুখে মেছতা/দাগ, পরিবারের প্রতি অনীহা', stock: 10 },
    { id: 'rem_31', name: 'Silicea (Silica)', banglaName: 'সাইলেসিয়া', potencies: ['6X', '12X', '30C', '200C', '1M'], category: 'Dilution / Biochemic', rack: 'S-02', indication: 'পুঁজ দূরীকরণ, ফোড়া পাকানো ও ফাটানো, অতিরিক্ত পায়ে ঘাম, দুর্বল নখ', stock: 16 },
    { id: 'rem_32', name: 'Spongia Tosta', banglaName: 'স্পঞ্জিয়া টোস্টা', potencies: ['30C', '200C'], category: 'Dilution', rack: 'S-03', indication: 'কাঠ চেরার মত শুকনো খুশখুশে কাশি (Croup), শ্বাসনালীতে সাঁসাঁ শব্দ', stock: 9 },
    { id: 'rem_33', name: 'Sulphur', banglaName: 'সালফার', potencies: ['30C', '200C', '1M', '10M'], category: 'Dilution', rack: 'S-04', indication: 'চুলকানি ও চর্মরোগ (গোসলে বাড়ে), মাথায় ও তালুতে জ্বালাপোড়া, সকালের ক্ষুধা', stock: 28 },
    { id: 'rem_34', name: 'Syzygium Jambolanum', banglaName: 'সাইজিজিয়াম জাম্বোলানাম', potencies: ['Q'], category: 'Mother Tincture', rack: 'MT-01', indication: 'ডায়াবেটিস নিয়ন্ত্রণ, রক্তে গ্লুকোজ হ্রাস, অতিরিক্ত প্রস্রাবের বেগ', stock: 20 },
    { id: 'rem_35', name: 'Thuja Occidentalis', banglaName: 'থুজা অক্সিডেন্টালিস', potencies: ['Q', '30C', '200C', '1M', '10M'], category: 'Dilution / MT', rack: 'T-01', indication: 'আঁচিল (Warts), টিউমার, পলিপ, টিকাদানের কুফল, চর্মের অস্বাভাবিক বৃদ্ধি', stock: 32 },
    { id: 'rem_36', name: 'Crataegus Oxyacantha', banglaName: 'ক্র্যাটেগাস অক্সি', potencies: ['Q'], category: 'Mother Tincture', rack: 'MT-02', indication: 'হার্টের টনিক, রক্তচাপ ও বুক ধড়ফড় নিয়ন্ত্রণ, হৃদযন্ত্রের শক্তি বৃদ্ধি', stock: 15 },
    { id: 'rem_37', name: 'Passiflora Incarnata', banglaName: 'প্যাসিফ্লোরা ইনকারনাটা', potencies: ['Q'], category: 'Mother Tincture', rack: 'MT-03', indication: 'অনিদ্রা (Insomnia), মানসিক অস্থিরতা, অতিরিক্ত চিন্তা দূরীকরণ', stock: 18 },
    { id: 'rem_38', name: 'Berberis Vulgaris', banglaName: 'বারবারিস ভালগারিস', potencies: ['Q', '30C', '200C'], category: 'Mother Tincture / Dilution', rack: 'MT-04', indication: 'কিডনি স্টোন (Kidney Stone), মূত্রনালীর তীব্র ব্যথা, পিঠের নিচের ব্যথা', stock: 24 },
    { id: 'rem_39', name: 'Ocimum Sanctum (Tulsi)', banglaName: 'অসিমাম স্যাঙ্কটাম (তুলসী)', potencies: ['Q'], category: 'Mother Tincture', rack: 'MT-05', indication: 'সর্দি, কাশি, ফ্লু ও সাধারণ ভাইরাল জ্বর', stock: 16 },
    { id: 'rem_40', name: 'Ashwagandha (Withania Somnifera)', banglaName: 'অশ্বগন্ধা', potencies: ['Q'], category: 'Mother Tincture', rack: 'MT-06', indication: 'শারীরিক ও স্নায়বিক দুর্বলতা, শুক্রতারল্য, জীবনীশক্তি বৃদ্ধি', stock: 22 }
  ];

  const stmt = db.prepare(`
    INSERT INTO remedies (id, name, bangla_name, category, rack, stock, potencies_json, indication, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const rem of remediesList) {
    stmt.run(
      rem.id,
      rem.name,
      rem.banglaName || '',
      rem.category || 'Dilution',
      rem.rack || 'A-01',
      rem.stock || 10,
      JSON.stringify(rem.potencies || []),
      rem.indication || '',
      new Date().toISOString()
    );
  }
}

// Log Security Audit Trail
function logAudit(action, details = '', ip = '127.0.0.1') {
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, action, details, ip_address, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run('log_' + Date.now() + Math.random().toString(36).substring(7), action, details, ip, new Date().toISOString());
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
}

module.exports = {
  db,
  initDatabase,
  hashPassword,
  verifyPassword,
  logAudit,
  DB_PATH
};
