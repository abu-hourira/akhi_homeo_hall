/**
 * Akhi Homeo Hall (আঁখি হোমিও হল)
 * Secure Digital Notebook Application Logic with SQLite Backend
 */

// --- BILINGUAL DICTIONARY (i18n) ---
const I18N = {
  bn: {
    brand_title: "আঁখি হোমিও হল",
    brand_sub: "নিরাপদ কেস ও ফার্মেসি নোটবুক",
    nav_patients: "রোগীর কেস ডায়েরি",
    nav_prescriptions: "প্রেসক্রিপশন ও মেমো",
    nav_ledger: "দৈনিক আয়-ব্যয়",
    nav_due: "বাকি খাতা (Due)",
    nav_remedies: "ঔষধ ও র‍্যাক নোট",
    nav_backup: "নিরাপত্তা ও সেটিংস",
    today_collection: "আজকের জমা:",
    btn_new_patient: "নতুন রোগী যোগ",
    btn_new_entry: "নতুন এন্ট্রি",
    stat_total_patients: "মোট নিবন্ধিত রোগী",
    stat_today_sales: "আজকের মোট বিক্রয়",
    stat_total_due: "মোট বকেয়া (বাকি)",
    stat_total_remedies: "মজুদ হোমিও ঔষধ",
    stat_remedy_sub: "র‍্যাক ও পোটেন্সি তালিকা",
    filter_all: "সকল রোগী",
    filter_today: "আজকের রোগী",
    filter_due_only: "বাকি আছে",
    export_csv: "এক্সেল/CSV ডাউনলোড",
    btn_create_prescription: "নতুন প্রেসক্রিপশন তৈরি",
    btn_add_sale: "বিক্রয় এন্ট্রি",
    btn_add_expense: "দোকান খরচ এন্ট্রি",
    btn_add_remedy: "নতুন ঔষধ যোগ করুন",
    th_date: "তারিখ",
    th_reg: "রেজিস্ট্রেশন নং",
    th_patient_name: "রোগীর নাম",
    th_medicines: "ঔষধের তালিকা",
    th_total: "মোট বিল",
    th_paid: "পরিশোধ",
    th_due: "বাকি",
    th_actions: "অ্যাকশন",
    th_type: "ধরন",
    th_category: "ক্যাটাগরি / রোগী",
    th_mobile: "মোবাইল",
    th_note: "নোট / বিবরণ",
    th_amount: "পরিমাণ (৳)",
    th_status: "অবস্থা",
    th_address: "ঠিকানা",
    th_last_date: "সর্বশেষ তারিখ",
    th_due_amount: "বকেয়া পরিমাণ (৳)",
    clinic_info_title: "ফার্মেসি ও চিকিৎসকের তথ্য সেটিংস",
    label_pharmacy_name: "ফার্মেসির নাম:",
    label_doctor_name: "চিকিৎসকের নাম ও পদবী:",
    label_clinic_address: "ঠিকানা ও ফোন নম্বর:",
    btn_save_settings: "তথ্য সংরক্ষণ করুন"
  },
  en: {
    brand_title: "Akhi Homeo Hall",
    brand_sub: "Secure Case & Pharmacy Notebook",
    nav_patients: "Patient Case Diary",
    nav_prescriptions: "Prescription & Memo",
    nav_ledger: "Daily Accounts Ledger",
    nav_due: "Due Register (Baki)",
    nav_remedies: "Remedies & Rack Notes",
    nav_backup: "Security & Settings",
    today_collection: "Today Collection:",
    btn_new_patient: "New Patient Entry",
    btn_new_entry: "New Entry",
    stat_total_patients: "Total Patients",
    stat_today_sales: "Today's Sales",
    stat_total_due: "Total Due (Baki)",
    stat_total_remedies: "Homeo Remedies",
    stat_remedy_sub: "Racks & Potencies",
    filter_all: "All Patients",
    filter_today: "Today's",
    filter_due_only: "Due Only",
    export_csv: "Export CSV / Excel",
    btn_create_prescription: "Create Prescription",
    btn_add_sale: "Add Sale Entry",
    btn_add_expense: "Add Expense",
    btn_add_remedy: "Add New Remedy",
    th_date: "Date",
    th_reg: "Reg No.",
    th_patient_name: "Patient Name",
    th_medicines: "Prescribed Medicines",
    th_total: "Total Bill",
    th_paid: "Paid",
    th_due: "Due",
    th_actions: "Actions",
    th_type: "Type",
    th_category: "Category / Patient",
    th_mobile: "Mobile",
    th_note: "Notes / Details",
    th_amount: "Amount (৳)",
    th_status: "Status",
    th_address: "Address",
    th_last_date: "Last Date",
    th_due_amount: "Due Amount (৳)",
    clinic_info_title: "Pharmacy & Clinic Settings",
    label_pharmacy_name: "Pharmacy Name:",
    label_doctor_name: "Doctor / Practitioner Name:",
    label_clinic_address: "Address & Mobile:",
    btn_save_settings: "Save Settings"
  }
};

// --- GLOBAL APPLICATION STATE ---
let AppState = {
  currentLang: 'bn',
  currentTheme: 'light',
  currentTab: 'tab-patients',
  patientFilter: 'all',
  
  authToken: sessionStorage.getItem('ahh_auth_token') || null,
  currentUser: null,
  enteredPin: '',
  autoLockMinutes: 10,
  lastActivityTime: Date.now(),
  isLocked: true,

  patients: [],
  transactions: [],
  remedies: [],
  
  clinicSettings: {
    pharmacyName: "আঁখি হোমিও হল (Akhi Homeo Hall)",
    doctorName: "ডাঃ মোঃ আবু হুরায়রা (DHMS, RHMP)",
    address: "মিরপুর-১০, ঢাকা | মোবাইল: 01712-000000",
    slogan: "অভিজ্ঞ হোমিও চিকিৎসক দ্বারা সার্বিক চিকিৎসা ও খাঁটি ঔষধের বিশ্বস্ত প্রতিষ্ঠান",
    autoLockMinutes: "10"
  }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
  initLocaleAndTheme();
  updateLiveDate();
  setupTabNavigation();
  setupActivityListeners();
  
  // Check if active session exists
  if (AppState.authToken) {
    const valid = await verifyAuthToken(AppState.authToken);
    if (valid) {
      unlockAppUI();
      await fetchAllServerData();
    } else {
      lockNotebook();
    }
  } else {
    lockNotebook();
  }

  lucide.createIcons();
});

// --- SECURITY & AUTHENTICATION ENGINE ---
function enterPinDigit(digit) {
  if (AppState.enteredPin.length < 4) {
    AppState.enteredPin += digit;
    updatePinDisplayDots();
    if (AppState.enteredPin.length === 4) {
      setTimeout(() => submitPinUnlock(), 200);
    }
  }
}

function clearPin() {
  AppState.enteredPin = '';
  updatePinDisplayDots();
}

function updatePinDisplayDots() {
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById(`p-dot-${i}`);
    if (dot) {
      if (i <= AppState.enteredPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    }
  }
}

async function submitPinUnlock() {
  if (!AppState.enteredPin) return;
  try {
    const res = await fetch('/api/auth/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: AppState.enteredPin })
    });
    const data = await res.json();
    if (data.success) {
      AppState.authToken = data.token;
      sessionStorage.setItem('ahh_auth_token', data.token);
      AppState.currentUser = data.user;
      unlockAppUI();
      await fetchAllServerData();
      showToast(AppState.currentLang === 'bn' ? 'সফলভাবে আনলক হয়েছে!' : 'Unlocked successfully!');
    } else {
      showToast(data.message || 'ভুল পিন কোড!', 'error');
      clearPin();
    }
  } catch (err) {
    // If backend is not reached, fallback check with default 1234
    if (AppState.enteredPin === '1234') {
      AppState.authToken = 'offline_token';
      unlockAppUI();
      loadStoredDataFallback();
      showToast('অফলাইন মোডে আনলক হয়েছে!');
    } else {
      showToast('ভুল পিন কোড!', 'error');
      clearPin();
    }
  }
}

