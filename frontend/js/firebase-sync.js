/**
 * HPRS Firebase Firestore Real-Time Sync Engine
 * -----------------------------------------------
 * Enables two laptops on ANY network to share the same patient database.
 * Uses Firebase Firestore (Google's free cloud database).
 *
 * ✅ Any UHID entered at Hospital A is immediately visible at Hospital B.
 * ✅ Clinical visits, prescriptions, appointments all sync in real-time.
 * ✅ Works on any two devices with internet access.
 *
 * ────────────────────────────────────────────────
 * ONE-TIME SETUP (5 minutes):
 * ────────────────────────────────────────────────
 *  1. Go to → https://console.firebase.google.com
 *  2. Click "Add project" → name it "hprs-network" → Create
 *  3. In the left sidebar → Firestore Database → Create database → Start in test mode → Next → Enable
 *  4. In the left sidebar → Project Settings (gear icon) → General tab
 *  5. Scroll down to "Your apps" → click </> (Web) → register the app → Copy the firebaseConfig
 *  6. Paste it below replacing the placeholder values
 *  7. Open the app on BOTH laptops (same URL) → data syncs instantly
 * ────────────────────────────────────────────────
 */

// ============================================================
// 🔧 PASTE YOUR FIREBASE CONFIG HERE
//    (replace all "YOUR_..." values)
// ============================================================
const HPRS_FIREBASE_CONFIG = {
    apiKey:            "YOUR_API_KEY",
    authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
    projectId:         "YOUR_PROJECT_ID",
    storageBucket:     "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId:             "YOUR_APP_ID"
};
// ============================================================

// Is Firebase properly configured?
const FIREBASE_READY = HPRS_FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";

