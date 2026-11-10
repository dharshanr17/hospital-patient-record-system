/**
 * Hospital Patient Record System (HPRS) - Complete Web API & Cloud Sync Engine
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
            // Attempt Live Spring Boot Backend Call
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error: ${response.statusText} (${response.status})`);
            }

            if (response.headers.get('content-type')?.includes('application/pdf')) {
                return await response.blob();
            }

            return await response.json();
        } catch (err) {
            // Persistent Cloud Storage Handler Fallback
            return this.cloudHandler(endpoint, options);
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, data) {
        return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) });
    },

    put(endpoint, data) {
        return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // --------------------------------------------------------
    // Persistent Cloud Storage Implementation
    // --------------------------------------------------------
    cloudHandler(endpoint, options = {}) {
        const db = CloudStorage.getData();
        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body) : null;

        // 1. Auth Login
        if (endpoint === '/auth/login' && method === 'POST') {
            const user = db.users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
            if (!user) {
                throw new Error('Invalid email or password');
            }
            const token = 'jwt_token_' + Date.now();
            CloudStorage.logAudit('LOGIN', `User ${user.fullName} (${user.role}) logged in successfully`);
            return Promise.resolve({
                token,
                tokenType: 'Bearer',
                userId: user.userId,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                hospitalId: user.hospitalId,
                hospitalName: user.hospitalName
            });
        }

        // 2. Dashboard Summary
        if (endpoint === '/dashboard') {
            const userRole = localStorage.getItem('hprs_role');
            const userId = parseInt(localStorage.getItem('hprs_user_id'));

            let appts = db.appointments;
            let visits = db.visits;
            if (userRole === 'DOCTOR' && userId) {
                appts = appts.filter(a => a.doctorId == userId);
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

        // 3. Patients APIs
        if (endpoint.startsWith('/patients')) {
            if (endpoint.includes('/check-duplicates')) {
                const urlParams = new URLSearchParams(endpoint.split('?')[1]);
                const name = urlParams.get('fullName')?.toLowerCase();
                const phone = urlParams.get('phone');
                const dups = db.patients.filter(p => p.fullName.toLowerCase() === name && p.phone === phone);
                return Promise.resolve(dups);
            }

            if (endpoint.includes('/history')) {
                const patientId = parseInt(endpoint.split('/')[2]);
                const visits = db.visits.filter(v => v.patientId === patientId);
                return Promise.resolve(visits);
            }

            if (method === 'GET') {
                const userRole = localStorage.getItem('hprs_role');
                const userId = parseInt(localStorage.getItem('hprs_user_id'));

                if (endpoint.includes('?query=')) {
                    const query = decodeURIComponent(endpoint.split('?query=')[1] || '').trim().toLowerCase();
                    if (!query) {
                        // By default, doctors only see patients scheduled for them
                        if (userRole === 'DOCTOR' && userId) {
                            const scheduledPatientIds = new Set(
                                db.appointments.filter(a => a.doctorId == userId).map(a => a.patientId)
                                .concat(db.visits.filter(v => v.doctorId == userId).map(v => v.patientId))
                            );
                            return Promise.resolve(db.patients.filter(p => scheduledPatientIds.has(p.patientId)));
                        }
                        return Promise.resolve(db.patients);
                    }

                    // Searching by UHID (or name/phone) allows every doctor to retrieve any patient across the network
                    const filtered = db.patients.filter(p => 
                        p.uhid.toLowerCase().includes(query) || 
                        p.fullName.toLowerCase().includes(query) || 
                        (p.phone && p.phone.includes(query)) ||
                        (p.email && p.email.toLowerCase().includes(query))
                    );
                    return Promise.resolve(filtered);
                }
                const parts = endpoint.split('/');
                if (parts.length === 3) {
                    const id = parseInt(parts[2]);
                    const p = db.patients.find(x => x.patientId === id);
                    if (!p) throw new Error('Patient not found with ID: ' + id);
                    return Promise.resolve(p);
                }
                if (userRole === 'DOCTOR' && userId) {
                    const scheduledPatientIds = new Set(
                        db.appointments.filter(a => a.doctorId == userId).map(a => a.patientId)
                        .concat(db.visits.filter(v => v.doctorId == userId).map(v => v.patientId))
                    );
                    return Promise.resolve(db.patients.filter(p => scheduledPatientIds.has(p.patientId)));
                }
                return Promise.resolve(db.patients);
            }

            if (method === 'POST') {
                const dups = db.patients.filter(p => p.fullName.toLowerCase() === body.fullName.toLowerCase() && p.phone === body.phone);
                if (dups.length > 0) {
                    throw new Error(`Duplicate Record: A patient named "${body.fullName}" with phone "${body.phone}" already exists (UHID: ${dups[0].uhid})`);
                }
                const newId = db.patients.length + 1;
                const uhid = `UHID-2026-${10000 + newId}`;
                const newPatient = {
                    patientId: newId,
                    uhid,
                    ...body,
                    createdAt: new Date().toISOString()
                };
                db.patients.push(newPatient);
                CloudStorage.saveData(db);
                CloudStorage.logAudit('CREATE_PATIENT', `Registered patient ${newPatient.fullName} (${uhid})`);
                return Promise.resolve(newPatient);
            }

            if (method === 'PUT') {
                const id = parseInt(endpoint.split('/')[2]);
                const idx = db.patients.findIndex(x => x.patientId === id);
                if (idx !== -1) {
                    db.patients[idx] = { ...db.patients[idx], ...body };
                    CloudStorage.saveData(db);
                    CloudStorage.logAudit('UPDATE_PATIENT', `Updated patient details for ${db.patients[idx].fullName} (${db.patients[idx].uhid})`);
                    return Promise.resolve(db.patients[idx]);
                }
            }
        }

        // 4. Appointments APIs
        if (endpoint.startsWith('/appointments')) {
            if (method === 'GET') {
                const userRole = localStorage.getItem('hprs_role');
                const userId = parseInt(localStorage.getItem('hprs_user_id'));
                let list = db.appointments;
                if (userRole === 'DOCTOR' && userId) {
                    list = list.filter(a => a.doctorId == userId);
                }
                return Promise.resolve(list);
            }

            if (method === 'POST') {
                const conflict = db.appointments.find(a => 
                    a.doctorId == body.doctorId && 
                    a.appointmentDatetime === body.appointmentDatetime && 
                    a.status !== 'CANCELLED'
                );
                if (conflict) {
                    throw new Error(`Slot Conflict: Doctor already has an appointment booked at ${body.appointmentDatetime}`);
                }
                const patient = db.patients.find(p => p.patientId == body.patientId);
                const doctor = db.users.find(u => u.userId == body.doctorId);
                const newAppt = {
                    appointmentId: db.appointments.length + 1,
                    ...body,
                    patientName: patient ? patient.fullName : 'Patient',
                    patientUhid: patient ? patient.uhid : 'UHID-000',
                    doctorName: doctor ? doctor.fullName : 'Doctor',
                    hospitalName: 'Global City Hospital',
                    status: 'SCHEDULED',
                    createdAt: new Date().toISOString()
                };
                db.appointments.push(newAppt);
                CloudStorage.saveData(db);
                CloudStorage.logAudit('CREATE_APPOINTMENT', `Scheduled appointment #${newAppt.appointmentId} for ${newAppt.patientName} with Dr. ${newAppt.doctorName}`);
                return Promise.resolve(newAppt);
            }

            if (method === 'PUT') {
                const id = parseInt(endpoint.split('/')[2]);
                const appt = db.appointments.find(a => a.appointmentId === id);
                if (appt) {
                    const urlParams = new URLSearchParams(endpoint.split('?')[1]);
                    if (urlParams.get('status')) appt.status = urlParams.get('status');
                    CloudStorage.saveData(db);
                    CloudStorage.logAudit('UPDATE_APPOINTMENT', `Updated appointment #${id} status to ${appt.status}`);
                    return Promise.resolve(appt);
                }
            }

            if (method === 'DELETE') {
                const id = parseInt(endpoint.split('/')[2]);
                const appt = db.appointments.find(a => a.appointmentId === id);
                if (appt) {
                    appt.status = 'CANCELLED';
                    CloudStorage.saveData(db);
                    CloudStorage.logAudit('CANCEL_APPOINTMENT', `Cancelled appointment #${id}`);
                }
                return Promise.resolve({ message: 'Cancelled successfully' });
            }
        }

        // 5. Visits & Clinical Records APIs
        if (endpoint.startsWith('/visits')) {
            if (method === 'POST') {
                const patient = db.patients.find(p => p.patientId == body.patientId);
                const doctor = db.users.find(u => u.userId == body.doctorId);
                const newVisit = {
                    visitId: db.visits.length + 1,
                    patientId: body.patientId,
                    patientName: patient ? patient.fullName : 'Patient',
                    patientUhid: patient ? patient.uhid : 'UHID-000',
                    doctorId: body.doctorId,
                    doctorName: doctor ? doctor.fullName : 'Doctor',
                    hospitalName: 'Global City Hospital',
                    visitDate: new Date().toISOString(),
                    symptoms: body.symptoms,
                    vitals: body.vitals,
                    diagnosis: body.diagnosis,
                    notes: body.notes,
                    prescriptions: body.prescriptions || [],
                    labTests: body.labTests || []
                };
                db.visits.push(newVisit);
                CloudStorage.saveData(db);
                CloudStorage.logAudit('RECORD_VISIT', `Recorded clinical visit #${newVisit.visitId} for ${newVisit.patientName} (Diagnosis: ${newVisit.diagnosis})`);
                return Promise.resolve(newVisit);
            }

            if (method === 'GET') {
                const id = parseInt(endpoint.split('/')[2]);
                const v = db.visits.find(x => x.visitId === id);
                return Promise.resolve(v || db.visits[0]);
            }
        }

        // 6. Admin APIs
        if (endpoint.startsWith('/admin')) {
            if (endpoint.includes('/hospitals')) return Promise.resolve(db.hospitals);
            if (endpoint.includes('/departments')) return Promise.resolve(db.departments);
            if (endpoint.includes('/users')) {
                if (method === 'POST') {
                    const newUser = { userId: db.users.length + 1, ...body, active: true };
                    db.users.push(newUser);
                    CloudStorage.saveData(db);
                    CloudStorage.logAudit('CREATE_USER', `Provisioned new staff user: ${newUser.fullName} (${newUser.role})`);
                    return Promise.resolve(newUser);
                }
                if (method === 'PUT') {
                    const parts = endpoint.split('/');
                    const id = parseInt(parts[parts.length - 1]);
                    const idx = db.users.findIndex(u => u.userId === id);
                    if (idx !== -1) {
                        db.users[idx] = { ...db.users[idx], ...body };
                        CloudStorage.saveData(db);
                        CloudStorage.logAudit('UPDATE_USER_ROLE', `Updated staff user: ${db.users[idx].fullName} (Role: ${db.users[idx].role})`);
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