async function submitPasswordLogin(event) {
  event.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      AppState.authToken = data.token;
      sessionStorage.setItem('ahh_auth_token', data.token);
      AppState.currentUser = data.user;
      unlockAppUI();
      await fetchAllServerData();
      showToast(AppState.currentLang === 'bn' ? 'স্বাগতম! লগইন সফল হয়েছে।' : 'Login successful!');
    } else {
      showToast(data.message || 'ভুল তথ্য!', 'error');
    }
  } catch (err) {
    if (username === 'admin' && password === 'admin123') {
      AppState.authToken = 'offline_token';
      unlockAppUI();
      loadStoredDataFallback();
      showToast('অফলাইন মোডে লগইন সফল!');
    } else {
      showToast('লগইন ব্যর্থ হয়েছে!', 'error');
    }
  }
}

async function verifyAuthToken(token) {
  try {
    const res = await fetch('/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    return token === 'offline_token';
  }
}

function lockNotebook() {
  AppState.isLocked = true;
  clearPin();
  document.getElementById('security-lock-screen').classList.remove('hidden');
}

function unlockAppUI() {
  AppState.isLocked = false;
  AppState.lastActivityTime = Date.now();
  document.getElementById('security-lock-screen').classList.add('hidden');
}

function switchLoginMode(mode) {
  const pinContainer = document.getElementById('pin-login-container');
  const passForm = document.getElementById('password-login-form');
  if (mode === 'password') {
    pinContainer.style.display = 'none';
    passForm.classList.add('active');
  } else {
    passForm.classList.remove('active');
    pinContainer.style.display = 'flex';
    clearPin();
  }
  lucide.createIcons();
}

// Auto-Lock Inactivity Handler
function setupActivityListeners() {
  const resetTimer = () => {
    AppState.lastActivityTime = Date.now();
  };

  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keydown', resetTimer);
  window.addEventListener('click', resetTimer);
  window.addEventListener('touchstart', resetTimer);

  // Check every 30 seconds
  setInterval(() => {
    if (!AppState.isLocked && AppState.authToken) {
      const elapsedMinutes = (Date.now() - AppState.lastActivityTime) / (1000 * 60);
      if (elapsedMinutes >= Number(AppState.clinicSettings.autoLockMinutes || 10)) {
        lockNotebook();
        showToast(AppState.currentLang === 'bn' ? 'নিরাপত্তার স্বার্থে স্ক্রিন লক করা হয়েছে।' : 'Screen locked due to inactivity.');
      }
    }
  }, 30000);
}

// --- REST API SYNC WITH SQLITE DATABASE ---
async function fetchAllServerData() {
  try {
    const headers = { 'Authorization': `Bearer ${AppState.authToken}` };

    // 1. Fetch Patients
    const patRes = await fetch('/api/patients', { headers });
    if (patRes.ok) {
      const patData = await patRes.json();
      AppState.patients = patData.patients || [];
    }

    // 2. Fetch Transactions
    const txnRes = await fetch('/api/transactions', { headers });
    if (txnRes.ok) {
      const txnData = await txnRes.json();
      AppState.transactions = txnData.transactions || [];
    }

    // 3. Fetch Remedies
    const remRes = await fetch('/api/remedies', { headers });
    if (remRes.ok) {
      const remData = await remRes.json();
      AppState.remedies = remData.remedies || DEFAULT_REMEDIES;
    }

    // 4. Fetch Settings
    const setRes = await fetch('/api/settings', { headers });
    if (setRes.ok) {
      const setData = await setRes.json();
      if (setData.settings) {
        AppState.clinicSettings = { ...AppState.clinicSettings, ...setData.settings };
        document.getElementById('setting-pharmacy-name').value = AppState.clinicSettings.pharmacyName || '';
        document.getElementById('setting-doctor-name').value = AppState.clinicSettings.doctorName || '';
        document.getElementById('setting-clinic-address').value = AppState.clinicSettings.address || '';
      }
    }

    renderAll();
    loadAuditLogs();
  } catch (err) {
    console.warn('API sync failed, loading fallback local data', err);
    loadStoredDataFallback();
    renderAll();
  }
}

function loadStoredDataFallback() {
  const savedPatients = localStorage.getItem('ahh_patients');
  const savedTxns = localStorage.getItem('ahh_transactions');
  const savedRemedies = localStorage.getItem('ahh_remedies');
  const savedSettings = localStorage.getItem('ahh_settings');

  AppState.patients = savedPatients ? JSON.parse(savedPatients) : SAMPLE_PATIENTS;
  AppState.transactions = savedTxns ? JSON.parse(savedTxns) : SAMPLE_TRANSACTIONS;
  AppState.remedies = savedRemedies ? JSON.parse(savedRemedies) : DEFAULT_REMEDIES;
  if (savedSettings) AppState.clinicSettings = JSON.parse(savedSettings);
}

function saveLocalStorageFallback() {
  localStorage.setItem('ahh_patients', JSON.stringify(AppState.patients));
  localStorage.setItem('ahh_transactions', JSON.stringify(AppState.transactions));
  localStorage.setItem('ahh_remedies', JSON.stringify(AppState.remedies));
  localStorage.setItem('ahh_settings', JSON.stringify(AppState.clinicSettings));
}

// --- LANGUAGE & THEME ENGINE ---
function initLocaleAndTheme() {
  const savedTheme = localStorage.getItem('ahh_theme') || 'light';
  AppState.currentTheme = savedTheme;
  document.documentElement.setAttribute('data-theme', AppState.currentTheme);
  document.getElementById('theme-icon').setAttribute('data-lucide', AppState.currentTheme === 'dark' ? 'sun' : 'moon');
  applyTranslations();
}

function toggleTheme() {
  AppState.currentTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', AppState.currentTheme);
  const themeIcon = document.getElementById('theme-icon');
  themeIcon.setAttribute('data-lucide', AppState.currentTheme === 'dark' ? 'sun' : 'moon');
  localStorage.setItem('ahh_theme', AppState.currentTheme);
  lucide.createIcons();
  showToast(AppState.currentLang === 'bn' ? 'থিম পরিবর্তন করা হয়েছে' : 'Theme switched');
}

function toggleLanguage() {
  AppState.currentLang = AppState.currentLang === 'bn' ? 'en' : 'bn';
  document.getElementById('current-lang-label').innerText = AppState.currentLang === 'bn' ? 'বাংলা (BN)' : 'English (EN)';
  applyTranslations();
  renderAll();
  lucide.createIcons();
  showToast(AppState.currentLang === 'bn' ? 'ভাষা পরিবর্তন করা হয়েছে: বাংলা' : 'Language changed to English');
}

function applyTranslations() {
  const lang = AppState.currentLang;
  const dict = I18N[lang];
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (dict[key]) {
      elem.innerText = dict[key];
    }
  });

  const tabTitleMap = {
    'tab-patients': dict.nav_patients,
    'tab-prescriptions': dict.nav_prescriptions,
    'tab-ledger': dict.nav_ledger,
    'tab-due': dict.nav_due,
    'tab-remedies': dict.nav_remedies,
    'tab-backup': dict.nav_backup
  };
  document.getElementById('current-tab-title').innerText = tabTitleMap[AppState.currentTab] || dict.nav_patients;
}

function updateLiveDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const locale = AppState.currentLang === 'bn' ? 'bn-BD' : 'en-US';
  document.getElementById('live-date-str').innerText = now.toLocaleDateString(locale, options);
}

