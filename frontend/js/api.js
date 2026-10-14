/**
 * Hospital Patient Record System (HPRS) - Complete Web API & Cloud Sync Engine
 * 
 * Priority order:
 *   1. Spring Boot live backend (if running)
 *   2. Firebase Firestore (if configured) → real cross-device sync
 *   3. localStorage fallback (single-device only)
 */

const API_BASE_URL = (window.location.origin.startsWith('http') && !window.location.origin.includes('file') && !window.location.origin.includes('8080'))
    ? '/api' 
    : 'http://localhost:8080/api';

const API = {

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('hprs_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };

        try {
            // ── Priority 1: Live Spring Boot Backend ─────────────────────
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error: ${response.statusText} (${response.status})`);
            }
            if (response.headers.get('content-type')?.includes('application/pdf')) {
                return await response.blob();
            }
            return await response.json();
        } catch (err) {
            // ── Priority 2 & 3: Firestore or localStorage fallback ───────
            return this.cloudHandler(endpoint, options);
        }
    },

    get(endpoint)         { return this.request(endpoint, { method: 'GET' }); },
    post(endpoint, data)  { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); },
    put(endpoint, data)   { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }); },
    delete(endpoint)      { return this.request(endpoint, { method: 'DELETE' }); },

    // ================================================================
    // Cloud Handler: Firestore (cross-device) or localStorage (local)
    // ================================================================
    async cloudHandler(endpoint, options = {}) {
        // Route to Firestore if configured and ready
        if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isReady) {
            return this._firestoreHandler(endpoint, options);
        }
        // Fall back to localStorage
        return this._localStorageHandler(endpoint, options);
    },

    // ================================================================
    // FIRESTORE HANDLER — real cross-device data, real-time sync
    // ================================================================
    async _firestoreHandler(endpoint, options = {}) {
        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body) : null;
        const FS = FirebaseSync;

        // ── Auth Login ────────────────────────────────────────────────
        if (endpoint === '/auth/login' && method === 'POST') {
            const users = await FS.getCollection('users');
            const user = users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
            if (!user) throw new Error('Invalid email or password');
            const token = 'jwt_token_' + Date.now();
            return {
                token, tokenType: 'Bearer',
                userId: user.userId, fullName: user.fullName,
                email: user.email, role: user.role,
                hospitalId: user.hospitalId, hospitalName: user.hospitalName
            };
        }

        // ── Dashboard ─────────────────────────────────────────────────
        if (endpoint === '/dashboard') {
            const userRole = localStorage.getItem('hprs_role');
            const userId = parseInt(localStorage.getItem('hprs_user_id'));
            let [patients, appts, visits, users] = await Promise.all([
                FS.getCollection('patients'),
                FS.getCollection('appointments'),
                FS.getCollection('visits'),
                FS.getCollection('users')
            ]);
            if (userRole === 'DOCTOR' && userId) {
                appts  = appts.filter(a => a.doctorId == userId);
                visits = visits.filter(v => v.doctorId == userId);
            }
            return {
                totalPatients: userRole === 'DOCTOR' && userId
                    ? new Set([...appts.map(a => a.patientId), ...visits.map(v => v.patientId)]).size
                    : patients.length,
                appointmentsToday: appts.filter(a => a.status === 'SCHEDULED').length,
                totalVisits: visits.length,
                totalDoctors: users.filter(u => u.role === 'DOCTOR').length,
                recentAppointments: appts.slice(-5).reverse(),
                recentVisits: visits.slice(-5).reverse()
            };
        }

        // ── Patients ──────────────────────────────────────────────────
        if (endpoint.startsWith('/patients')) {
            // GET patient visit history
            if (endpoint.includes('/history')) {
                const identifier = endpoint.split('/')[2];
                const id = parseInt(identifier, 10);
                const allVisits = await FS.getCollection('visits');
                if (!isNaN(id)) {
                    return allVisits.filter(v => v.patientId == id)
                                    .sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));
                }
                // UHID lookup
                return allVisits.filter(v => v.patientUhid && v.patientUhid.toLowerCase() === identifier.toLowerCase())
                                .sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));
            }

            // Duplicate check
            if (endpoint.includes('/check-duplicates')) {
                const urlParams = new URLSearchParams(endpoint.split('?')[1]);
                const name  = urlParams.get('fullName')?.toLowerCase();
                const phone = urlParams.get('phone');
                const patients = await FS.getCollection('patients');
                return patients.filter(p => p.fullName.toLowerCase() === name && p.phone === phone);
            }

            if (method === 'GET') {
                const userRole = localStorage.getItem('hprs_role');
                const userId   = parseInt(localStorage.getItem('hprs_user_id'));

                // Search by query
                if (endpoint.includes('?query=')) {
                    const q = decodeURIComponent(endpoint.split('?query=')[1] || '').trim().toLowerCase();
                    const patients = await FS.getCollection('patients');
                    if (!q) {
                        if (userRole === 'DOCTOR' && userId) {
                            const [appts, visits] = await Promise.all([
                                FS.getCollection('appointments'),
                                FS.getCollection('visits')
                            ]);
                            const ids = new Set([
                                ...appts.filter(a => a.doctorId == userId).map(a => a.patientId),
                                ...visits.filter(v => v.doctorId == userId).map(v => v.patientId)
                            ]);
                            return patients.filter(p => ids.has(p.patientId));
                        }
                        return patients;
                    }
                    return patients.filter(p =>
                        (p.uhid  && p.uhid.toLowerCase().includes(q)) ||
                        (p.fullName && p.fullName.toLowerCase().includes(q)) ||
                        (p.phone && p.phone.includes(q)) ||
                        (p.email && p.email.toLowerCase().includes(q))
                    );
                }

                // Get by ID or UHID
                const parts = endpoint.split('/');
                if (parts.length === 3) {
                    const identifier = parts[2];
                    const id = parseInt(identifier, 10);
                    const patients = await FS.getCollection('patients');
                    const found = !isNaN(id)
                        ? patients.find(p => p.patientId === id)
                        : patients.find(p => p.uhid && p.uhid.toLowerCase() === identifier.toLowerCase());
                    if (!found) throw new Error(`Patient not found: ${identifier}`);
                    return found;
                }

                // Default list
                const patients = await FS.getCollection('patients');
                if (userRole === 'DOCTOR' && userId) {
                    const [appts, visits] = await Promise.all([
                        FS.getCollection('appointments'),
                        FS.getCollection('visits')
                    ]);
                    const ids = new Set([
                        ...appts.filter(a => a.doctorId == userId).map(a => a.patientId),
                        ...visits.filter(v => v.doctorId == userId).map(v => v.patientId)
                    ]);
                    return patients.filter(p => ids.has(p.patientId));
                }
                return patients;
            }

            if (method === 'POST') {
                const patients = await FS.getCollection('patients');
                const dup = patients.find(p =>
                    p.fullName.toLowerCase() === body.fullName.toLowerCase() && p.phone === body.phone
                );
                if (dup) throw new Error(`Duplicate: "${body.fullName}" with phone "${body.phone}" already exists (UHID: ${dup.uhid})`);

                const newId = patients.reduce((max, p) => Math.max(max, p.patientId || 0), 0) + 1;
                const uhid  = `UHID-${new Date().getFullYear()}-${10000 + newId}`;
                const newPatient = { patientId: newId, uhid, ...body, createdAt: new Date().toISOString() };
                await FS.setDocument('patients', String(newId), newPatient);
                return newPatient;
            }

            if (method === 'PUT') {
                const id = parseInt(endpoint.split('/')[2]);
                const patients = await FS.getCollection('patients');
                const existing = patients.find(p => p.patientId === id);
                if (!existing) throw new Error('Patient not found: ' + id);
                const updated = { ...existing, ...body };
                await FS.setDocument('patients', String(id), updated);
                return updated;
            }
        }

        // ── Appointments ──────────────────────────────────────────────
        if (endpoint.startsWith('/appointments')) {
            const userRole = localStorage.getItem('hprs_role');
            const userId   = parseInt(localStorage.getItem('hprs_user_id'));

            if (method === 'GET') {
                const appts = await FS.getCollection('appointments');
                if (userRole === 'DOCTOR' && userId) {
                    return appts.filter(a => a.doctorId == userId);
                }
                return appts;
            }

            if (method === 'POST') {
                const [patients, users, appts] = await Promise.all([
                    FS.getCollection('patients'),
                    FS.getCollection('users'),
                    FS.getCollection('appointments')
                ]);
                const conflict = appts.find(a =>
                    a.doctorId == body.doctorId &&
                    a.appointmentDatetime === body.appointmentDatetime &&
                    a.status !== 'CANCELLED'
                );
                if (conflict) throw new Error(`Slot Conflict: Doctor already booked at ${body.appointmentDatetime}`);

                const patient  = patients.find(p => p.patientId == body.patientId);
                const doctor   = users.find(u => u.userId == body.doctorId);
                const hospName = localStorage.getItem('hprs_hospital_name') || 'Global City Hospital';
                const newId    = appts.reduce((max, a) => Math.max(max, a.appointmentId || 0), 0) + 1;
                const newAppt  = {
                    appointmentId: newId, ...body,
                    patientName: patient ? patient.fullName : 'Patient',
                    patientUhid: patient ? patient.uhid : 'UHID-000',
                    doctorName:  doctor  ? doctor.fullName  : 'Doctor',
                    hospitalName: hospName,
                    status: 'SCHEDULED',
                    createdAt: new Date().toISOString()
                };
                await FS.setDocument('appointments', String(newId), newAppt);
                return newAppt;
            }

            if (method === 'PUT') {
                const id = parseInt(endpoint.split('/')[2]);
                const appts = await FS.getCollection('appointments');
                const appt  = appts.find(a => a.appointmentId === id);
                if (!appt) throw new Error('Appointment not found');
                const urlParams = new URLSearchParams(endpoint.split('?')[1]);
                if (urlParams.get('status')) appt.status = urlParams.get('status');
                await FS.setDocument('appointments', String(id), appt);
                return appt;
            }

            if (method === 'DELETE') {
                const id = parseInt(endpoint.split('/')[2]);
                const appts = await FS.getCollection('appointments');
                const appt  = appts.find(a => a.appointmentId === id);
                if (appt) {
                    appt.status = 'CANCELLED';
                    await FS.setDocument('appointments', String(id), appt);
                }
                return { message: 'Cancelled successfully' };
            }
        }

        // ── Clinical Visits ───────────────────────────────────────────
        if (endpoint.startsWith('/visits')) {
            if (method === 'POST') {
                const [patients, users, visits] = await Promise.all([
                    FS.getCollection('patients'),
                    FS.getCollection('users'),
                    FS.getCollection('visits')
                ]);
                const patient   = patients.find(p => p.patientId == body.patientId);
                const doctor    = users.find(u => u.userId == body.doctorId);
                const hospName  = localStorage.getItem('hprs_hospital_name') || (doctor ? doctor.hospitalName : 'Global City Hospital');
                const hospId    = parseInt(localStorage.getItem('hprs_hospital_id')) || (doctor ? doctor.hospitalId : 1);
                const newId     = visits.reduce((max, v) => Math.max(max, typeof v.visitId === 'number' ? v.visitId : 0), 0) + 1;
                const newVisit  = {
                    visitId: newId,
                    patientId:    body.patientId,
                    patientName:  patient ? patient.fullName : 'Patient',
                    patientUhid:  patient ? patient.uhid     : 'UHID-000',
                    doctorId:     body.doctorId,
                    doctorName:   doctor  ? doctor.fullName  : 'Doctor',
                    hospitalId:   hospId,
                    hospitalName: hospName,
                    visitDate:    new Date().toISOString(),
                    symptoms:     body.symptoms,
                    vitals:       body.vitals,
                    diagnosis:    body.diagnosis,
                    notes:        body.notes,
                    prescriptions: body.prescriptions || [],
                    labTests:      body.labTests      || [],
                    createdAt:     new Date().toISOString()
                };
                await FS.setDocument('visits', String(newId), newVisit);
                return newVisit;
            }

            if (method === 'GET') {
                const id = parseInt(endpoint.split('/')[2]);
                const visits = await FS.getCollection('visits');
                return visits.find(v => v.visitId === id) || visits[0] || null;
            }
        }

        // ── Admin APIs ────────────────────────────────────────────────
        if (endpoint.startsWith('/admin')) {
            if (endpoint.includes('/hospitals')) return FS.getCollection('hospitals');
            if (endpoint.includes('/departments')) return FS.getCollection('departments');
            if (endpoint.includes('/users')) {
                if (method === 'POST') {
                    const users = await FS.getCollection('users');
                    const newId = users.reduce((max, u) => Math.max(max, u.userId || 0), 0) + 1;
                    const newUser = { userId: newId, ...body, active: true };
                    await FS.setDocument('users', String(newId), newUser);
                    return newUser;
                }
                if (method === 'PUT') {
                    const parts = endpoint.split('/');
                    const id = parseInt(parts[parts.length - 1]);
                    const users = await FS.getCollection('users');
                    const existing = users.find(u => u.userId === id);
                    if (existing) {
                        const updated = { ...existing, ...body };
                        await FS.setDocument('users', String(id), updated);
                        return updated;
                    }
                }
                return FS.getCollection('users');
            }
            if (endpoint.includes('/audit-logs')) return FS.getCollection('auditLogs') || [];
        }

        return [];
    },

    // ================================================================
    // LOCALSTORAGE HANDLER — single-device fallback (unchanged logic)
    // ================================================================
    _localStorageHandler(endpoint, options = {}) {
        const db     = CloudStorage.getData();
        const method = options.method || 'GET';
        const body   = options.body ? JSON.parse(options.body) : null;

        // 1. Auth Login
        if (endpoint === '/auth/login' && method === 'POST') {
            const user = db.users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
            if (!user) throw new Error('Invalid email or password');
            const token = 'jwt_token_' + Date.now();
            CloudStorage.logAudit('LOGIN', `User ${user.fullName} (${user.role}) logged in successfully`);
            return Promise.resolve({
                token, tokenType: 'Bearer',
                userId: user.userId, fullName: user.fullName,
                email: user.email, role: user.role,
                hospitalId: user.hospitalId, hospitalName: user.hospitalName
            });
        }

        // 2. Dashboard
        if (endpoint === '/dashboard') {
            const userRole = localStorage.getItem('hprs_role');
            const userId   = parseInt(localStorage.getItem('hprs_user_id'));
            let appts  = db.appointments;
            let visits = db.visits;
            if (userRole === 'DOCTOR' && userId) {
                appts  = appts.filter(a => a.doctorId == userId);
                visits = visits.filter(v => v.doctorId == userId);
            }
            return Promise.resolve({
                totalPatients: userRole === 'DOCTOR' && userId
                    ? new Set(appts.map(a => a.patientId).concat(visits.map(v => v.patientId))).size
                    : db.patients.length,
                appointmentsToday: appts.filter(a => a.status === 'SCHEDULED').length,
                totalVisits: visits.length,
                totalDoctors: db.users.filter(u => u.role === 'DOCTOR').length,
                recentAppointments: appts.slice(-5).reverse(),
                recentVisits: visits.slice(-5).reverse()
            });
        }

        // 3. Patients
        if (endpoint.startsWith('/patients')) {
            if (endpoint.includes('/check-duplicates')) {
                const urlParams = new URLSearchParams(endpoint.split('?')[1]);
                const name  = urlParams.get('fullName')?.toLowerCase();
                const phone = urlParams.get('phone');
                return Promise.resolve(db.patients.filter(p => p.fullName.toLowerCase() === name && p.phone === phone));
            }

            if (endpoint.includes('/history')) {
                const identifier = endpoint.split('/')[2];
                const id = parseInt(identifier, 10);
                if (!isNaN(id)) {
                    return Promise.resolve(db.visits.filter(v => v.patientId === id));
                }
                return Promise.resolve(db.visits.filter(v => v.patientUhid && v.patientUhid.toLowerCase() === identifier.toLowerCase()));
            }

            if (method === 'GET') {
                const userRole = localStorage.getItem('hprs_role');
                const userId   = parseInt(localStorage.getItem('hprs_user_id'));

                if (endpoint.includes('?query=')) {
                    const q = decodeURIComponent(endpoint.split('?query=')[1] || '').trim().toLowerCase();
                    if (!q) {
                        if (userRole === 'DOCTOR' && userId) {
                            const ids = new Set(
                                db.appointments.filter(a => a.doctorId == userId).map(a => a.patientId)
                                .concat(db.visits.filter(v => v.doctorId == userId).map(v => v.patientId))
                            );
                            return Promise.resolve(db.patients.filter(p => ids.has(p.patientId)));
                        }
                        return Promise.resolve(db.patients);
                    }
                    return Promise.resolve(db.patients.filter(p =>
                        p.uhid.toLowerCase().includes(q) ||
                        p.fullName.toLowerCase().includes(q) ||
                        (p.phone && p.phone.includes(q)) ||
                        (p.email && p.email.toLowerCase().includes(q))
                    ));
                }

                const parts = endpoint.split('/');
                if (parts.length === 3) {
                    const identifier = parts[2];
                    const id = parseInt(identifier, 10);
                    const p = !isNaN(id)
                        ? db.patients.find(x => x.patientId === id)
                        : db.patients.find(x => x.uhid.toLowerCase() === identifier.toLowerCase());
                    if (!p) throw new Error('Patient not found: ' + identifier);
                    return Promise.resolve(p);
                }

                if (userRole === 'DOCTOR' && userId) {
                    const ids = new Set(
                        db.appointments.filter(a => a.doctorId == userId).map(a => a.patientId)
                        .concat(db.visits.filter(v => v.doctorId == userId).map(v => v.patientId))
                    );
                    return Promise.resolve(db.patients.filter(p => ids.has(p.patientId)));
                }
                return Promise.resolve(db.patients);
            }

            if (method === 'POST') {
                const dup = db.patients.find(p =>
                    p.fullName.toLowerCase() === body.fullName.toLowerCase() && p.phone === body.phone
                );
                if (dup) throw new Error(`Duplicate: "${body.fullName}" already exists (UHID: ${dup.uhid})`);
                const newId = db.patients.length + 1;
                const uhid  = `UHID-${new Date().getFullYear()}-${10000 + newId}`;
                const newPatient = { patientId: newId, uhid, ...body, createdAt: new Date().toISOString() };
                db.patients.push(newPatient);
                CloudStorage.saveData(db);
                CloudStorage.logAudit('CREATE_PATIENT', `Registered ${newPatient.fullName} (${uhid})`);
                return Promise.resolve(newPatient);
            }

            if (method === 'PUT') {
                const id  = parseInt(endpoint.split('/')[2]);
                const idx = db.patients.findIndex(x => x.patientId === id);
                if (idx !== -1) {
                    db.patients[idx] = { ...db.patients[idx], ...body };
                    CloudStorage.saveData(db);
                    CloudStorage.logAudit('UPDATE_PATIENT', `Updated ${db.patients[idx].fullName} (${db.patients[idx].uhid})`);
                    return Promise.resolve(db.patients[idx]);
                }
            }
        }

        // 4. Appointments
        if (endpoint.startsWith('/appointments')) {
            const userRole = localStorage.getItem('hprs_role');
            const userId   = parseInt(localStorage.getItem('hprs_user_id'));
            if (method === 'GET') {
                let list = db.appointments;
                if (userRole === 'DOCTOR' && userId) list = list.filter(a => a.doctorId == userId);
                return Promise.resolve(list);
            }
            if (method === 'POST') {
                const conflict = db.appointments.find(a =>
                    a.doctorId == body.doctorId &&
                    a.appointmentDatetime === body.appointmentDatetime &&
                    a.status !== 'CANCELLED'
                );
                if (conflict) throw new Error(`Slot Conflict: Doctor already booked at ${body.appointmentDatetime}`);
                const patient  = db.patients.find(p => p.patientId == body.patientId);
                const doctor   = db.users.find(u => u.userId == body.doctorId);
                const hospName = localStorage.getItem('hprs_hospital_name') || 'Global City Hospital';
                const newAppt  = {
                    appointmentId: db.appointments.length + 1,
                    ...body,
                    patientName:  patient ? patient.fullName : 'Patient',
                    patientUhid:  patient ? patient.uhid     : 'UHID-000',
                    doctorName:   doctor  ? doctor.fullName  : 'Doctor',
                    hospitalName: hospName,
                    status: 'SCHEDULED',
                    createdAt: new Date().toISOString()
                };
                db.appointments.push(newAppt);
                CloudStorage.saveData(db);
                CloudStorage.logAudit('CREATE_APPOINTMENT', `Scheduled appointment #${newAppt.appointmentId}`);
                return Promise.resolve(newAppt);
            }
            if (method === 'PUT') {
                const id   = parseInt(endpoint.split('/')[2]);
                const appt = db.appointments.find(a => a.appointmentId === id);
                if (appt) {
                    const urlParams = new URLSearchParams(endpoint.split('?')[1]);
                    if (urlParams.get('status')) appt.status = urlParams.get('status');
                    CloudStorage.saveData(db);
                    return Promise.resolve(appt);
                }
            }
            if (method === 'DELETE') {
                const id   = parseInt(endpoint.split('/')[2]);
                const appt = db.appointments.find(a => a.appointmentId === id);
                if (appt) { appt.status = 'CANCELLED'; CloudStorage.saveData(db); }
                return Promise.resolve({ message: 'Cancelled successfully' });
            }
        }

        // 5. Visits
        if (endpoint.startsWith('/visits')) {
            if (method === 'POST') {
                const patient  = db.patients.find(p => p.patientId == body.patientId);
                const doctor   = db.users.find(u => u.userId == body.doctorId);
                const hospName = localStorage.getItem('hprs_hospital_name') || (doctor ? doctor.hospitalName : 'Global City Hospital');
                const hospId   = parseInt(localStorage.getItem('hprs_hospital_id')) || (doctor ? doctor.hospitalId : 1);
                const newVisit = {
                    visitId: db.visits.length + 1,
                    patientId:    body.patientId,
                    patientName:  patient ? patient.fullName : 'Patient',
                    patientUhid:  patient ? patient.uhid     : 'UHID-000',
                    doctorId:     body.doctorId,
                    doctorName:   doctor  ? doctor.fullName  : 'Doctor',
                    hospitalId:   hospId,
                    hospitalName: hospName,
                    visitDate:    new Date().toISOString(),
                    symptoms:     body.symptoms,
                    vitals:       body.vitals,
                    diagnosis:    body.diagnosis,
                    notes:        body.notes,
                    prescriptions: body.prescriptions || [],
                    labTests:      body.labTests      || []
                };
                db.visits.push(newVisit);
                CloudStorage.saveData(db);
                CloudStorage.logAudit('RECORD_VISIT', `Visit #${newVisit.visitId} for ${newVisit.patientName}`);
                return Promise.resolve(newVisit);
            }
            if (method === 'GET') {
                const id = parseInt(endpoint.split('/')[2]);
                const v  = db.visits.find(x => x.visitId === id);
                return Promise.resolve(v || db.visits[0]);
            }
        }

        // 6. Admin
        if (endpoint.startsWith('/admin')) {
            if (endpoint.includes('/hospitals'))    return Promise.resolve(db.hospitals);
            if (endpoint.includes('/departments'))  return Promise.resolve(db.departments);
            if (endpoint.includes('/users')) {
                if (method === 'POST') {
                    const newUser = { userId: db.users.length + 1, ...body, active: true };
                    db.users.push(newUser);
                    CloudStorage.saveData(db);
                    return Promise.resolve(newUser);
                }
                if (method === 'PUT') {
                    const parts = endpoint.split('/');
                    const id    = parseInt(parts[parts.length - 1]);
                    const idx   = db.users.findIndex(u => u.userId === id);
                    if (idx !== -1) {
                        db.users[idx] = { ...db.users[idx], ...body };
                        CloudStorage.saveData(db);
                        return Promise.resolve(db.users[idx]);
                    }
                }
                return Promise.resolve(db.users);
            }
            if (endpoint.includes('/audit-logs')) return Promise.resolve(db.auditLogs);
        }

        return Promise.resolve([]);
    }
};
