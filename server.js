/**
 * Akhi Homeo Hall (আঁখি হোমিও হল)
 * Secure Node.js Server & REST API Controller
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { db, initDatabase, hashPassword, verifyPassword, logAudit, DB_PATH } = require('./database');

// Initialize database schema & seed data
initDatabase();

const PORT = process.env.PORT || 3000;
const SESSIONS = new Map(); // token -> { userId, username, expiresAt }

// Session Token Generator
function createSession(userId, username) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  SESSIONS.set(token, { userId, username, expiresAt });
  return token;
}

function validateSession(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  
  const session = SESSIONS.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    SESSIONS.delete(token);
    return null;
  }
  return session;
}

// JSON Helper
function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

// Body Parser with UTF-8 support
function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8').trim();
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(new Error('Invalid JSON format: ' + err.message));
      }
    });
    req.on('error', reject);
  });
}

// MIME Types for Static File Serving
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const clientIp = req.socket.remoteAddress || '127.0.0.1';

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  try {
    // --- API ROUTES ---

    // 1. AUTH: Login (Username & Password)
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { username, password } = await parseJSONBody(req);
      if (!username || !password) {
        return sendJSON(res, 400, { success: false, message: 'Username and password required' });
      }

      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
      if (!user || !verifyPassword(password, user.password_hash, user.salt)) {
        logAudit('FAILED_LOGIN', `Failed login attempt for user "${username}"`, clientIp);
        return sendJSON(res, 401, { success: false, message: 'ভুল ইউজারনেম অথবা পাসওয়ার্ড!' });
      }

      const token = createSession(user.id, user.username);
      logAudit('LOGIN_SUCCESS', `User "${user.username}" logged in`, clientIp);
      return sendJSON(res, 200, {
        success: true,
        token,
        user: { id: user.id, username: user.username, role: user.role }
      });
    }

    // 2. AUTH: Quick 4-Digit PIN Unlock
    if (pathname === '/api/auth/pin' && req.method === 'POST') {
      const { pin } = await parseJSONBody(req);
      if (!pin) {
        return sendJSON(res, 400, { success: false, message: 'PIN code required' });
      }

      // Check admin user's PIN
      const user = db.prepare('SELECT * FROM users WHERE role = ? LIMIT 1').get('admin');
      if (!user || !verifyPassword(pin, user.pin_hash, user.salt)) {
        logAudit('FAILED_PIN', 'Failed PIN unlock attempt', clientIp);
        return sendJSON(res, 401, { success: false, message: 'ভুল পিন কোড! পুনরায় চেষ্টা করুন।' });
      }

      const token = createSession(user.id, user.username);
      logAudit('PIN_UNLOCK', `User unlocked with PIN`, clientIp);
      return sendJSON(res, 200, {
        success: true,
        token,
        user: { id: user.id, username: user.username, role: user.role }
      });
    }

    // 3. AUTH: Verify Active Session
    if (pathname === '/api/auth/verify' && req.method === 'GET') {
      const session = validateSession(req);
      if (!session) {
        return sendJSON(res, 401, { success: false, message: 'Unauthorized / Session Expired' });
      }
      return sendJSON(res, 200, { success: true, user: { username: session.username } });
    }

    // 4. AUTH: Change Password
    if (pathname === '/api/auth/change-password' && req.method === 'POST') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      const { currentPassword, newPassword } = await parseJSONBody(req);
      if (!newPassword || newPassword.length < 4) {
        return sendJSON(res, 400, { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' });
      }

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId);
      if (!user || !verifyPassword(currentPassword, user.password_hash, user.salt)) {
        return sendJSON(res, 400, { success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' });
      }

      const { hash: newHash, salt: newSalt } = hashPassword(newPassword);
      // Also update pin_hash using new salt if needed, or keep same
      const pinUser = user.pin_hash; // preserve pin or update
      db.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?').run(newHash, newSalt, user.id);
      logAudit('PASSWORD_CHANGED', `User ${user.username} changed password`, clientIp);
      return sendJSON(res, 200, { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' });
    }

    // 5. AUTH: Change Quick PIN
    if (pathname === '/api/auth/change-pin' && req.method === 'POST') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      const { newPin } = await parseJSONBody(req);
      if (!newPin || newPin.length < 4) {
        return sendJSON(res, 400, { success: false, message: 'পিন কোড ৪-৬ সংখ্যার হতে হবে।' });
      }

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId);
      const { hash: newPinHash } = hashPassword(newPin, user.salt);
      db.prepare('UPDATE users SET pin_hash = ? WHERE id = ?').run(newPinHash, user.id);
      logAudit('PIN_CHANGED', `User ${user.username} changed quick PIN`, clientIp);
      return sendJSON(res, 200, { success: true, message: 'সিকিউরিটি পিন সফলভাবে আপডেট হয়েছে।' });
    }

    // 6. PATIENTS: Get All Patients with Prescriptions
    if (pathname === '/api/patients' && req.method === 'GET') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      const patients = db.prepare('SELECT * FROM patients ORDER BY updated_at DESC').all();
      const prescriptions = db.prepare('SELECT * FROM prescriptions ORDER BY rx_date ASC').all();

      const rxMap = {};
      for (const rx of prescriptions) {
        if (!rxMap[rx.patient_id]) rxMap[rx.patient_id] = [];
        let medList = [];
        try { medList = JSON.parse(rx.medicines_json); } catch(e) {}
        rxMap[rx.patient_id].push({
          id: rx.id,
          date: rx.rx_date,
          medicines: medList,
          advice: rx.advice,
          nextVisit: rx.next_visit,
          totalFee: rx.total_fee,
          paid: rx.paid,
          due: rx.due
        });
      }

      const result = patients.map(p => ({
        id: p.id,
        regNo: p.reg_no,
        name: p.name,
        age: p.age,
        gender: p.gender,
        mobile: p.mobile,
        bloodGroup: p.blood_group,
        address: p.address,
        chiefComplaint: p.chief_complaint,
        symptoms: p.symptoms,
        modalities: p.modalities,
        notes: p.notes,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        prescriptions: rxMap[p.id] || []
      }));

      return sendJSON(res, 200, { success: true, patients: result });
    }

    // 7. PATIENTS: Create or Update Patient
    if (pathname === '/api/patients' && req.method === 'POST') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      const data = await parseJSONBody(req);
      const isNew = !data.id;
      const patientId = data.id || ('pat_' + Date.now());
      const now = new Date().toISOString();

      let regNo = data.regNo;
      if (!regNo) {
        const count = db.prepare('SELECT COUNT(*) as c FROM patients').get().c + 1;
        regNo = `AHH-2026-${String(count).padStart(3, '0')}`;
      }

      if (isNew) {
        db.prepare(`
          INSERT INTO patients (id, reg_no, name, age, gender, mobile, blood_group, address, chief_complaint, symptoms, modalities, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          patientId, regNo, data.name, data.age || '', data.gender || '', data.mobile,
          data.bloodGroup || '', data.address || '', data.chiefComplaint || '',
          data.symptoms || '', data.modalities || '', data.notes || '', now, now
        );
        logAudit('PATIENT_CREATE', `Created patient: ${data.name} (${regNo})`, clientIp);
      } else {
        db.prepare(`
          UPDATE patients SET name = ?, age = ?, gender = ?, mobile = ?, blood_group = ?, address = ?, chief_complaint = ?, symptoms = ?, modalities = ?, notes = ?, updated_at = ?
          WHERE id = ?
        `).run(
          data.name, data.age || '', data.gender || '', data.mobile,
          data.bloodGroup || '', data.address || '', data.chiefComplaint || '',
          data.symptoms || '', data.modalities || '', data.notes || '', now, patientId
        );
        logAudit('PATIENT_UPDATE', `Updated patient: ${data.name} (${patientId})`, clientIp);
      }

      // Add/Update prescription if provided
      if (data.prescriptions && data.prescriptions.length > 0) {
        const latestRx = data.prescriptions[data.prescriptions.length - 1];
        const rxId = latestRx.id || ('rx_' + Date.now());
        const medJson = JSON.stringify(latestRx.medicines || []);
        
        db.prepare(`
          INSERT OR REPLACE INTO prescriptions (id, patient_id, rx_date, medicines_json, advice, next_visit, total_fee, paid, due, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          rxId, patientId, latestRx.date || new Date().toISOString().slice(0, 10),
          medJson, latestRx.advice || '', latestRx.nextVisit || '',
          Number(latestRx.totalFee || 0), Number(latestRx.paid || 0), Number(latestRx.due || 0), now
        );
      }

      return sendJSON(res, 200, { success: true, patientId, regNo });
    }

    // 8. PATIENTS: Delete Patient
    if (pathname.startsWith('/api/patients/') && req.method === 'DELETE') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      const patientId = pathname.split('/').pop();
      db.prepare('DELETE FROM prescriptions WHERE patient_id = ?').run(patientId);
      db.prepare('DELETE FROM patients WHERE id = ?').run(patientId);
      logAudit('PATIENT_DELETE', `Deleted patient ${patientId}`, clientIp);
      return sendJSON(res, 200, { success: true, message: 'Patient deleted' });
    }

    // 9. TRANSACTIONS: Get All
    if (pathname === '/api/transactions' && req.method === 'GET') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      const txns = db.prepare('SELECT * FROM transactions ORDER BY date DESC, created_at DESC').all();
      return sendJSON(res, 200, { success: true, transactions: txns });
    }

    // 10. TRANSACTIONS: Create
    if (pathname === '/api/transactions' && req.method === 'POST') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      const t = await parseJSONBody(req);
      const id = t.id || ('txn_' + Date.now());
      db.prepare(`
        INSERT INTO transactions (id, date, type, category, patient_name, mobile, amount, paid, due, note, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, t.date, t.type || 'sale', t.category || '', t.patientName || '',
        t.mobile || '', Number(t.amount || 0), Number(t.paid || 0), Number(t.due || 0),
        t.note || '', new Date().toISOString()
      );

      logAudit('TRANSACTION_ADD', `Added ${t.type}: ৳${t.amount} (${t.category})`, clientIp);
      return sendJSON(res, 200, { success: true, id });
    }

    // 11. TRANSACTIONS: Delete
    if (pathname.startsWith('/api/transactions/') && req.method === 'DELETE') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      const id = pathname.split('/').pop();
      db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
      logAudit('TRANSACTION_DELETE', `Deleted transaction ${id}`, clientIp);
      return sendJSON(res, 200, { success: true });
    }

    // 12. REMEDIES: Get All
    if (pathname === '/api/remedies' && req.method === 'GET') {
      const remedies = db.prepare('SELECT * FROM remedies ORDER BY name ASC').all();
      const list = remedies.map(r => {
        let pot = [];
        try { pot = JSON.parse(r.potencies_json); } catch(e) {}
        return {
          id: r.id,
          name: r.name,
          banglaName: r.bangla_name,
          category: r.category,
          rack: r.rack,
          stock: r.stock,
          potencies: pot,
          indication: r.indication
        };
      });
      return sendJSON(res, 200, { success: true, remedies: list });
    }

    // 13. REMEDIES: Add/Update
    if (pathname === '/api/remedies' && req.method === 'POST') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      const r = await parseJSONBody(req);
      const id = r.id || ('rem_' + Date.now());
      const potJson = JSON.stringify(r.potencies || ['Q', '30C', '200C']);

      db.prepare(`
        INSERT OR REPLACE INTO remedies (id, name, bangla_name, category, rack, stock, potencies_json, indication, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, r.name, r.banglaName || '', r.category || 'Dilution',
        r.rack || 'A-01', Number(r.stock || 10), potJson, r.indication || '',
        new Date().toISOString()
      );

      logAudit('REMEDY_SAVE', `Saved remedy: ${r.name}`, clientIp);
      return sendJSON(res, 200, { success: true, id });
    }

    // 14. SETTINGS: Get & Save
    if (pathname === '/api/settings' && req.method === 'GET') {
      const settingsRows = db.prepare('SELECT * FROM settings').all();
      const settings = {};
      for (const row of settingsRows) settings[row.key] = row.value;
      return sendJSON(res, 200, { success: true, settings });
    }

    if (pathname === '/api/settings' && req.method === 'POST') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      const settings = await parseJSONBody(req);
      for (const [key, val] of Object.entries(settings)) {
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(val));
      }
      logAudit('SETTINGS_UPDATE', 'Updated clinic settings', clientIp);
      return sendJSON(res, 200, { success: true });
    }

    // 15. AUDIT LOGS: Get
    if (pathname === '/api/audit-logs' && req.method === 'GET') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50').all();
      return sendJSON(res, 200, { success: true, logs });
    }

    // 17. BATCH SYNC: Offline Mutation Sync
    if (pathname === '/api/sync/batch' && req.method === 'POST') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      const { items } = await parseJSONBody(req);
      if (!Array.isArray(items) || items.length === 0) {
        return sendJSON(res, 200, { success: true, processed: 0 });
      }

      const now = new Date().toISOString();
      let processed = 0;

      for (const item of items) {
        try {
          if (item.type === 'patient') {
            const data = item.data;
            const patientId = data.id || ('pat_' + Date.now());
            let regNo = data.regNo;
            if (!regNo) {
              const count = db.prepare('SELECT COUNT(*) as c FROM patients').get().c + 1;
              regNo = `AHH-2026-${String(count).padStart(3, '0')}`;
            }

            db.prepare(`
              INSERT INTO patients (id, reg_no, name, age, gender, mobile, blood_group, address, chief_complaint, symptoms, modalities, notes, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name, age = excluded.age, gender = excluded.gender, mobile = excluded.mobile,
                blood_group = excluded.blood_group, address = excluded.address, chief_complaint = excluded.chief_complaint,
                symptoms = excluded.symptoms, modalities = excluded.modalities, notes = excluded.notes, updated_at = excluded.updated_at
            `).run(
              patientId, regNo, data.name, data.age || '', data.gender || '', data.mobile || '',
              data.bloodGroup || '', data.address || '', data.chiefComplaint || '',
              data.symptoms || '', data.modalities || '', data.notes || '', now, now
            );

            if (data.prescriptions && data.prescriptions.length > 0) {
              for (const rx of data.prescriptions) {
                const rxId = rx.id || ('rx_' + Date.now() + Math.random().toString(36).substring(7));
                const medJson = JSON.stringify(rx.medicines || []);
                db.prepare(`
                  INSERT OR REPLACE INTO prescriptions (id, patient_id, rx_date, medicines_json, advice, next_visit, total_fee, paid, due, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                  rxId, patientId, rx.date || now.slice(0, 10),
                  medJson, rx.advice || '', rx.nextVisit || '',
                  Number(rx.totalFee || 0), Number(rx.paid || 0), Number(rx.due || 0), now
                );
              }
            }
            processed++;
          } else if (item.type === 'transaction') {
            const t = item.data;
            const id = t.id || ('txn_' + Date.now());
            db.prepare(`
              INSERT OR REPLACE INTO transactions (id, type, category, date, amount, paid, due, patient_id, patient_name, mobile, description, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              id, t.type || 'sale', t.category || 'ঔষধ বিক্রয়',
              t.date || now.slice(0, 10), Number(t.amount || 0),
              Number(t.paid || 0), Number(t.due || 0),
              t.patientId || null, t.patientName || '', t.mobile || '',
              t.description || '', now
            );
            processed++;
          } else if (item.type === 'remedy') {
            const r = item.data;
            const id = r.id || ('rem_' + Date.now());
            const potJson = JSON.stringify(r.potencies || ['Q', '30C', '200C']);
            db.prepare(`
              INSERT OR REPLACE INTO remedies (id, name, bangla_name, category, rack, stock, potencies_json, indication, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              id, r.name, r.banglaName || '', r.category || 'Dilution',
              r.rack || 'A-01', Number(r.stock || 10), potJson, r.indication || '', now
            );
            processed++;
          } else if (item.type === 'delete_patient') {
            db.prepare('DELETE FROM prescriptions WHERE patient_id = ?').run(item.id);
            db.prepare('DELETE FROM patients WHERE id = ?').run(item.id);
            processed++;
          } else if (item.type === 'delete_transaction') {
            db.prepare('DELETE FROM transactions WHERE id = ?').run(item.id);
            processed++;
          }
        } catch (itemErr) {
          console.error('Batch sync item error:', itemErr);
        }
      }

      logAudit('BATCH_SYNC', `Processed ${processed} offline queued items`, clientIp);
      return sendJSON(res, 200, { success: true, processed });
    }

    // 18. DATABASE FILE BACKUP DOWNLOAD
    if (pathname === '/api/backup/db' && req.method === 'GET') {
      const session = validateSession(req);
      if (!session) return sendJSON(res, 401, { success: false, message: 'Unauthorized' });

      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH);
        res.writeHead(200, {
          'Content-Type': 'application/x-sqlite3',
          'Content-Disposition': `attachment; filename="akhi_homeo_${new Date().toISOString().slice(0, 10)}.db"`
        });
        logAudit('DB_BACKUP_DOWNLOAD', 'Downloaded SQLite DB file', clientIp);
        return res.end(fileContent);
      } else {
        return sendJSON(res, 404, { success: false, message: 'Database file not found' });
      }
    }

    // 19. HEALTH CHECK & PING (For Render & Mobile App)
    if ((pathname === '/api/health' || pathname === '/api/ping') && req.method === 'GET') {
      return sendJSON(res, 200, {
        success: true,
        status: 'online',
        app: 'Akhi Homeo Hall',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        database: 'SQLite 3 (WAL mode)'
      });
    }

    // --- STATIC FILE SERVING ---
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    
    // Security check against directory traversal
    const safePath = path.normalize(filePath);
    if (!safePath.startsWith(__dirname)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.stat(safePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback to index.html for SPA routing or 404
        const fallback = path.join(__dirname, 'index.html');
        fs.readFile(fallback, (err2, content) => {
          if (err2) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
          }
        });
        return;
      }

      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(safePath, (err3, content) => {
        if (err3) {
          res.writeHead(500);
          res.end('Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });

  } catch (error) {
    console.error('Server Internal Error:', error);
    sendJSON(res, 500, { success: false, message: 'Internal Server Error', error: error.message });
  }
});

const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`🌿 Akhi Homeo Hall Secure Server running at: http://${HOST}:${PORT}`);
  console.log(`🔒 SQLite Database: akhi_homeo.db`);
  console.log(`🔑 Default Admin: admin | Password: admin123 | Quick PIN: 1234`);
});