// --- NAVIGATION & TABS ---
function setupTabNavigation() {
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  AppState.currentTab = tabId;
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.sidebar-nav .nav-item[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // Also sync mobile bottom nav active state
  document.querySelectorAll('.mobile-bottom-nav .bottom-nav-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.tab-content').forEach(section => {
    section.style.display = section.id === tabId ? 'block' : 'none';
  });

  applyTranslations();
  renderAll();
  lucide.createIcons();

  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar && sidebar.classList.contains('mobile-open')) {
    sidebar.classList.remove('mobile-open');
  }
  if (backdrop) backdrop.classList.remove('active');
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.toggle('mobile-open');
  if (backdrop) backdrop.classList.toggle('active');
}

// --- MASTER RENDER & STATS ---
function renderAll() {
  calculateStats();
  renderPatients();
  renderPrescriptions();
  renderLedger();
  renderDueList();
  renderRemedies();
}

function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateStats() {
  const todayStr = getTodayStr();
  
  const totalPatients = AppState.patients.length;
  const todayPatients = AppState.patients.filter(p => {
    if (p.prescriptions && p.prescriptions.length > 0) {
      return p.prescriptions.some(rx => rx.date === todayStr);
    }
    return false;
  }).length;

  document.getElementById('stat-val-patients').innerText = totalPatients;
  document.getElementById('stat-sub-patients').innerText = AppState.currentLang === 'bn' 
    ? `আজকে রোগী: ${todayPatients} জন` 
    : `Today: ${todayPatients} Patients`;
  document.getElementById('badge-patient-count').innerText = totalPatients;

  let todaySales = 0;
  let totalDue = 0;
  let dueCount = 0;

  AppState.transactions.forEach(t => {
    if (t.date === todayStr && t.type === 'sale') {
      todaySales += Number(t.paid || 0);
    }
  });

  AppState.patients.forEach(p => {
    let patDue = 0;
    if (p.prescriptions) {
      p.prescriptions.forEach(rx => {
        patDue += Number(rx.due || 0);
      });
    }
    if (patDue > 0) {
      totalDue += patDue;
      dueCount++;
    }
  });

  document.getElementById('stat-val-sales').innerText = `৳ ${todaySales.toLocaleString()}`;
  document.getElementById('sidebar-today-total').innerText = `৳ ${todaySales.toLocaleString()}`;
  document.getElementById('stat-val-due').innerText = `৳ ${totalDue.toLocaleString()}`;
  document.getElementById('badge-due-count').innerText = dueCount;
  document.getElementById('badge-today-txn').innerText = AppState.transactions.filter(t => t.date === todayStr).length;

  document.getElementById('stat-val-remedies').innerText = AppState.remedies.length;
  document.getElementById('badge-remedy-count').innerText = AppState.remedies.length;
}

// --- PATIENTS CASE DIARY RENDER & ACTIONS ---
function renderPatients() {
  const container = document.getElementById('patient-cards-container');
  if (!container) return;
  container.innerHTML = '';

  const searchKeyword = (document.getElementById('patient-search-input')?.value || '').toLowerCase().trim();
  const todayStr = getTodayStr();

  let list = AppState.patients.filter(pat => {
    const matchesSearch = 
      (pat.name && pat.name.toLowerCase().includes(searchKeyword)) ||
      (pat.mobile && pat.mobile.includes(searchKeyword)) ||
      (pat.chiefComplaint && pat.chiefComplaint.toLowerCase().includes(searchKeyword)) ||
      (pat.regNo && pat.regNo.toLowerCase().includes(searchKeyword)) ||
      (pat.symptoms && pat.symptoms.toLowerCase().includes(searchKeyword));

    if (!matchesSearch) return false;

    if (AppState.patientFilter === 'today') {
      return pat.prescriptions && pat.prescriptions.some(rx => rx.date === todayStr);
    }
    if (AppState.patientFilter === 'due') {
      const totalPatDue = (pat.prescriptions || []).reduce((acc, rx) => acc + Number(rx.due || 0), 0);
      return totalPatDue > 0;
    }
    return true;
  });

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <i data-lucide="user-x" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 8px;"></i>
        <h4 style="color: var(--text-secondary);">${AppState.currentLang === 'bn' ? 'কোন রোগীর তথ্য পাওয়া যায়নি' : 'No patient records found'}</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${AppState.currentLang === 'bn' ? 'নতুন রোগী যোগ করতে উপরের বাটনে চাপুন।' : 'Click New Patient Entry to add a record.'}</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  list.forEach(pat => {
    const latestRx = (pat.prescriptions && pat.prescriptions.length > 0) 
      ? pat.prescriptions[pat.prescriptions.length - 1] 
      : null;

    const totalPatDue = (pat.prescriptions || []).reduce((acc, rx) => acc + Number(rx.due || 0), 0);
    const cleanPhone = (pat.mobile || '').replace(/[^0-9+]/g, '');

    const card = document.createElement('div');
    card.className = 'patient-card';
    card.innerHTML = `
      <div class="patient-card-header">
        <div class="patient-avatar">${(pat.name || 'P').charAt(0)}</div>
        <div class="patient-main-info">
          <h3>${pat.name}</h3>
          <div class="patient-meta-tags">
            <span class="tag-badge reg">${pat.regNo || 'REG'}</span>
            <span class="tag-badge">${pat.age || '-'} ${pat.gender ? '| ' + pat.gender : ''}</span>
            ${pat.bloodGroup && pat.bloodGroup !== 'অজানা (Unknown)' ? `<span class="tag-badge blood">${pat.bloodGroup}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="patient-body-section">
        <div class="info-row">
          <span class="info-label">${AppState.currentLang === 'bn' ? 'মোবাইল:' : 'Mobile:'}</span>
          <span class="info-text"><strong>${pat.mobile || '-'}</strong></span>
        </div>
        ${pat.address ? `
        <div class="info-row">
          <span class="info-label">${AppState.currentLang === 'bn' ? 'ঠিকানা:' : 'Address:'}</span>
          <span class="info-text">${pat.address}</span>
        </div>` : ''}
        ${pat.chiefComplaint ? `
        <div class="info-row" style="margin-top: 4px;">
          <span class="info-label">${AppState.currentLang === 'bn' ? 'প্রধান সমস্যা:' : 'Complaint:'}</span>
          <span class="info-text">${pat.chiefComplaint}</span>
        </div>` : ''}

        ${latestRx && latestRx.medicines && latestRx.medicines.length > 0 ? `
        <div class="rx-preview-box">
          <div class="rx-preview-title">
            <span>℞ ${AppState.currentLang === 'bn' ? 'সর্বশেষ ঔষধ (' + (latestRx.date || '') + '):' : 'Latest Rx (' + (latestRx.date || '') + '):'}</span>
            ${latestRx.nextVisit ? `<span style="font-size:0.7rem; color:var(--text-secondary);">${AppState.currentLang === 'bn' ? 'পরবর্তী ভিজিট:' : 'Next:'} ${latestRx.nextVisit}</span>` : ''}
          </div>
          <div>
            ${latestRx.medicines.map(m => `<span class="rx-med-pill">${m.name} ${m.potency ? '<b>' + m.potency + '</b>' : ''}</span>`).join('')}
          </div>
        </div>` : ''}
      </div>

      <div class="patient-card-footer">
        ${totalPatDue > 0 ? `<span class="patient-due-tag">বকেয়া: ৳ ${totalPatDue}</span>` : `<span style="font-size: 0.78rem; color: var(--primary-600); font-weight: 600;"><i data-lucide="check-circle-2" style="width:14px; height:14px; vertical-align:middle;"></i> পরিশোধিত</span>`}
        
        <div class="patient-card-actions">
          ${cleanPhone ? `
          <a href="tel:${cleanPhone}" class="btn-card-action call" title="সরাসরি ফোন করুন">
            <i data-lucide="phone"></i>
          </a>
          <button class="btn-card-action whatsapp" title="হোয়াটসঅ্যাপে প্রেসক্রিপশন পাঠান" onclick="sharePrescriptionWhatsApp('${pat.id}')">
            <i data-lucide="message-circle"></i>
          </button>` : ''}
          <button class="btn-card-action" title="প্রিন্ট মেমো / প্রেসক্রিপশন" onclick="printPatientMemo('${pat.id}')">
            <i data-lucide="printer"></i>
          </button>
          <button class="btn-card-action" title="এডিট করুন" onclick="editPatientCase('${pat.id}')">
            <i data-lucide="edit"></i>
          </button>
          <button class="btn-card-action" style="color: var(--rose-600);" title="মুছে ফেলুন" onclick="deletePatient('${pat.id}')">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });


  lucide.createIcons();
}

