/**
 * Hospital Patient Record System (HPRS) - Cloud Storage Engine
 * Provides persistent data storage, real-time cloud synchronization,
 * and JSON/CSV backup import/export capabilities.
 */

const CloudStorage = {
    STORAGE_KEY: 'hprs_cloud_db_v2',

    // Initialize Persistent Cloud Data Store
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            const initialCloudDb = {
                version: '2.0.0',
                lastSynced: new Date().toISOString(),
                hospitals: [
                    { hospitalId: 1, name: 'Global City Hospital', registrationNo: 'HOSP-2026-01', phone: '+1-555-0199', address: '123 Healthcare Ave, Central District', active: true },
                    { hospitalId: 2, name: 'Metro Multi-Specialty Hospital', registrationNo: 'HOSP-2026-02', phone: '+1-555-0288', address: '456 Wellness Blvd, Northside', active: true }
                ],
                departments: [
                    { departmentId: 1, name: 'General Medicine', hospitalId: 1, hospitalName: 'Global City Hospital' },
                    { departmentId: 2, name: 'Cardiology', hospitalId: 1, hospitalName: 'Global City Hospital' },
                    { departmentId: 3, name: 'Pediatrics', hospitalId: 1, hospitalName: 'Global City Hospital' },
                    { departmentId: 4, name: 'Orthopedics', hospitalId: 2, hospitalName: 'Metro Multi-Specialty Hospital' }
                ],
                users: [
                    { userId: 1, fullName: 'System Administrator', email: 'admin@hprs.com', role: 'ADMIN', hospitalId: 1, hospitalName: 'Global City Hospital', active: true },
                    { userId: 2, fullName: 'Dr. Emily Carter', email: 'doctor@hprs.com', role: 'DOCTOR', specialization: 'Cardiology Specialist', departmentId: 2, hospitalId: 1, hospitalName: 'Global City Hospital', active: true },
                    { userId: 3, fullName: 'Mark Jenkins', email: 'receptionist@hprs.com', role: 'RECEPTIONIST', hospitalId: 1, hospitalName: 'Global City Hospital', active: true },
                    { userId: 4, fullName: 'Nurse Sarah Jenkins', email: 'nurse@hprs.com', role: 'NURSE', hospitalId: 1, hospitalName: 'Global City Hospital', active: true }
                ],
                patients: [
                    {
                        patientId: 1,
                        uhid: 'UHID-2026-10001',
                        fullName: 'John Doe',
                        dateOfBirth: '1985-06-15',
                        gender: 'Male',
                        phone: '5551234567',
                        email: 'john.doe@example.com',
                        address: '789 Elm St, Cityville',
                        bloodGroup: 'O+',
                        allergies: 'Penicillin',
                        emergencyContactName: 'Jane Doe',
                        emergencyContactPhone: '5559876543',
                        registeredHospitalId: 1,
                        registeredHospitalName: 'Global City Hospital',
                        createdAt: '2026-10-01T09:00:00.000Z'
                    },
                    {
                        patientId: 2,
                        uhid: 'UHID-2026-10002',
                        fullName: 'Sarah Connor',
                        dateOfBirth: '1990-11-20',
                        gender: 'Female',
                        phone: '5552345678',
                        email: 'sarah.c@example.com',
                        address: '321 Oak St, Metro City',
                        bloodGroup: 'A-',
                        allergies: 'Sulfa Drugs',
                        emergencyContactName: 'Kyle Reese',
                        emergencyContactPhone: '5558765432',
                        registeredHospitalId: 1,
                        registeredHospitalName: 'Global City Hospital',
                        createdAt: '2026-10-05T14:30:00.000Z'
                    },
                    {
                        patientId: 3,
                        uhid: 'UHID-2026-10003',
                        fullName: 'Robert Chen',
                        dateOfBirth: '1978-03-08',
                        gender: 'Male',
                        phone: '5553456789',
                        email: 'r.chen@example.com',
                        address: '555 Pine Rd, Westside',
                        bloodGroup: 'B+',
                        allergies: 'Dust, Peanuts',
                        emergencyContactName: 'Lisa Chen',
                        emergencyContactPhone: '5557654321',
                        registeredHospitalId: 2,
                        registeredHospitalName: 'Metro Multi-Specialty Hospital',
                        createdAt: '2026-10-08T11:15:00.000Z'
                    }
                ],
                appointments: [
                    {
                        appointmentId: 1,
                        patientId: 1,
                        patientName: 'John Doe',
                        patientUhid: 'UHID-2026-10001',
                        doctorId: 2,
                        doctorName: 'Dr. Emily Carter',
                        hospitalId: 1,
                        hospitalName: 'Global City Hospital',
                        appointmentDatetime: '2026-10-12T10:00',
                        reason: 'Hypertension Quarterly Followup',
                        status: 'SCHEDULED',
                        createdAt: '2026-10-09T08:00:00.000Z'
                    },
                    {
                        appointmentId: 2,
                        patientId: 2,
                        patientName: 'Sarah Connor',
                        patientUhid: 'UHID-2026-10002',
                        doctorId: 2,
                        doctorName: 'Dr. Emily Carter',
                        hospitalId: 1,
                        hospitalName: 'Global City Hospital',
                        appointmentDatetime: '2026-10-10T11:30',
                        reason: 'Chest tightness and shortness of breath',
                        status: 'COMPLETED',
                        createdAt: '2026-10-10T09:00:00.000Z'
                    }
                ],
                visits: [
                    {
                        visitId: 1,
                        patientId: 2,
                        patientName: 'Sarah Connor',
                        patientUhid: 'UHID-2026-10002',
                        doctorId: 2,
                        doctorName: 'Dr. Emily Carter',
                        hospitalId: 1,
                        hospitalName: 'Global City Hospital',
                        appointmentId: 2,
                        visitDate: '2026-10-10T11:30:00.000Z',
                        symptoms: 'Mild chest tightness after physical exercise, anxiety',
                        vitals: 'BP: 135/88 mmHg, Pulse: 78 bpm, Temp: 98.6F, SpO2: 99%',
                        diagnosis: 'Stage 1 Hypertension & Acute Anxiety',
                        notes: 'Advised daily blood pressure tracking and low sodium diet.',
                        prescriptions: [
                            { prescriptionId: 1, medicineName: 'Amlodipine Besylate', dosage: '5 mg', frequency: 'Once daily (Morning)', duration: '30 Days', instructions: 'Take with water after breakfast' },
                            { prescriptionId: 2, medicineName: 'Metoprolol Succinate', dosage: '25 mg', frequency: 'Once daily (Evening)', duration: '30 Days', instructions: 'Do not skip doses' }
                        ],
                        labTests: [
                            { labTestId: 1, testName: 'Electrocardiogram (ECG)', result: 'Normal sinus rhythm. No acute ST-T changes.', status: 'COMPLETED' }
                        ]
                    }
                ],
                auditLogs: [
                    {
                        auditId: 1,
                        userName: 'System Administrator',
                        userRole: 'ADMIN',
                        action: 'SYSTEM_INIT',
                        details: 'Cloud database initialized for Global City Hospital',
                        timestamp: new Date().toISOString(),
                        ipAddress: '127.0.0.1'
                    }
                ]
            };
            this.saveData(initialCloudDb);
        } else {
            // Automatically migrate any existing cached 'City General Hospital' records to 'Global City Hospital'
            try {
                let db = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
                let migrated = false;
                if (db.hospitals) {
                    db.hospitals.forEach(h => {
                        if (h.hospitalId === 1 && (h.name === 'City General Hospital' || !h.name)) {
                            h.name = 'Global City Hospital';
                            migrated = true;
                        }
                    });
                }
                if (db.departments) {
                    db.departments.forEach(d => {
                        if (d.hospitalId === 1 && d.hospitalName === 'City General Hospital') {
                            d.hospitalName = 'Global City Hospital';
                            migrated = true;
                        }
                    });
                }
                if (db.users) {
                    db.users.forEach(u => {
                        if (u.hospitalId === 1 && u.hospitalName === 'City General Hospital') {
                            u.hospitalName = 'Global City Hospital';
                            migrated = true;
                        }
                    });
                }
                if (db.patients) {
                    db.patients.forEach(p => {
                        if (p.registeredHospitalId === 1 && p.registeredHospitalName === 'City General Hospital') {
                            p.registeredHospitalName = 'Global City Hospital';
                            migrated = true;
                        }
                    });
                }
                if (db.appointments) {
                    db.appointments.forEach(a => {
                        if (a.hospitalId === 1 && a.hospitalName === 'City General Hospital') {
                            a.hospitalName = 'Global City Hospital';
                            migrated = true;
                        }
                    });
                }
                if (db.visits) {
                    db.visits.forEach(v => {
                        if (v.hospitalId === 1 && v.hospitalName === 'City General Hospital') {
                            v.hospitalName = 'Global City Hospital';
                            migrated = true;
                        }
                    });
                }
                if (migrated) {
                    this.saveData(db);
                }
            } catch (err) {
                console.error('Migration error:', err);
            }
        }

        // Migrate stored session hospital name if present
        const currentStoredHosp = localStorage.getItem('hprs_hospital_name');
        if (currentStoredHosp === 'City General Hospital' || currentStoredHosp === 'Central Cloud Database' || currentStoredHosp === 'Central Healthcare Network') {
            localStorage.setItem('hprs_hospital_name', 'Global City Hospital');
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

    // Audit Log recorder
    logAudit(action, details) {
        const db = this.getData();
        const userName = localStorage.getItem('hprs_user_name') || 'System User';
        const userRole = localStorage.getItem('hprs_role') || 'GUEST';
        
        db.auditLogs.unshift({
            auditId: db.auditLogs.length + 1,
            userName,
            userRole,
            action,
            details,
            timestamp: new Date().toISOString(),
            ipAddress: '127.0.0.1'
        });
        this.saveData(db);
    },

    // JSON Cloud Backup Export
    exportBackup() {
        const db = this.getData();
        const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hprs_cloud_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // JSON Cloud Backup Import
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

// Initialize Storage on script load
CloudStorage.init();