const FirebaseSync = {
    isReady: false,
    _db: null,
    _unsubscribers: [],

    // --------------------------------------------------------
    // Initialize — call this once before anything else
    // --------------------------------------------------------
    async init() {
        if (!FIREBASE_READY) {
            console.warn('[HPRS] Firebase config not set. Using localStorage (single-device mode).');
            return false;
        }

        try {
            // Initialize Firebase app (compat SDK loaded via CDN in HTML)
            if (!firebase.apps.length) {
                firebase.initializeApp(HPRS_FIREBASE_CONFIG);
            }
            this._db = firebase.firestore();

            // Enable offline persistence so the app works even briefly offline
            await this._db.enablePersistence({ synchronizeTabs: true }).catch(e => {
                if (e.code !== 'failed-precondition' && e.code !== 'unimplemented') {
                    console.warn('[HPRS] Offline persistence unavailable:', e.code);
                }
            });

            this.isReady = true;
            console.log('[HPRS] ✅ Firebase Firestore connected — cross-hospital sync is LIVE.');

            // Seed demo data if Firestore is empty
            await this._seedIfEmpty();
            return true;
        } catch (err) {
            console.error('[HPRS] Firebase init error:', err);
            return false;
        }
    },

    // --------------------------------------------------------
    // Seed initial demo data (runs only when Firestore is new)
    // --------------------------------------------------------
    async _seedIfEmpty() {
        const snap = await this._db.collection('users').limit(1).get();
        if (!snap.empty) return;

        console.log('[HPRS] Seeding demo data into Firestore...');
        const batch = this._db.batch();

        const setDoc = (col, id, data) => batch.set(this._db.collection(col).doc(String(id)), data);

        // Hospitals
        setDoc('hospitals', '1', { hospitalId: 1, name: 'Global City Hospital', registrationNo: 'HOSP-2026-01', phone: '+1-555-0199', address: '123 Healthcare Ave, Central District', active: true });
        setDoc('hospitals', '2', { hospitalId: 2, name: 'Metro Multi-Specialty Hospital', registrationNo: 'HOSP-2026-02', phone: '+1-555-0288', address: '456 Wellness Blvd, Northside', active: true });

        // Staff users (both hospitals)
        const users = [
            { userId: 1, fullName: 'System Administrator',  email: 'admin@hprs.com',       role: 'ADMIN',        hospitalId: 1, hospitalName: 'Global City Hospital', active: true },
            { userId: 2, fullName: 'Dr. Emily Carter',       email: 'doctor@hprs.com',      role: 'DOCTOR',       specialization: 'Cardiology Specialist',  departmentId: 2, hospitalId: 1, hospitalName: 'Global City Hospital', active: true },
            { userId: 3, fullName: 'Mark Jenkins',           email: 'receptionist@hprs.com', role: 'RECEPTIONIST', hospitalId: 1, hospitalName: 'Global City Hospital', active: true },
            { userId: 4, fullName: 'Nurse Sarah Jenkins',    email: 'nurse@hprs.com',       role: 'NURSE',        hospitalId: 1, hospitalName: 'Global City Hospital', active: true },
            { userId: 5, fullName: 'Dr. James Rivera',       email: 'dr.rivera@hprs.com',   role: 'DOCTOR',       specialization: 'Orthopedic Surgeon',      departmentId: 4, hospitalId: 2, hospitalName: 'Metro Multi-Specialty Hospital', active: true },
            { userId: 6, fullName: 'Metro Administrator',    email: 'metro.admin@hprs.com', role: 'ADMIN',        hospitalId: 2, hospitalName: 'Metro Multi-Specialty Hospital', active: true }
        ];
        users.forEach(u => setDoc('users', String(u.userId), u));

        // Demo patients (registered across both hospitals — same UHID visible everywhere)
        const patients = [
            { patientId: 1, uhid: 'UHID-2026-10001', fullName: 'John Doe',     dateOfBirth: '1985-06-15', gender: 'Male',   phone: '5551234567', email: 'john.doe@example.com', address: '789 Elm St, Cityville',    bloodGroup: 'O+', allergies: 'Penicillin',     emergencyContactName: 'Jane Doe',    emergencyContactPhone: '5559876543', registeredHospitalId: 1, registeredHospitalName: 'Global City Hospital', createdAt: new Date().toISOString() },
            { patientId: 2, uhid: 'UHID-2026-10002', fullName: 'Sarah Connor', dateOfBirth: '1990-11-20', gender: 'Female', phone: '5552345678', email: 'sarah.c@example.com',   address: '321 Oak St, Metro City',   bloodGroup: 'A-', allergies: 'Sulfa Drugs',   emergencyContactName: 'Kyle Reese',  emergencyContactPhone: '5558765432', registeredHospitalId: 1, registeredHospitalName: 'Global City Hospital', createdAt: new Date().toISOString() },
            { patientId: 3, uhid: 'UHID-2026-10003', fullName: 'Robert Chen',  dateOfBirth: '1978-03-08', gender: 'Male',   phone: '5553456789', email: 'r.chen@example.com',    address: '555 Pine Rd, Westside',    bloodGroup: 'B+', allergies: 'Dust, Peanuts', emergencyContactName: 'Lisa Chen',   emergencyContactPhone: '5557654321', registeredHospitalId: 2, registeredHospitalName: 'Metro Multi-Specialty Hospital', createdAt: new Date().toISOString() }
        ];
        patients.forEach(p => setDoc('patients', String(p.patientId), p));

        // Demo visit (from Global City Hospital for Sarah Connor)
        setDoc('visits', 'v1', {
            visitId: 1, patientId: 2, patientName: 'Sarah Connor', patientUhid: 'UHID-2026-10002',
            doctorId: 2, doctorName: 'Dr. Emily Carter', hospitalId: 1, hospitalName: 'Global City Hospital',
            visitDate: '2026-10-10T11:30:00.000Z',
            symptoms: 'Mild chest tightness after physical exercise, anxiety',
            vitals: 'BP: 135/88 mmHg, Pulse: 78 bpm, Temp: 98.6F, SpO2: 99%',
            diagnosis: 'Stage 1 Hypertension & Acute Anxiety',
            notes: 'Advised daily blood pressure tracking and low sodium diet.',
            prescriptions: [
                { medicineName: 'Amlodipine Besylate', dosage: '5 mg', frequency: 'Once daily (Morning)', duration: '30 Days', instructions: 'Take with water after breakfast' },
                { medicineName: 'Metoprolol Succinate', dosage: '25 mg', frequency: 'Once daily (Evening)', duration: '30 Days', instructions: 'Do not skip doses' }
            ],
            labTests: [{ testName: 'Electrocardiogram (ECG)', result: 'Normal sinus rhythm', status: 'COMPLETED' }],
            createdAt: new Date().toISOString()
        });

        // Departments
        [
            { departmentId: 1, name: 'General Medicine', hospitalId: 1, hospitalName: 'Global City Hospital' },
            { departmentId: 2, name: 'Cardiology',       hospitalId: 1, hospitalName: 'Global City Hospital' },
            { departmentId: 3, name: 'Pediatrics',       hospitalId: 1, hospitalName: 'Global City Hospital' },
            { departmentId: 4, name: 'Orthopedics',      hospitalId: 2, hospitalName: 'Metro Multi-Specialty Hospital' }
        ].forEach(d => setDoc('departments', String(d.departmentId), d));

        await batch.commit();
        console.log('[HPRS] ✅ Demo data seeded into Firestore.');
    },

    // --------------------------------------------------------
    // Real-time listener: fires callback whenever a collection changes
    // Usage: FirebaseSync.listenCollection('visits', (docs) => { ... })
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