function filterPatients() {
  renderPatients();
}

function setPatientFilter(type, btn) {
  AppState.patientFilter = type;
  document.querySelectorAll('.filter-group .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderPatients();
}

// --- PATIENT MODAL & FORM BUILDER ---
function openPatientModal(editPatId = null) {
  const modal = document.getElementById('modal-patient');
  const title = document.getElementById('modal-patient-title');
  const medContainer = document.getElementById('rx-medicines-list');
  medContainer.innerHTML = '';

  if (editPatId) {
    const pat = AppState.patients.find(p => p.id === editPatId);
    if (!pat) return;
    title.innerHTML = `<i data-lucide="edit"></i> <span>রোগীর কেস নোট সম্পাদন (${pat.regNo || ''})</span>`;
    document.getElementById('form-patient-id').value = pat.id;
    document.getElementById('form-pat-name').value = pat.name || '';
    document.getElementById('form-pat-age').value = pat.age || '';
    document.getElementById('form-pat-gender').value = pat.gender || 'পুরুষ (Male)';
    document.getElementById('form-pat-mobile').value = pat.mobile || '';
    document.getElementById('form-pat-blood').value = pat.bloodGroup || 'অজানা (Unknown)';
    document.getElementById('form-pat-address').value = pat.address || '';
    document.getElementById('form-pat-complaints').value = pat.chiefComplaint || '';
    document.getElementById('form-pat-symptoms').value = pat.symptoms || '';
    document.getElementById('form-pat-modalities').value = pat.modalities || '';
    document.getElementById('form-pat-notes').value = pat.notes || '';

    const latestRx = (pat.prescriptions && pat.prescriptions.length > 0) ? pat.prescriptions[pat.prescriptions.length - 1] : null;
    if (latestRx) {
      document.getElementById('form-pat-advice').value = latestRx.advice || '';
      document.getElementById('form-pat-nextvisit').value = latestRx.nextVisit || '';
      document.getElementById('form-pat-totalfee').value = latestRx.totalFee || 0;
      document.getElementById('form-pat-paid').value = latestRx.paid || 0;
      document.getElementById('form-pat-due').value = latestRx.due || 0;
      
      if (latestRx.medicines && latestRx.medicines.length > 0) {
        latestRx.medicines.forEach(m => addPrescriptionMedRow(m.name, m.potency, m.dosage, m.days));
      } else {
        addPrescriptionMedRow();
      }
    } else {
      addPrescriptionMedRow();
    }
  } else {
    title.innerHTML = `<i data-lucide="user-plus"></i> <span>রোগীর নতুন কেস ও নোট এন্ট্রি</span>`;
    document.getElementById('form-patient-id').value = '';
    document.getElementById('form-pat-name').value = '';
    document.getElementById('form-pat-age').value = '';
    document.getElementById('form-pat-gender').value = 'পুরুষ (Male)';
    document.getElementById('form-pat-mobile').value = '';
    document.getElementById('form-pat-blood').value = 'অজানা (Unknown)';
    document.getElementById('form-pat-address').value = '';
    document.getElementById('form-pat-complaints').value = '';
    document.getElementById('form-pat-symptoms').value = '';
    document.getElementById('form-pat-modalities').value = '';
    document.getElementById('form-pat-advice').value = 'নিয়মিত সঠিক নিয়মে ঔষধ খাবেন এবং পরিচ্ছন্ন থাকবেন।';
    document.getElementById('form-pat-nextvisit').value = '';
    document.getElementById('form-pat-totalfee').value = '300';
    document.getElementById('form-pat-paid').value = '300';
    document.getElementById('form-pat-due').value = '0';
    document.getElementById('form-pat-notes').value = '';
    addPrescriptionMedRow();
  }

  modal.classList.add('active');
  lucide.createIcons();
}

function closePatientModal() {
  document.getElementById('modal-patient').classList.remove('active');
}

function addPrescriptionMedRow(name = '', potency = '200C', dosage = '৪ ফোঁটা করে দিনে ২ বার', days = '৭ দিন') {
  const container = document.getElementById('rx-medicines-list');
  const row = document.createElement('div');
  row.className = 'rx-medicine-row';
  
  const datalistId = 'remedy-datalist-' + Date.now() + Math.random().toString(36).substring(7);
  const optionsHtml = AppState.remedies.map(r => `<option value="${r.name}">${r.banglaName ? '(' + r.banglaName + ')' : ''}</option>`).join('');

  row.innerHTML = `
    <div>
      <input type="text" class="form-control rx-med-name" list="${datalistId}" placeholder="ঔষধের নাম (যেমন: Nux Vomica)" value="${name}">
      <datalist id="${datalistId}">${optionsHtml}</datalist>
    </div>
    <div>
      <input type="text" class="form-control rx-med-potency" placeholder="পোটেন্সি (30, 200, Q, 1M)" value="${potency}">
    </div>
    <div>
      <input type="text" class="form-control rx-med-dosage" placeholder="ডোজ ও খাওয়ার নিয়ম" value="${dosage}">
    </div>
    <div>
      <input type="text" class="form-control rx-med-days" placeholder="মেয়াদ (৭ দিন)" value="${days}">
    </div>
    <div>
      <button type="button" class="btn-remove-row" onclick="this.closest('.rx-medicine-row').remove()" title="মুছে ফেলুন">
        <i data-lucide="trash-2"></i>
      </button>
    </div>
  `;
  container.appendChild(row);
  lucide.createIcons();
}

function calculateModalDue() {
  const total = Number(document.getElementById('form-pat-totalfee').value || 0);
  const paid = Number(document.getElementById('form-pat-paid').value || 0);
  const due = Math.max(0, total - paid);
  document.getElementById('form-pat-due').value = due;
}

async function savePatientCase() {
  const name = document.getElementById('form-pat-name').value.trim();
  const mobile = document.getElementById('form-pat-mobile').value.trim();
  const editId = document.getElementById('form-patient-id').value;

  if (!name || !mobile) {
    showToast(AppState.currentLang === 'bn' ? 'অনুগ্রহ করে রোগীর নাম ও মোবাইল নম্বর পূরণ করুন।' : 'Please enter patient name and mobile number.', 'error');
    return;
  }

  const medRows = document.querySelectorAll('#rx-medicines-list .rx-medicine-row');
  const medicines = [];
  medRows.forEach(row => {
    const medName = row.querySelector('.rx-med-name').value.trim();
    const potency = row.querySelector('.rx-med-potency').value.trim();
    const dosage = row.querySelector('.rx-med-dosage').value.trim();
    const days = row.querySelector('.rx-med-days').value.trim();
    if (medName) {
      medicines.push({ name: medName, potency, dosage, days });
    }
  });

  const totalFee = Number(document.getElementById('form-pat-totalfee').value || 0);
  const paid = Number(document.getElementById('form-pat-paid').value || 0);
  const due = Number(document.getElementById('form-pat-due').value || 0);
  const todayStr = getTodayStr();

  const rxEntry = {
    date: todayStr,
    medicines: medicines,
    advice: document.getElementById('form-pat-advice').value.trim(),
    nextVisit: document.getElementById('form-pat-nextvisit').value,
    totalFee: totalFee,
    paid: paid,
    due: due
  };

  const payload = {
    id: editId || undefined,
    name: name,
    age: document.getElementById('form-pat-age').value.trim(),
    gender: document.getElementById('form-pat-gender').value,
    mobile: mobile,
    bloodGroup: document.getElementById('form-pat-blood').value,
    address: document.getElementById('form-pat-address').value.trim(),
    chiefComplaint: document.getElementById('form-pat-complaints').value.trim(),
    symptoms: document.getElementById('form-pat-symptoms').value.trim(),
    modalities: document.getElementById('form-pat-modalities').value.trim(),
    notes: document.getElementById('form-pat-notes').value.trim(),
    prescriptions: [rxEntry]
  };

  try {
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.authToken}`
      },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      showToast(AppState.currentLang === 'bn' ? 'রোগীর কেস নোট সফলভাবে সংরক্ষিত হয়েছে।' : 'Patient saved.');
      await fetchAllServerData();
    }
  } catch (err) {
    // Offline fallback
    if (editId) {
      const idx = AppState.patients.findIndex(p => p.id === editId);
      if (idx !== -1) AppState.patients[idx] = { ...AppState.patients[idx], ...payload };
    } else {
      payload.id = 'pat_' + Date.now();
      payload.regNo = `AHH-2026-${String(AppState.patients.length + 1).padStart(3, '0')}`;
      AppState.patients.unshift(payload);
    }
    saveLocalStorageFallback();
    renderAll();
    showToast('রোগীর কেস নোট সংরক্ষিত হয়েছে (অফলাইন)।');
  }

  closePatientModal();
}

function editPatientCase(patId) {
  openPatientModal(patId);
}

async function deletePatient(patId) {
  if (confirm(AppState.currentLang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই রোগীর রেকর্ড মুছে ফেলতে চান?' : 'Are you sure you want to delete this patient?')) {
    try {
      await fetch(`/api/patients/${patId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${AppState.authToken}` }
      });
      await fetchAllServerData();
      showToast(AppState.currentLang === 'bn' ? 'রোগীর রেকর্ড মুছে ফেলা হয়েছে।' : 'Patient deleted.');
    } catch (err) {
      AppState.patients = AppState.patients.filter(p => p.id !== patId);
      saveLocalStorageFallback();
      renderAll();
      showToast('রোগীর রেকর্ড মুছে ফেলা হয়েছে।');
    }
  }
}

// --- PRESCRIPTIONS TABLE RENDER ---
function renderPrescriptions() {
  const tbody = document.getElementById('prescription-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const searchKeyword = (document.getElementById('rx-search-input')?.value || '').toLowerCase().trim();

  let rxList = [];
  AppState.patients.forEach(p => {
    if (p.prescriptions) {
      p.prescriptions.forEach(rx => {
        rxList.push({
          patientId: p.id,
          regNo: p.regNo,
          patientName: p.name,
          mobile: p.mobile,
          address: p.address,
          ...rx
        });
      });
    }
  });

  if (searchKeyword) {
    rxList = rxList.filter(r => 
      (r.patientName && r.patientName.toLowerCase().includes(searchKeyword)) ||
      (r.mobile && r.mobile.includes(searchKeyword)) ||
      (r.regNo && r.regNo.toLowerCase().includes(searchKeyword))
    );
  }

  if (rxList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">${AppState.currentLang === 'bn' ? 'কোন প্রেসক্রিপশন পাওয়া যায়নি' : 'No prescriptions found'}</td></tr>`;
    return;
  }

  rxList.forEach(item => {
    const medSummary = (item.medicines || []).map(m => `${m.name} (${m.potency || ''})`).join(', ') || '-';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.date || '-'}</strong></td>
      <td><span class="tag-badge reg">${item.regNo || 'REG'}</span></td>
      <td><strong>${item.patientName}</strong><br><small style="color:var(--text-muted);">${item.mobile}</small></td>
      <td style="max-width: 250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${medSummary}">${medSummary}</td>
      <td><strong>৳ ${item.totalFee || 0}</strong></td>
      <td style="color: var(--primary-600); font-weight: 600;">৳ ${item.paid || 0}</td>
      <td>${(item.due || 0) > 0 ? `<span class="status-badge status-due">৳ ${item.due} বাকি</span>` : `<span class="status-badge status-paid">পরিশোধ</span>`}</td>
      <td>
        <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="printPatientMemo('${item.patientId}')">
          <i data-lucide="printer"></i> মেমো প্রিন্ট
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  lucide.createIcons();
}

function filterPrescriptions() {
  renderPrescriptions();
}

function openNewPrescriptionModal() {
  openPatientModal();
}

// --- DAILY LEDGER & CASH BOOK ---
function renderLedger() {
  const tbody = document.getElementById('ledger-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const searchKeyword = (document.getElementById('ledger-search-input')?.value || '').toLowerCase().trim();

  let list = AppState.transactions.filter(t => {
    if (!searchKeyword) return true;
    return (
      (t.patientName && t.patientName.toLowerCase().includes(searchKeyword)) ||
      (t.category && t.category.toLowerCase().includes(searchKeyword)) ||
      (t.note && t.note.toLowerCase().includes(searchKeyword)) ||
      (t.mobile && t.mobile.includes(searchKeyword))
    );
  });

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">${AppState.currentLang === 'bn' ? 'কোন লেনদেনের তথ্য নেই' : 'No transactions recorded'}</td></tr>`;
    return;
  }

  list.forEach(item => {
    const tr = document.createElement('tr');
    const isSale = item.type === 'sale';
    tr.innerHTML = `
      <td>${item.date}</td>
      <td>
        <span class="status-badge ${isSale ? 'status-paid' : 'status-expense'}">
          ${isSale ? (AppState.currentLang === 'bn' ? 'বিক্রয় / আয়' : 'Sale / Income') : (AppState.currentLang === 'bn' ? 'দোকান খরচ' : 'Expense')}
        </span>
      </td>
      <td><strong>${item.category || item.patientName}</strong></td>
      <td>${item.mobile || '-'}</td>
      <td style="color:var(--text-secondary);">${item.note || '-'}</td>
      <td><strong style="color:${isSale ? 'var(--primary-700)' : 'var(--rose-600)'};">৳ ${item.amount || 0}</strong></td>
      <td>
        ${(item.due || 0) > 0 ? `<span class="status-badge status-due">৳ ${item.due} বাকি</span>` : `<span class="status-badge status-paid">পরিশোধ</span>`}
      </td>
      <td>
        <button class="btn-icon" style="width: 28px; height: 28px; color: var(--rose-600);" onclick="deleteTransaction('${item.id}')" title="মুছে ফেলুন">
          <i data-lucide="trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  lucide.createIcons();
}

function filterTransactions() {
  renderLedger();
}

function openTransactionModal(type = 'sale') {
  const modal = document.getElementById('modal-transaction');
  document.getElementById('form-txn-type').value = type;
  document.getElementById('form-txn-date').value = getTodayStr();
  document.getElementById('form-txn-category').value = type === 'sale' ? 'ঔষধ বিক্রয়' : 'দোকান খরচ / আনুষঙ্গিক';
  document.getElementById('form-txn-name').value = '';
  document.getElementById('form-txn-mobile').value = '';
  document.getElementById('form-txn-amount').value = '100';
  document.getElementById('form-txn-paid').value = '100';
  document.getElementById('form-txn-due').value = '0';
  document.getElementById('form-txn-note').value = '';

  const title = document.getElementById('modal-txn-title');
  title.innerHTML = type === 'sale' 
    ? `<i data-lucide="plus-circle" style="color:var(--primary-600);"></i> <span>নগদ বিক্রয় এন্ট্রি</span>`
    : `<i data-lucide="minus-circle" style="color:var(--rose-600);"></i> <span>দোকান খরচ এন্ট্রি</span>`;

  modal.classList.add('active');
  lucide.createIcons();
}

function closeTransactionModal() {
  document.getElementById('modal-transaction').classList.remove('active');
}

function calculateTxnDue() {
  const total = Number(document.getElementById('form-txn-amount').value || 0);
  const paid = Number(document.getElementById('form-txn-paid').value || 0);
  const due = Math.max(0, total - paid);
  document.getElementById('form-txn-due').value = due;
}

async function saveTransaction() {
  const type = document.getElementById('form-txn-type').value;
  const date = document.getElementById('form-txn-date').value || getTodayStr();
  const category = document.getElementById('form-txn-category').value.trim();
  const name = document.getElementById('form-txn-name').value.trim();
  const mobile = document.getElementById('form-txn-mobile').value.trim();
  const amount = Number(document.getElementById('form-txn-amount').value || 0);
  const paid = Number(document.getElementById('form-txn-paid').value || 0);
  const due = Number(document.getElementById('form-txn-due').value || 0);
  const note = document.getElementById('form-txn-note').value.trim();

  if (amount <= 0) {
    showToast(AppState.currentLang === 'bn' ? 'টাকার পরিমাণ লিখুন।' : 'Please enter valid amount.', 'error');
    return;
  }

  const payload = {
    date,
    type,
    category: category || (type === 'sale' ? 'ঔষধ বিক্রয়' : 'দোকান খরচ'),
    patientName: name || '-',
    mobile: mobile || '-',
    amount,
    paid,
    due,
    note
  };

  try {
    await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.authToken}`
      },
      body: JSON.stringify(payload)
    });
    await fetchAllServerData();
    showToast(AppState.currentLang === 'bn' ? 'লেনদেন সফলভাবে লিপিবদ্ধ হয়েছে।' : 'Transaction saved.');
  } catch (err) {
    payload.id = 'txn_' + Date.now();
    AppState.transactions.unshift(payload);
    saveLocalStorageFallback();
    renderAll();
    showToast('লেনদেন লিপিবদ্ধ হয়েছে (অফলাইন)।');
  }

  closeTransactionModal();
}

