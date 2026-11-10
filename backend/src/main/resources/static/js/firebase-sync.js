/**
 * HPRS Firebase Firestore Real-Time Sync Engine — v3
 * -----------------------------------------------
 * Enables two laptops on ANY network to share the same patient database.
 * Uses Firebase Firestore (Google's free cloud database).
 *
 * ✅ Any UHID entered at Hospital A is immediately visible at Hospital B.
 * ✅ Clinical visits, prescriptions, appointments all sync in real-time.
 * ✅ Works on any two devices with internet access.
 */

// ============================================================
// 🔧 FIREBASE CONFIG (hprs-network project)
// ============================================================
const HPRS_FIREBASE_CONFIG = {
    apiKey:            "AIzaSyAn7MAfqKEZIFTqxZynbOaKT1UUxP23nOk",
    authDomain:        "hprs-network.firebaseapp.com",
    projectId:         "hprs-network",
    storageBucket:     "hprs-network.firebasestorage.app",
    messagingSenderId: "832305491998",
    appId:             "1:832305491998:web:9a3a6bc7b0b2be976f3e0f"
};
// ============================================================

const FIREBASE_READY = HPRS_FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";

const FirebaseSync = {
    isReady: false,
    _db: null,
    _unsubscribers: [],

    // --------------------------------------------------------
    // Initialize
    // --------------------------------------------------------
    async init() {
        if (!FIREBASE_READY) {
            console.warn('[HPRS] Firebase config not set. Using localStorage (single-device mode).');
            return false;
        }

        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(HPRS_FIREBASE_CONFIG);
            }
            this._db = firebase.firestore();

            await this._db.enablePersistence({ synchronizeTabs: true }).catch(e => {
                if (e.code !== 'failed-precondition' && e.code !== 'unimplemented') {
                    console.warn('[HPRS] Offline persistence unavailable:', e.code);
                }
            });

            this.isReady = true;
            console.log('[HPRS] ✅ Firebase Firestore connected — cross-hospital sync is LIVE.');

            await this._seedVersion3();
            return true;
        } catch (err) {
            console.error('[HPRS] Firebase init error:', err);
            return false;
        }
    },

    // --------------------------------------------------------
    // Seed v3 — runs only once (gated by system_meta/seed_v3)
    // --------------------------------------------------------
    async _seedVersion3() {
        const metaRef = this._db.collection('system_meta').doc('seed_v3');
        const metaSnap = await metaRef.get();
        if (metaSnap.exists) return;

        console.log('[HPRS] Seeding v3 demo data into Firestore...');
        const batch = this._db.batch();
        const set = (col, id, data) => batch.set(this._db.collection(col).doc(String(id)), data, { merge: true });

        // ── Hospitals ─────────────────────────────────────────────────────────
        set('hospitals', '1', { hospitalId: 1, name: 'Global City Hospital',    code: 'GCH', registrationNo: 'HOSP-2026-01', phone: '+1-555-0199', address: '123 Healthcare Ave, Central District', themeColor: '#1d4ed8', active: true });
        set('hospitals', '2', { hospitalId: 2, name: 'Municipal City Hospital', code: 'MCH', registrationNo: 'HOSP-2026-02', phone: '+1-555-0288', address: '456 Wellness Blvd, Northside',          themeColor: '#047857', active: true });

        // ── Departments ───────────────────────────────────────────────────────
        set('departments', '1', { departmentId: 1, name: 'General Medicine', hospitalId: 1, hospitalName: 'Global City Hospital'    });
        set('departments', '2', { departmentId: 2, name: 'Cardiology',       hospitalId: 1, hospitalName: 'Global City Hospital'    });
        set('departments', '3', { departmentId: 3, name: 'Neurology',        hospitalId: 1, hospitalName: 'Global City Hospital'    });
        set('departments', '4', { departmentId: 4, name: 'Orthopedics',      hospitalId: 2, hospitalName: 'Municipal City Hospital' });
        set('departments', '5', { departmentId: 5, name: 'General Medicine', hospitalId: 2, hospitalName: 'Municipal City Hospital' });

        // ── Staff Users ───────────────────────────────────────────────────────
        // GCH Staff
        set('users', '1',  { userId: 1,  fullName: 'Global City Administrator', email: 'gch.admin@hprs.com',        role: 'ADMIN',        hospitalId: 1, hospitalName: 'Global City Hospital',    active: true });
        set('users', '2',  { userId: 2,  fullName: 'Dr. Emily Carter',          email: 'gch.dr.carter@hprs.com',    role: 'DOCTOR',       specialization: 'Cardiology Specialist', departmentId: 2, hospitalId: 1, hospitalName: 'Global City Hospital', active: true });
        set('users', '3',  { userId: 3,  fullName: 'Dr. Rajesh Sharma',         email: 'gch.dr.sharma@hprs.com',    role: 'DOCTOR',       specialization: 'Neurology Specialist',  departmentId: 3, hospitalId: 1, hospitalName: 'Global City Hospital', active: true });
        set('users', '4',  { userId: 4,  fullName: 'Nurse Sarah Jenkins',       email: 'gch.nurse.sarah@hprs.com',  role: 'NURSE',        hospitalId: 1, hospitalName: 'Global City Hospital',    active: true });
        set('users', '5',  { userId: 5,  fullName: 'Nurse David Miller',        email: 'gch.nurse.david@hprs.com',  role: 'NURSE',        hospitalId: 1, hospitalName: 'Global City Hospital',    active: true });
        set('users', '6',  { userId: 6,  fullName: 'Mark Jenkins',              email: 'gch.reception@hprs.com',    role: 'RECEPTIONIST', hospitalId: 1, hospitalName: 'Global City Hospital',    active: true });
        // MCH Staff
        set('users', '7',  { userId: 7,  fullName: 'Municipal City Administrator', email: 'mch.admin@hprs.com',      role: 'ADMIN',        hospitalId: 2, hospitalName: 'Municipal City Hospital', active: true });
        set('users', '8',  { userId: 8,  fullName: 'Dr. James Rivera',             email: 'mch.dr.rivera@hprs.com',  role: 'DOCTOR',       specialization: 'Orthopedic Surgeon',   departmentId: 4, hospitalId: 2, hospitalName: 'Municipal City Hospital', active: true });
        set('users', '9',  { userId: 9,  fullName: 'Dr. Anita Patel',              email: 'mch.dr.patel@hprs.com',   role: 'DOCTOR',       specialization: 'General Medicine',     departmentId: 5, hospitalId: 2, hospitalName: 'Municipal City Hospital', active: true });
        set('users', '10', { userId: 10, fullName: 'Nurse Priya Nair',             email: 'mch.nurse.priya@hprs.com', role: 'NURSE',       hospitalId: 2, hospitalName: 'Municipal City Hospital', active: true });
        set('users', '11', { userId: 11, fullName: 'Rachel Green',                 email: 'mch.reception@hprs.com',  role: 'RECEPTIONIST', hospitalId: 2, hospitalName: 'Municipal City Hospital', active: true });
        // Legacy aliases (backward compat)
        set('users', '12', { userId: 12, fullName: 'Dr. Emily Carter',          email: 'doctor@hprs.com',       role: 'DOCTOR',       specialization: 'Cardiology Specialist', departmentId: 2, hospitalId: 1, hospitalName: 'Global City Hospital', active: true });
        set('users', '13', { userId: 13, fullName: 'Global City Administrator', email: 'admin@hprs.com',        role: 'ADMIN',        hospitalId: 1, hospitalName: 'Global City Hospital', active: true });
        set('users', '14', { userId: 14, fullName: 'Dr. James Rivera',          email: 'dr.rivera@hprs.com',    role: 'DOCTOR',       specialization: 'Orthopedic Surgeon',   departmentId: 4, hospitalId: 2, hospitalName: 'Municipal City Hospital', active: true });

        // ── 7 Patients ────────────────────────────────────────────────────────
        const now = new Date().toISOString();
        set('patients', '1', { patientId: 1, uhid: 'UHID-2026-10001', aadhaarNumber: '987654321001', aadhaarMasked: 'XXXX-XXXX-1001', fullName: 'John Doe',      dateOfBirth: '1985-06-15', gender: 'Male',   phone: '5551234567', email: 'john.doe@example.com',    address: '789 Elm St, Cityville',    bloodGroup: 'O+',  allergies: 'Penicillin',     emergencyContactName: 'Jane Doe',    emergencyContactPhone: '5559876543', registeredHospitalId: 1, registeredHospitalName: 'Global City Hospital',    createdAt: now });
        set('patients', '2', { patientId: 2, uhid: 'UHID-2026-10002', aadhaarNumber: '987654321002', aadhaarMasked: 'XXXX-XXXX-1002', fullName: 'Sarah Connor',  dateOfBirth: '1990-11-20', gender: 'Female', phone: '5552345678', email: 'sarah.c@example.com',     address: '321 Oak St, Metro City',   bloodGroup: 'A-',  allergies: 'Sulfa Drugs',    emergencyContactName: 'Kyle Reese',  emergencyContactPhone: '5558765432', registeredHospitalId: 1, registeredHospitalName: 'Global City Hospital',    createdAt: now });
        set('patients', '3', { patientId: 3, uhid: 'UHID-2026-10003', aadhaarNumber: '987654321003', aadhaarMasked: 'XXXX-XXXX-1003', fullName: 'Robert Chen',   dateOfBirth: '1978-03-08', gender: 'Male',   phone: '5553456789', email: 'r.chen@example.com',      address: '555 Pine Rd, Westside',    bloodGroup: 'B+',  allergies: 'Dust, Peanuts',  emergencyContactName: 'Lisa Chen',   emergencyContactPhone: '5557654321', registeredHospitalId: 2, registeredHospitalName: 'Municipal City Hospital', createdAt: now });
        set('patients', '4', { patientId: 4, uhid: 'UHID-2026-10004', aadhaarNumber: '987654321004', aadhaarMasked: 'XXXX-XXXX-1004', fullName: 'Priya Sharma',  dateOfBirth: '1995-04-12', gender: 'Female', phone: '5554567890', email: 'priya.s@example.com',     address: '101 Rosewood Ave, East',   bloodGroup: 'B+',  allergies: 'None',            emergencyContactName: 'Ravi Sharma', emergencyContactPhone: '5556543210', registeredHospitalId: 2, registeredHospitalName: 'Municipal City Hospital', createdAt: now });
        set('patients', '5', { patientId: 5, uhid: 'UHID-2026-10005', aadhaarNumber: '987654321005', aadhaarMasked: 'XXXX-XXXX-1005', fullName: 'Michael Brown', dateOfBirth: '1974-08-25', gender: 'Male',   phone: '5555678901', email: 'michael.b@example.com',   address: '220 Maple Dr, Northgate',  bloodGroup: 'AB+', allergies: 'Aspirin',         emergencyContactName: 'Carol Brown', emergencyContactPhone: '5555432109', registeredHospitalId: 1, registeredHospitalName: 'Global City Hospital',    createdAt: now });
        set('patients', '6', { patientId: 6, uhid: 'UHID-2026-10006', aadhaarNumber: '987654321006', aadhaarMasked: 'XXXX-XXXX-1006', fullName: 'Amina Khan',    dateOfBirth: '1982-12-03', gender: 'Female', phone: '5556789012', email: 'amina.k@example.com',     address: '44 Cedar Blvd, Southside', bloodGroup: 'O-',  allergies: 'Latex',           emergencyContactName: 'Omar Khan',   emergencyContactPhone: '5554321098', registeredHospitalId: 2, registeredHospitalName: 'Municipal City Hospital', createdAt: now });
        set('patients', '7', { patientId: 7, uhid: 'UHID-2026-10007', aadhaarNumber: '987654321007', aadhaarMasked: 'XXXX-XXXX-1007', fullName: 'David Wilson',  dateOfBirth: '1961-02-18', gender: 'Male',   phone: '5557890123', email: 'david.w@example.com',     address: '8 Birch Lane, Downtown',   bloodGroup: 'A+',  allergies: 'Shellfish',       emergencyContactName: 'Mary Wilson', emergencyContactPhone: '5553210987', registeredHospitalId: 2, registeredHospitalName: 'Municipal City Hospital', createdAt: now });

        // ── 7 Scheduled Appointments ──────────────────────────────────────────
        set('appointments', '1', { appointmentId: 1, patientId: 1, patientName: 'John Doe',      patientUhid: 'UHID-2026-10001', doctorId: 2,  doctorName: 'Dr. Emily Carter',  hospitalId: 1, hospitalName: 'Global City Hospital',    appointmentDatetime: '2026-10-16T09:30', reason: 'Cardiology Routine Followup',             status: 'SCHEDULED', createdAt: now });
        set('appointments', '2', { appointmentId: 2, patientId: 2, patientName: 'Sarah Connor',  patientUhid: 'UHID-2026-10002', doctorId: 3,  doctorName: 'Dr. Rajesh Sharma', hospitalId: 1, hospitalName: 'Global City Hospital',    appointmentDatetime: '2026-10-16T11:00', reason: 'Chronic Migraine & Neuro Screening',      status: 'SCHEDULED', createdAt: now });
        set('appointments', '3', { appointmentId: 3, patientId: 3, patientName: 'Robert Chen',   patientUhid: 'UHID-2026-10003', doctorId: 8,  doctorName: 'Dr. James Rivera',  hospitalId: 2, hospitalName: 'Municipal City Hospital', appointmentDatetime: '2026-10-17T10:15', reason: 'Right Knee Arthroscopy Post-Op',           status: 'SCHEDULED', createdAt: now });
        set('appointments', '4', { appointmentId: 4, patientId: 4, patientName: 'Priya Sharma',  patientUhid: 'UHID-2026-10004', doctorId: 9,  doctorName: 'Dr. Anita Patel',   hospitalId: 2, hospitalName: 'Municipal City Hospital', appointmentDatetime: '2026-10-17T14:00', reason: 'General Health Checkup',                  status: 'SCHEDULED', createdAt: now });
        set('appointments', '5', { appointmentId: 5, patientId: 5, patientName: 'Michael Brown', patientUhid: 'UHID-2026-10005', doctorId: 2,  doctorName: 'Dr. Emily Carter',  hospitalId: 1, hospitalName: 'Global City Hospital',    appointmentDatetime: '2026-10-18T10:30', reason: 'Chest Tightness & Lipid Review',          status: 'SCHEDULED', createdAt: now });
        set('appointments', '6', { appointmentId: 6, patientId: 6, patientName: 'Amina Khan',    patientUhid: 'UHID-2026-10006', doctorId: 8,  doctorName: 'Dr. James Rivera',  hospitalId: 2, hospitalName: 'Municipal City Hospital', appointmentDatetime: '2026-10-18T15:30', reason: 'Ankle Sprain Physical Therapy',           status: 'SCHEDULED', createdAt: now });
        set('appointments', '7', { appointmentId: 7, patientId: 7, patientName: 'David Wilson',  patientUhid: 'UHID-2026-10007', doctorId: 9,  doctorName: 'Dr. Anita Patel',   hospitalId: 2, hospitalName: 'Municipal City Hospital', appointmentDatetime: '2026-10-19T11:15', reason: 'Type-2 Diabetes HbA1c Management',        status: 'SCHEDULED', createdAt: now });

        // ── 2 Sample Clinical Visits ──────────────────────────────────────────
        set('visits', 'v1', {
            visitId: 1, patientId: 2, patientName: 'Sarah Connor', patientUhid: 'UHID-2026-10002',
            doctorId: 3, doctorName: 'Dr. Rajesh Sharma', hospitalId: 1, hospitalName: 'Global City Hospital',
            visitDate: '2026-10-10T11:30:00.000Z',
            symptoms: 'Recurring migraine episodes, photophobia, nausea',
            vitals: 'BP: 130/85 mmHg, Pulse: 76 bpm, Temp: 98.4F, SpO2: 98%',
            diagnosis: 'Chronic Migraine with Aura — Stage II',
            notes: 'Avoid bright screens before sleep. Follow up MRI recommended.',
            prescriptions: [
                { medicineName: 'Sumatriptan', dosage: '50 mg', frequency: 'As needed (max 2/day)', duration: '30 Days', instructions: 'Take at onset of migraine' },
                { medicineName: 'Amitriptyline', dosage: '10 mg', frequency: 'Once daily (Night)', duration: '30 Days', instructions: 'Do not stop abruptly' }
            ],
            labTests: [{ testName: 'MRI Brain (with contrast)', result: 'Pending', status: 'ORDERED' }],
            createdAt: now
        });
        set('visits', 'v2', {
            visitId: 2, patientId: 1, patientName: 'John Doe', patientUhid: 'UHID-2026-10001',
            doctorId: 2, doctorName: 'Dr. Emily Carter', hospitalId: 1, hospitalName: 'Global City Hospital',
            visitDate: '2026-10-12T09:30:00.000Z',
            symptoms: 'Occasional chest tightness, shortness of breath on exertion',
            vitals: 'BP: 142/90 mmHg, Pulse: 82 bpm, Temp: 98.6F, SpO2: 97%',
            diagnosis: 'Stage 1 Hypertension — Lipid Profile Abnormal',
            notes: 'Low sodium diet. 30 mins brisk walk daily. Reduce processed foods.',
            prescriptions: [
                { medicineName: 'Amlodipine Besylate', dosage: '5 mg', frequency: 'Once daily (Morning)', duration: '60 Days', instructions: 'Take with water after breakfast' },
                { medicineName: 'Rosuvastatin', dosage: '10 mg', frequency: 'Once daily (Night)', duration: '60 Days', instructions: 'Avoid grapefruit juice' }
            ],
            labTests: [
                { testName: 'ECG', result: 'Normal sinus rhythm', status: 'COMPLETED' },
                { testName: 'Lipid Panel', result: 'LDL 160 mg/dL (High)', status: 'COMPLETED' }
            ],
            createdAt: now
        });

        // ── 2 Sample Documents ────────────────────────────────────────────────
        set('documents', 'doc1', {
            documentId: 'doc1', patientId: 1, patientUhid: 'UHID-2026-10001',
            category: 'ECG', title: 'ECG Report — Oct 12 2026',
            uploadedBy: 'Dr. Emily Carter', uploadedAt: now,
            notes: 'Normal sinus rhythm. No acute changes.',
            fileDataUrl: null, fileType: 'application/pdf'
        });
        set('documents', 'doc2', {
            documentId: 'doc2', patientId: 2, patientUhid: 'UHID-2026-10002',
            category: 'MRI', title: 'MRI Brain Scan Order — Oct 10 2026',
            uploadedBy: 'Dr. Rajesh Sharma', uploadedAt: now,
            notes: 'MRI with contrast ordered. Pending results.',
            fileDataUrl: null, fileType: 'application/pdf'
        });

        // ── Mark seed done ─────────────────────────────────────────────────────
        batch.set(metaRef, { seededAt: now, version: 'v3' });

        await batch.commit();
        console.log('[HPRS] ✅ v3 demo data seeded into Firestore (14 users, 7 patients, 7 appointments).');
    },

    // --------------------------------------------------------
    // Real-time listener: fires callback when collection changes
    // --------------------------------------------------------
    listenCollection(collectionName, callback) {
        if (!this.isReady) return () => {};
        const unsub = this._db.collection(collectionName).onSnapshot((snap) => {
            const docs = snap.docs.map(d => ({ ...d.data(), _docId: d.id }));
            callback(docs);
        }, (err) => console.error(`[HPRS] Listener error on ${collectionName}:`, err));
        this._unsubscribers.push(unsub);
        return unsub;
    },

    // --------------------------------------------------------
    // Get all documents in a collection
    // --------------------------------------------------------
    async getCollection(name) {
        const snap = await this._db.collection(name).get();
        return snap.docs.map(d => ({ ...d.data(), _docId: d.id }));
    },

    // --------------------------------------------------------
    // Get a single document by ID
    // --------------------------------------------------------
    async getDocument(collectionName, docId) {
        const snap = await this._db.collection(collectionName).doc(String(docId)).get();
        if (!snap.exists) return null;
        return { ...snap.data(), _docId: snap.id };
    },

    // --------------------------------------------------------
    // Write / merge a document (create or update)
    // --------------------------------------------------------
    async setDocument(collectionName, docId, data) {
        await this._db.collection(collectionName).doc(String(docId)).set(
            { ...data, lastUpdated: firebase.firestore.FieldValue.serverTimestamp() },
            { merge: true }
        );
    },

    // --------------------------------------------------------
    // Delete a document
    // --------------------------------------------------------
    async deleteDocument(collectionName, docId) {
        await this._db.collection(collectionName).doc(String(docId)).delete();
    },

    // --------------------------------------------------------
    // Search within a collection by a single field value
    // --------------------------------------------------------
    async queryByField(collectionName, field, value) {
        const snap = await this._db.collection(collectionName).where(field, '==', value).get();
        return snap.docs.map(d => ({ ...d.data(), _docId: d.id }));
    },

    // --------------------------------------------------------
    // Cleanup all listeners on page unload
    // --------------------------------------------------------
    cleanup() {
        this._unsubscribers.forEach(fn => fn && fn());
        this._unsubscribers = [];
    }
};

// Auto-init when DOM is loaded (non-blocking)
document.addEventListener('DOMContentLoaded', async () => {
    if (FIREBASE_READY) {
        await FirebaseSync.init();
    }
});

window.addEventListener('beforeunload', () => FirebaseSync.cleanup());
