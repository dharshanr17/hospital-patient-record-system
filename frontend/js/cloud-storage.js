/**
 * Hospital Patient Record System (HPRS) - Cloud Storage Engine v3
 * Provides persistent data storage with localStorage fallback.
 */

const CloudStorage = {
    STORAGE_KEY: 'hprs_cloud_db_v3',

    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            const db = {
                version: '3.0.0',
                lastSynced: new Date().toISOString(),
                hospitals: [
                    { hospitalId: 1, name: 'Global City Hospital',    code: 'GCH', registrationNo: 'HOSP-2026-01', phone: '+1-555-0199', address: '123 Healthcare Ave, Central District', themeColor: '#1d4ed8', active: true },
                    { hospitalId: 2, name: 'Municipal City Hospital', code: 'MCH', registrationNo: 'HOSP-2026-02', phone: '+1-555-0288', address: '456 Wellness Blvd, Northside',          themeColor: '#047857', active: true }
                ],
                departments: [
                    { departmentId: 1, name: 'General Medicine', hospitalId: 1, hospitalName: 'Global City Hospital'    },
                    { departmentId: 2, name: 'Cardiology',       hospitalId: 1, hospitalName: 'Global City Hospital'    },
                    { departmentId: 3, name: 'Neurology',        hospitalId: 1, hospitalName: 'Global City Hospital'    },
                    { departmentId: 4, name: 'Orthopedics',      hospitalId: 2, hospitalName: 'Municipal City Hospital' },
                    { departmentId: 5, name: 'General Medicine', hospitalId: 2, hospitalName: 'Municipal City Hospital' }
                ],
                users: [
                    // GCH
                    { userId: 1,  fullName: 'Global City Administrator',    email: 'gch.admin@hprs.com',        role: 'ADMIN',        hospitalId: 1, hospitalName: 'Global City Hospital',    active: true },
                    { userId: 2,  fullName: 'Dr. Emily Carter',             email: 'gch.dr.carter@hprs.com',    role: 'DOCTOR',       specialization: 'Cardiology Specialist', departmentId: 2, hospitalId: 1, hospitalName: 'Global City Hospital', active: true },
                    { userId: 3,  fullName: 'Dr. Rajesh Sharma',            email: 'gch.dr.sharma@hprs.com',    role: 'DOCTOR',       specialization: 'Neurology Specialist',  departmentId: 3, hospitalId: 1, hospitalName: 'Global City Hospital', active: true },
                    { userId: 4,  fullName: 'Nurse Sarah Jenkins',          email: 'gch.nurse.sarah@hprs.com',  role: 'NURSE',        hospitalId: 1, hospitalName: 'Global City Hospital',    active: true },
                    { userId: 5,  fullName: 'Nurse David Miller',           email: 'gch.nurse.david@hprs.com',  role: 'NURSE',        hospitalId: 1, hospitalName: 'Global City Hospital',    active: true },
                    { userId: 6,  fullName: 'Mark Jenkins',                 email: 'gch.reception@hprs.com',    role: 'RECEPTIONIST', hospitalId: 1, hospitalName: 'Global City Hospital',    active: true },
                    // MCH
                    { userId: 7,  fullName: 'Municipal City Administrator', email: 'mch.admin@hprs.com',        role: 'ADMIN',        hospitalId: 2, hospitalName: 'Municipal City Hospital', active: true },
                    { userId: 8,  fullName: 'Dr. James Rivera',             email: 'mch.dr.rivera@hprs.com',    role: 'DOCTOR',       specialization: 'Orthopedic Surgeon',   departmentId: 4, hospitalId: 2, hospitalName: 'Municipal City Hospital', active: true },
                    { userId: 9,  fullName: 'Dr. Anita Patel',              email: 'mch.dr.patel@hprs.com',     role: 'DOCTOR',       specialization: 'General Medicine',     departmentId: 5, hospitalId: 2, hospitalName: 'Municipal City Hospital', active: true },
                    { userId: 10, fullName: 'Nurse Priya Nair',             email: 'mch.nurse.priya@hprs.com',  role: 'NURSE',        hospitalId: 2, hospitalName: 'Municipal City Hospital', active: true },
                    { userId: 11, fullName: 'Rachel Green',                 email: 'mch.reception@hprs.com',    role: 'RECEPTIONIST', hospitalId: 2, hospitalName: 'Municipal City Hospital', active: true },
                    // Legacy aliases
                    { userId: 12, fullName: 'Dr. Emily Carter',             email: 'doctor@hprs.com',           role: 'DOCTOR',       specialization: 'Cardiology Specialist', departmentId: 2, hospitalId: 1, hospitalName: 'Global City Hospital', active: true },
                    { userId: 13, fullName: 'Global City Administrator',    email: 'admin@hprs.com',            role: 'ADMIN',        hospitalId: 1, hospitalName: 'Global City Hospital', active: true },
                    { userId: 14, fullName: 'Dr. James Rivera',             email: 'dr.rivera@hprs.com',        role: 'DOCTOR',       specialization: 'Orthopedic Surgeon',   departmentId: 4, hospitalId: 2, hospitalName: 'Municipal City Hospital', active: true }
                ],
                patients: [
                    { patientId: 1, uhid: 'UHID-2026-10001', aadhaarNumber: '987654321001', aadhaarMasked: 'XXXX-XXXX-1001', fullName: 'John Doe',      dateOfBirth: '1985-06-15', gender: 'Male',   phone: '5551234567', email: 'john.doe@example.com',  address: '789 Elm St, Cityville',    bloodGroup: 'O+',  allergies: 'Penicillin',    emergencyContactName: 'Jane Doe',    emergencyContactPhone: '5559876543', registeredHospitalId: 1, registeredHospitalName: 'Global City Hospital',    createdAt: '2026-10-01T09:00:00.000Z' },
                    { patientId: 2, uhid: 'UHID-2026-10002', aadhaarNumber: '987654321002', aadhaarMasked: 'XXXX-XXXX-1002', fullName: 'Sarah Connor',  dateOfBirth: '1990-11-20', gender: 'Female', phone: '5552345678', email: 'sarah.c@example.com',   address: '321 Oak St, Metro City',   bloodGroup: 'A-',  allergies: 'Sulfa Drugs',   emergencyContactName: 'Kyle Reese',  emergencyContactPhone: '5558765432', registeredHospitalId: 1, registeredHospitalName: 'Global City Hospital',    createdAt: '2026-10-05T14:30:00.000Z' },
                    { patientId: 3, uhid: 'UHID-2026-10003', aadhaarNumber: '987654321003', aadhaarMasked: 'XXXX-XXXX-1003', fullName: 'Robert Chen',   dateOfBirth: '1978-03-08', gender: 'Male',   phone: '5553456789', email: 'r.chen@example.com',    address: '555 Pine Rd, Westside',    bloodGroup: 'B+',  allergies: 'Dust, Peanuts', emergencyContactName: 'Lisa Chen',   emergencyContactPhone: '5557654321', registeredHospitalId: 2, registeredHospitalName: 'Municipal City Hospital', createdAt: '2026-10-08T11:15:00.000Z' },
                    { patientId: 4, uhid: 'UHID-2026-10004', aadhaarNumber: '987654321004', aadhaarMasked: 'XXXX-XXXX-1004', fullName: 'Priya Sharma',  dateOfBirth: '1995-04-12', gender: 'Female', phone: '5554567890', email: 'priya.s@example.com',   address: '101 Rosewood Ave, East',   bloodGroup: 'B+',  allergies: 'None',           emergencyContactName: 'Ravi Sharma', emergencyContactPhone: '5556543210', registeredHospitalId: 2, registeredHospitalName: 'Municipal City Hospital', createdAt: '2026-10-09T09:00:00.000Z' },
                    { patientId: 5, uhid: 'UHID-2026-10005', aadhaarNumber: '987654321005', aadhaarMasked: 'XXXX-XXXX-1005', fullName: 'Michael Brown', dateOfBirth: '1974-08-25', gender: 'Male',   phone: '5555678901', email: 'michael.b@example.com', address: '220 Maple Dr, Northgate',  bloodGroup: 'AB+', allergies: 'Aspirin',        emergencyContactName: 'Carol Brown', emergencyContactPhone: '5555432109', registeredHospitalId: 1, registeredHospitalName: 'Global City Hospital',    createdAt: '2026-10-09T10:00:00.000Z' },
                    { patientId: 6, uhid: 'UHID-2026-10006', aadhaarNumber: '987654321006', aadhaarMasked: 'XXXX-XXXX-1006', fullName: 'Amina Khan',    dateOfBirth: '1982-12-03', gender: 'Female', phone: '5556789012', email: 'amina.k@example.com',   address: '44 Cedar Blvd, Southside', bloodGroup: 'O-',  allergies: 'Latex',          emergencyContactName: 'Omar Khan',   emergencyContactPhone: '5554321098', registeredHospitalId: 2, registeredHospitalName: 'Municipal City Hospital', createdAt: '2026-10-10T08:00:00.000Z' },
                    { patientId: 7, uhid: 'UHID-2026-10007', aadhaarNumber: '987654321007', aadhaarMasked: 'XXXX-XXXX-1007', fullName: 'David Wilson',  dateOfBirth: '1961-02-18', gender: 'Male',   phone: '5557890123', email: 'david.w@example.com',   address: '8 Birch Lane, Downtown',   bloodGroup: 'A+',  allergies: 'Shellfish',      emergencyContactName: 'Mary Wilson', emergencyContactPhone: '5553210987', registeredHospitalId: 2, registeredHospitalName: 'Municipal City Hospital', createdAt: '2026-10-10T09:00:00.000Z' }
                ],
                appointments: [
                    { appointmentId: 1, patientId: 1, patientName: 'John Doe',      patientUhid: 'UHID-2026-10001', doctorId: 2,  doctorName: 'Dr. Emily Carter',  hospitalId: 1, hospitalName: 'Global City Hospital',    appointmentDatetime: '2026-10-16T09:30', reason: 'Cardiology Routine Followup',        status: 'SCHEDULED', createdAt: '2026-10-09T08:00:00.000Z' },
                    { appointmentId: 2, patientId: 2, patientName: 'Sarah Connor',  patientUhid: 'UHID-2026-10002', doctorId: 3,  doctorName: 'Dr. Rajesh Sharma', hospitalId: 1, hospitalName: 'Global City Hospital',    appointmentDatetime: '2026-10-16T11:00', reason: 'Chronic Migraine & Neuro Screening', status: 'SCHEDULED', createdAt: '2026-10-09T09:00:00.000Z' },
                    { appointmentId: 3, patientId: 3, patientName: 'Robert Chen',   patientUhid: 'UHID-2026-10003', doctorId: 8,  doctorName: 'Dr. James Rivera',  hospitalId: 2, hospitalName: 'Municipal City Hospital', appointmentDatetime: '2026-10-17T10:15', reason: 'Right Knee Arthroscopy Post-Op',     status: 'SCHEDULED', createdAt: '2026-10-09T10:00:00.000Z' },
                    { appointmentId: 4, patientId: 4, patientName: 'Priya Sharma',  patientUhid: 'UHID-2026-10004', doctorId: 9,  doctorName: 'Dr. Anita Patel',   hospitalId: 2, hospitalName: 'Municipal City Hospital', appointmentDatetime: '2026-10-17T14:00', reason: 'General Health Checkup',             status: 'SCHEDULED', createdAt: '2026-10-09T11:00:00.000Z' },
                    { appointmentId: 5, patientId: 5, patientName: 'Michael Brown', patientUhid: 'UHID-2026-10005', doctorId: 2,  doctorName: 'Dr. Emily Carter',  hospitalId: 1, hospitalName: 'Global City Hospital',    appointmentDatetime: '2026-10-18T10:30', reason: 'Chest Tightness & Lipid Review',     status: 'SCHEDULED', createdAt: '2026-10-09T12:00:00.000Z' },
                    { appointmentId: 6, patientId: 6, patientName: 'Amina Khan',    patientUhid: 'UHID-2026-10006', doctorId: 8,  doctorName: 'Dr. James Rivera',  hospitalId: 2, hospitalName: 'Municipal City Hospital', appointmentDatetime: '2026-10-18T15:30', reason: 'Ankle Sprain Physical Therapy',      status: 'SCHEDULED', createdAt: '2026-10-09T13:00:00.000Z' },
                    { appointmentId: 7, patientId: 7, patientName: 'David Wilson',  patientUhid: 'UHID-2026-10007', doctorId: 9,  doctorName: 'Dr. Anita Patel',   hospitalId: 2, hospitalName: 'Municipal City Hospital', appointmentDatetime: '2026-10-19T11:15', reason: 'Type-2 Diabetes HbA1c Management',   status: 'SCHEDULED', createdAt: '2026-10-09T14:00:00.000Z' }
                ],
                visits: [
                    {
                        visitId: 1, patientId: 2, patientName: 'Sarah Connor', patientUhid: 'UHID-2026-10002',
                        doctorId: 3, doctorName: 'Dr. Rajesh Sharma', hospitalId: 1, hospitalName: 'Global City Hospital',
                        visitDate: '2026-10-10T11:30:00.000Z',
                        symptoms: 'Recurring migraine episodes, photophobia, nausea',
                        vitals: 'BP: 130/85 mmHg, Pulse: 76 bpm, Temp: 98.4F, SpO2: 98%',
                        diagnosis: 'Chronic Migraine with Aura — Stage II',
                        notes: 'Avoid bright screens before sleep.',
                        prescriptions: [
                            { prescriptionId: 1, medicineName: 'Sumatriptan', dosage: '50 mg', frequency: 'As needed', duration: '30 Days', instructions: 'Take at onset of migraine' }
                        ],
                        labTests: [{ labTestId: 1, testName: 'MRI Brain (with contrast)', result: 'Pending', status: 'ORDERED' }]
                    }
                ],
                documents: [],
                auditLogs: [
                    { auditId: 1, userName: 'System', userRole: 'ADMIN', action: 'SYSTEM_INIT_V3', details: 'Cloud database v3 initialized — GCH & MCH', timestamp: new Date().toISOString(), ipAddress: '127.0.0.1' }
                ]
            };
            this.saveData(db);
        } else {
            // Migrate old db keys if user has v2 data
            try {
                const oldKey = 'hprs_cloud_db_v2';
                if (localStorage.getItem(oldKey) && !localStorage.getItem(this.STORAGE_KEY)) {
                    console.log('[HPRS] Migrating v2 → v3 localStorage...');
                    // Already handled by not finding v3 key above
                }
            } catch(e) { /* ignore */ }
        }
    },

    getData() {
        this.init();
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        } catch (e) {
            console.error('Cloud Storage parse error:', e);
            localStorage.removeItem(this.STORAGE_KEY);
            this.init();
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        }
    },

    saveData(db) {
        db.lastSynced = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(db));
    },

    logAudit(action, details) {
        const db = this.getData();
        const userName = localStorage.getItem('hprs_user_name') || 'System User';
        const userRole = localStorage.getItem('hprs_role') || 'GUEST';
        if (!db.auditLogs) db.auditLogs = [];
        db.auditLogs.unshift({
            auditId: db.auditLogs.length + 1,
            userName, userRole, action, details,
            timestamp: new Date().toISOString(),
            ipAddress: '127.0.0.1'
        });
        this.saveData(db);
    },

    exportBackup() {
        const db = this.getData();
        const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hprs_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importBackup(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.patients || !parsed.users || !parsed.hospitals) {
                throw new Error('Invalid backup file format');
            }
            this.saveData(parsed);
            alert('Cloud Database restored successfully!');
            window.location.reload();
        } catch (e) {
            alert('Failed to import backup: ' + e.message);
        }
    }
};

CloudStorage.init();