async function deleteTransaction(txnId) {
  if (confirm(AppState.currentLang === 'bn' ? 'আপনি কি লেনদেনটি মুছে ফেলতে চান?' : 'Delete this transaction entry?')) {
    try {
      await fetch(`/api/transactions/${txnId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${AppState.authToken}` }
      });
      await fetchAllServerData();
      showToast(AppState.currentLang === 'bn' ? 'লেনদেন মুছে ফেলা হয়েছে।' : 'Transaction deleted.');
    } catch (err) {
      AppState.transactions = AppState.transactions.filter(t => t.id !== txnId);
      saveLocalStorageFallback();
      renderAll();
      showToast('লেনদেন মুছে ফেলা হয়েছে।');
    }
  }
}

// --- DUE REGISTER (বাকি খাতা) ---
function renderDueList() {
  const tbody = document.getElementById('due-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const searchKeyword = (document.getElementById('due-search-input')?.value || '').toLowerCase().trim();

  let duePatients = [];
  AppState.patients.forEach(pat => {
    const totalDue = (pat.prescriptions || []).reduce((acc, rx) => acc + Number(rx.due || 0), 0);
    if (totalDue > 0) {
      const latestRx = pat.prescriptions[pat.prescriptions.length - 1];
      duePatients.push({
        patient: pat,
        totalDue: totalDue,
        lastDate: latestRx ? latestRx.date : '-'
      });
    }
  });

  if (searchKeyword) {
    duePatients = duePatients.filter(d => 
      (d.patient.name && d.patient.name.toLowerCase().includes(searchKeyword)) ||
      (d.patient.mobile && d.patient.mobile.includes(searchKeyword))
    );
  }

  if (duePatients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--primary-700); font-weight:600;">🌿 ${AppState.currentLang === 'bn' ? 'মাশাআল্লাহ! কোন রোগীর কাছে বকেয়া বা বাকি পাওনা নেই।' : 'Great! No outstanding dues recorded.'}</td></tr>`;
    return;
  }

  duePatients.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.patient.name}</strong><br><small class="tag-badge reg">${item.patient.regNo || 'REG'}</small></td>
      <td><strong>${item.patient.mobile}</strong></td>
      <td>${item.patient.address || '-'}</td>
      <td>${item.lastDate}</td>
      <td><strong style="color:var(--rose-600); font-size:1.05rem;">৳ ${item.totalDue}</strong></td>
      <td>
        <button class="btn-primary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="clearPatientDue('${item.patient.id}', ${item.totalDue})">
          <i data-lucide="check"></i> বাকি পরিশোধ গ্রহণ
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  lucide.createIcons();
}

function filterDueList() {
  renderDueList();
}

async function clearPatientDue(patId, totalDue) {
  const amountStr = prompt(AppState.currentLang === 'bn' ? `বকেয়া মোট ৳ ${totalDue}। কত টাকা পরিশোধ গ্রহণ করেছেন?` : `Total due ৳ ${totalDue}. Enter received payment amount:`, totalDue);
  if (!amountStr) return;
  const payAmount = Number(amountStr);
  if (isNaN(payAmount) || payAmount <= 0) {
    showToast(AppState.currentLang === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন।' : 'Invalid payment amount.', 'error');
    return;
  }

  const pat = AppState.patients.find(p => p.id === patId);
  if (!pat) return;

  let remainingPay = payAmount;
  for (let i = pat.prescriptions.length - 1; i >= 0; i--) {
    let rx = pat.prescriptions[i];
    if (rx.due > 0 && remainingPay > 0) {
      if (remainingPay >= rx.due) {
        remainingPay -= rx.due;
        rx.paid = Number(rx.paid || 0) + rx.due;
        rx.due = 0;
      } else {
        rx.due -= remainingPay;
        rx.paid = Number(rx.paid || 0) + remainingPay;
        remainingPay = 0;
      }
    }
  }

  // Update patient in SQLite
  try {
    await fetch('/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.authToken}`
      },
      body: JSON.stringify(pat)
    });

    // Record in ledger
    await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.authToken}`
      },
      body: JSON.stringify({
        date: getTodayStr(),
        type: 'sale',
        category: 'বকেয়া/বাকি আদায়',
        patientName: pat.name,
        mobile: pat.mobile,
        amount: payAmount,
        paid: payAmount,
        due: 0,
        note: `বাকি খাতা থেকে সংগ্রহ (রোগী: ${pat.name})`
      })
    });

    await fetchAllServerData();
  } catch (err) {
    saveLocalStorageFallback();
    renderAll();
  }

  showToast(AppState.currentLang === 'bn' ? `৳ ${payAmount} বাকি পরিশোধ সফলভাবে গৃহীত হয়েছে!` : `৳ ${payAmount} due payment recorded!`);
}

// --- REMEDIES DIRECTORY ---
function renderRemedies() {
  const container = document.getElementById('remedies-container');
  if (!container) return;
  container.innerHTML = '';

  const searchKeyword = (document.getElementById('remedy-search-input')?.value || '').toLowerCase().trim();

  let list = AppState.remedies.filter(r => {
    if (!searchKeyword) return true;
    return (
      (r.name && r.name.toLowerCase().includes(searchKeyword)) ||
      (r.banglaName && r.banglaName.toLowerCase().includes(searchKeyword)) ||
      (r.indication && r.indication.toLowerCase().includes(searchKeyword)) ||
      (r.rack && r.rack.toLowerCase().includes(searchKeyword))
    );
  });

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 30px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <p style="color: var(--text-muted);">${AppState.currentLang === 'bn' ? 'কোন ঔষধ খুঁজে পাওয়া যায়নি।' : 'No remedies found.'}</p>
      </div>
    `;
    return;
  }

  list.forEach(rem => {
    const card = document.createElement('div');
    card.className = 'remedy-card';
    card.innerHTML = `
      <div class="remedy-header">
        <div>
          <div class="remedy-name">${rem.name}</div>
          <div class="remedy-bangla">${rem.banglaName || ''}</div>
        </div>
        <span class="rack-badge">র‍্যাক: ${rem.rack || 'A-01'}</span>
      </div>

      <div class="potency-tags-container">
        ${(rem.potencies || []).map(p => `<span class="potency-pill">${p}</span>`).join('')}
      </div>

      <div class="remedy-indication">
        <strong>${AppState.currentLang === 'bn' ? 'লক্ষণ/ব্যবহার:' : 'Indications:'}</strong> ${rem.indication || '-'}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--border-color); font-size: 0.8rem; color: var(--text-secondary);">
        <span>${AppState.currentLang === 'bn' ? 'ক্যাটাগরি:' : 'Type:'} <strong>${rem.category || 'Dilution'}</strong></span>
        <span>${AppState.currentLang === 'bn' ? 'মজুদ:' : 'Stock:'} <strong>${rem.stock || 0} টি</strong></span>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterRemedies() {
  renderRemedies();
}

function openRemedyModal() {
  document.getElementById('form-rem-name').value = '';
  document.getElementById('form-rem-bangla').value = '';
  document.getElementById('form-rem-rack').value = 'A-01';
  document.getElementById('form-rem-stock').value = '10';
  document.getElementById('form-rem-potencies').value = 'Q, 30C, 200C, 1M';
  document.getElementById('form-rem-indication').value = '';
  document.getElementById('modal-remedy').classList.add('active');
}

function closeRemedyModal() {
  document.getElementById('modal-remedy').classList.remove('active');
}

async function saveRemedy() {
  const name = document.getElementById('form-rem-name').value.trim();
  if (!name) {
    showToast(AppState.currentLang === 'bn' ? 'ঔষধের নাম লিখুন।' : 'Please enter remedy name.', 'error');
    return;
  }

  const potenciesStr = document.getElementById('form-rem-potencies').value;
  const potencies = potenciesStr.split(',').map(s => s.trim()).filter(Boolean);

  const payload = {
    name,
    banglaName: document.getElementById('form-rem-bangla').value.trim(),
    category: document.getElementById('form-rem-cat').value,
    rack: document.getElementById('form-rem-rack').value.trim() || 'A-01',
    stock: Number(document.getElementById('form-rem-stock').value || 1),
    potencies: potencies.length > 0 ? potencies : ['30C', '200C'],
    indication: document.getElementById('form-rem-indication').value.trim()
  };

  try {
    await fetch('/api/remedies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.authToken}`
      },
      body: JSON.stringify(payload)
    });
    await fetchAllServerData();
    showToast(AppState.currentLang === 'bn' ? 'নতুন হোমিওপ্যাথিক ঔষধ সফলভাবে যুক্ত হয়েছে।' : 'Remedy added.');
  } catch (err) {
    payload.id = 'rem_' + Date.now();
    AppState.remedies.unshift(payload);
    saveLocalStorageFallback();
    renderAll();
    showToast('ঔষধ যুক্ত হয়েছে (অফলাইন)।');
  }

  closeRemedyModal();
}

// --- PRINTABLE PRESCRIPTION & CASH MEMO GENERATOR ---
function printPatientMemo(patId) {
  const pat = AppState.patients.find(p => p.id === patId);
  if (!pat) return;

  const latestRx = (pat.prescriptions && pat.prescriptions.length > 0) ? pat.prescriptions[pat.prescriptions.length - 1] : { medicines: [] };
  const printContainer = document.getElementById('printable-memo-content');

  printContainer.innerHTML = `
    <div class="memo-header">
      <div class="memo-header-bismillah">বিসমিল্লাহির রাহমানির রাহিম</div>
      <div class="memo-brand-title">${AppState.clinicSettings.pharmacyName}</div>
      <div class="memo-brand-sub">${AppState.clinicSettings.doctorName}</div>
      <div class="memo-brand-contact">${AppState.clinicSettings.address}</div>
    </div>

    <div class="memo-patient-bar">
      <div><strong>রোগীর নাম:</strong> ${pat.name}</div>
      <div><strong>রেজি নং:</strong> ${pat.regNo || 'AHH-001'}</div>
      <div><strong>বয়স/লিঙ্গ:</strong> ${pat.age || '-'} / ${pat.gender || '-'}</div>
      <div><strong>তারিখ:</strong> ${latestRx.date || getTodayStr()}</div>
    </div>

    <div class="memo-patient-bar" style="background:#fff; border-color:#e5e7eb; margin-top:-8px;">
      <div><strong>মোবাইল:</strong> ${pat.mobile}</div>
      <div style="grid-column: 2 / span 3;"><strong>ঠিকানা:</strong> ${pat.address || '-'}</div>
    </div>

    <div class="memo-rx-section">
      <div class="memo-rx-icon">℞</div>
      
      <table class="memo-med-table">
        <thead>
          <tr>
            <th style="width: 35%;">ঔষধের নাম ও পোটেন্সি</th>
            <th style="width: 45%;">ডোজ ও খাওয়ার নিয়ম</th>
            <th style="width: 20%;">মেয়াদ</th>
          </tr>
        </thead>
        <tbody>
          ${(latestRx.medicines || []).map(m => `
            <tr>
              <td><strong>${m.name}</strong> <span style="color:#047857; font-weight:700;">${m.potency || ''}</span></td>
              <td>${m.dosage || '-'}</td>
              <td>${m.days || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${latestRx.advice ? `
      <div class="memo-advice-box">
        <strong>পরামর্শ / উপদেশ:</strong> ${latestRx.advice}
      </div>` : ''}

      ${latestRx.nextVisit ? `
      <div style="margin-top: 8px; font-size: 0.85rem; color: #065f46; font-weight: 600;">
        পরবর্তী সাক্ষাতের তারিখ: ${latestRx.nextVisit}
      </div>` : ''}
    </div>

    <div class="memo-billing-summary">
      <div class="memo-billing-box">
        <div class="memo-bill-row">
          <span>মোট ফি ও ঔষধ মূল্য:</span>
          <strong>৳ ${latestRx.totalFee || 0}</strong>
        </div>
        <div class="memo-bill-row">
          <span>নগদ পরিশোধ:</span>
          <strong style="color:#047857;">৳ ${latestRx.paid || 0}</strong>
        </div>
        <div class="memo-bill-row total">
          <span>বকেয়া / বাকি:</span>
          <strong style="color:${(latestRx.due || 0) > 0 ? '#b91c1c' : '#047857'};">৳ ${latestRx.due || 0}</strong>
        </div>
      </div>
    </div>

    <div class="memo-footer">
      <div style="font-size: 0.78rem; color: #6b7280;">
        * রোগমুক্তির মালিক একমাত্র মহান আল্লাহ। ঔষধ সেবনের সাথে নিয়ম মেনে চলুন।
      </div>
      <div class="memo-sig">
        চিকিৎসকের স্বাক্ষর
      </div>
    </div>
  `;

  window.print();
}

// --- SECURITY SETTINGS (PASSWORD & PIN UPDATE) ---
async function updateSecurityPin() {
  const newPin = document.getElementById('setting-new-pin').value.trim();
  if (!newPin || newPin.length < 4) {
    showToast('পিন কোড ৪-৬ সংখ্যার হতে হবে।', 'error');
    return;
  }

  try {
    const res = await fetch('/api/auth/change-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.authToken}`
      },
      body: JSON.stringify({ newPin })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'সিকিউরিটি পিন আপডেট হয়েছে!');
      document.getElementById('setting-new-pin').value = '';
      loadAuditLogs();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('সার্ভারে যোগাযোগ করা যায়নি।', 'error');
  }
}

async function updateSecurityPassword() {
  const currentPassword = document.getElementById('setting-old-pass').value;
  const newPassword = document.getElementById('setting-new-pass').value;

  if (!currentPassword || !newPassword) {
    showToast('বর্তমান ও নতুন উভয় পাসওয়ার্ড লিখুন।', 'error');
    return;
  }

  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.authToken}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!');
      document.getElementById('setting-old-pass').value = '';
      document.getElementById('setting-new-pass').value = '';
      loadAuditLogs();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('সার্ভারে যোগাযোগ করা যায়নি।', 'error');
  }
}

async function loadAuditLogs() {
  const tbody = document.getElementById('audit-logs-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/audit-logs', {
      headers: { 'Authorization': `Bearer ${AppState.authToken}` }
    });
    const data = await res.json();
    if (data.success && data.logs) {
      tbody.innerHTML = data.logs.map(log => `
        <tr>
          <td><small>${new Date(log.timestamp).toLocaleString('bn-BD')}</small></td>
          <td><span class="tag-badge reg">${log.action}</span></td>
          <td>${log.details || '-'}</td>
          <td><code>${log.ip_address || '127.0.0.1'}</code></td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">অডিট লগ লোড করা যায়নি</td></tr>`;
  }
}

function downloadDatabaseFile() {
  window.open('/api/backup/db', '_blank');
  showToast(AppState.currentLang === 'bn' ? 'SQLite ডাটাবেজ ফাইল ডাউনলোড শুরু হয়েছে।' : 'Downloading SQLite Database file...');
}

// --- BACKUP & CSV EXPORT ---
function downloadBackupJSON() {
  const exportData = {
    appName: "Akhi Homeo Hall Notebook",
    exportDate: new Date().toISOString(),
    clinicSettings: AppState.clinicSettings,
    patients: AppState.patients,
    transactions: AppState.transactions,
    remedies: AppState.remedies
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `akhi_homeo_hall_backup_${getTodayStr()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast(AppState.currentLang === 'bn' ? 'JSON ব্যাকআপ ফাইল সংরক্ষণ করা হয়েছে।' : 'JSON Backup saved.');
}

function exportPatientsCSV() {
  if (AppState.patients.length === 0) {
    showToast(AppState.currentLang === 'bn' ? 'কোন রোগীর ডেটা নেই।' : 'No patient data to export.', 'error');
    return;
  }

  let csvContent = "\uFEFFRegNo,Name,Age,Gender,Mobile,Address,BloodGroup,ChiefComplaints,TotalDue\n";
  AppState.patients.forEach(p => {
    const totalDue = (p.prescriptions || []).reduce((acc, rx) => acc + Number(rx.due || 0), 0);
    const cleanComplaint = (p.chiefComplaint || '').replace(/,/g, ' ').replace(/\n/g, ' ');
    csvContent += `"${p.regNo || ''}","${p.name || ''}","${p.age || ''}","${p.gender || ''}","${p.mobile || ''}","${p.address || ''}","${p.bloodGroup || ''}","${cleanComplaint}","${totalDue}"\n`;
  });

  const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `patients_list_${getTodayStr()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  showToast(AppState.currentLang === 'bn' ? 'রোগীদের এক্সেল/CSV ফাইল ডাউনলোড হয়েছে।' : 'CSV exported.');
}

async function saveClinicSettings() {
  const pharmacyName = document.getElementById('setting-pharmacy-name').value.trim();
  const doctorName = document.getElementById('setting-doctor-name').value.trim();
  const address = document.getElementById('setting-clinic-address').value.trim();

  AppState.clinicSettings = {
    ...AppState.clinicSettings,
    pharmacyName: pharmacyName || AppState.clinicSettings.pharmacyName,
    doctorName: doctorName || AppState.clinicSettings.doctorName,
    address: address || AppState.clinicSettings.address
  };

  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AppState.authToken}`
      },
      body: JSON.stringify(AppState.clinicSettings)
    });
  } catch (err) {
    saveLocalStorageFallback();
  }

  showToast(AppState.currentLang === 'bn' ? 'ফার্মেসির তথ্য আপডেট করা হয়েছে।' : 'Settings saved successfully.');
}

// --- TOAST NOTIFICATIONS ---
// --- ADVANCED MOBILE UTILITIES & PWA ---

// 1. WhatsApp Prescription Share
function sharePrescriptionWhatsApp(patId) {
  const pat = AppState.patients.find(p => p.id === patId);
  if (!pat) return;

  const latestRx = (pat.prescriptions && pat.prescriptions.length > 0) ? pat.prescriptions[pat.prescriptions.length - 1] : null;
  let text = `🌿 *${AppState.clinicSettings.pharmacyName}*\n`;
  text += `👨‍⚕️ ${AppState.clinicSettings.doctorName}\n`;
  text += `--------------------------------\n`;
  text += `👤 *রোগীর নাম:* ${pat.name}\n`;
  text += `📋 *রেজি নং:* ${pat.regNo || '-'}\n`;
  text += `📅 *তারিখ:* ${latestRx ? latestRx.date : getTodayStr()}\n\n`;

  if (latestRx && latestRx.medicines && latestRx.medicines.length > 0) {
    text += `💊 *ব্যবস্থাপত্র (Rx):*\n`;
    latestRx.medicines.forEach((m, idx) => {
      text += `${idx + 1}. *${m.name}* (${m.potency || ''})\n   👉 সেবনবিধি: ${m.dosage || '-'} (${m.days || ''})\n`;
    });
  }

  if (latestRx && latestRx.advice) {
    text += `\n⚠️ *পরামর্শ:* ${latestRx.advice}\n`;
  }
  if (latestRx && latestRx.nextVisit) {
    text += `🗓️ *পরবর্তী ভিজিট:* ${latestRx.nextVisit}\n`;
  }

  text += `\n📞 যোগাযোগ: ${AppState.clinicSettings.address}`;

  const cleanPhone = (pat.mobile || '').replace(/[^0-9]/g, '');
  let waNumber = cleanPhone;
  if (waNumber.startsWith('01')) {
    waNumber = '88' + waNumber;
  }

  const encodedText = encodeURIComponent(text);
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
  window.open(waUrl, '_blank');
  showToast('হোয়াটসঅ্যাপে প্রেসক্রিপশন পাঠানো হচ্ছে...');
}

// 2. Mobile Voice Search (বাংলা ও ইংরেজি ভয়েস সার্চ)
function startVoiceSearch(targetInputId, btnElem) {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('আপনার ব্রাউজারে ভয়েস সার্চ সাপোর্ট নেই।', 'error');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = AppState.currentLang === 'bn' ? 'bn-BD' : 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  btnElem.classList.add('listening');
  showToast(AppState.currentLang === 'bn' ? '🎙️ বলুন, শুনছি...' : '🎙️ Listening...');

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById(targetInputId);
    if (input) {
      input.value = transcript;
      if (targetInputId === 'patient-search-input') filterPatients();
      if (targetInputId === 'remedy-search-input') filterRemedies();
    }
    showToast(`"${transcript}"`);
  };

  recognition.onerror = () => {
    btnElem.classList.remove('listening');
    showToast('ভয়েস শনাক্ত করা যায়নি।', 'error');
  };

  recognition.onend = () => {
    btnElem.classList.remove('listening');
  };

  recognition.start();
}

// 3. Register PWA Service Worker for Mobile
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration failed:', err);
    });
  });
}

// 4. Haptic Feedback for Mobile Touch
function triggerHaptic(type = 'light') {
  if (navigator.vibrate) {
    if (type === 'light') navigator.vibrate(12);
    else if (type === 'medium') navigator.vibrate(25);
    else if (type === 'success') navigator.vibrate([15, 30, 20]);
  }
}

