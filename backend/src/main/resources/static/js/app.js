/**
 * Hospital Patient Record System (HPRS) - Main Page Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
    const page = document.body.dataset.page;
    if (page && page !== 'login') {
        Auth.renderNavbar(page);
    }

    switch (page) {
        case 'login':
            initLoginPage();
            break;
        case 'dashboard':
            initDashboardPage();
            break;
        case 'patients':
            initPatientsPage();
            break;
        case 'patient-profile':
            initPatientProfilePage();
            break;
        case 'appointments':
            initAppointmentsPage();
            break;
        case 'visit':
            initVisitPage();
            break;
        case 'reports':
            initReportsPage();
            break;
        case 'admin':
            initAdminPage();
            break;
    }
});

/* -------------------------------------------------------------
 * 1. Login Page
 * ------------------------------------------------------------- */
function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    const alertBox = document.getElementById('login-alert');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            alertBox.classList.add('d-none');
            const response = await API.post('/auth/login', { email, password });
            Auth.setSession(response);
            window.location.href = 'dashboard.html';
        } catch (err) {
            alertBox.textContent = err.message || 'Invalid login credentials';
            alertBox.classList.remove('d-none');
        }
    });

    // Quick Login Preset Buttons
    window.quickLogin = function(role) {
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');

        switch(role) {
            case 'admin': emailInput.value = 'admin@hprs.com'; break;
            case 'doctor': emailInput.value = 'doctor@hprs.com'; break;
            case 'receptionist': emailInput.value = 'receptionist@hprs.com'; break;
            case 'nurse': emailInput.value = 'nurse@hprs.com'; break;
        }
        passInput.value = 'Password123!';
    };
}

/* -------------------------------------------------------------
 * 2. Dashboard Page
 * ------------------------------------------------------------- */
async function initDashboardPage() {
    try {
        const isDoctor = Auth.getRole() === 'DOCTOR';
        if (isDoctor) {
            const userName = localStorage.getItem('hprs_user_name') || 'Doctor';
            const pageTitle = document.querySelector('h2.mb-1');
            if (pageTitle) pageTitle.textContent = `Doctor Clinical Portal (${userName.startsWith('Dr.') ? userName : 'Dr. ' + userName})`;
            const pageSub = document.querySelector('h2.mb-1 + p');
            if (pageSub) pageSub.textContent = 'Personal consultation queue, assigned patient records, and appointments.';

            const patientCardLabel = document.querySelector('#stat-total-patients')?.previousElementSibling;
            if (patientCardLabel) patientCardLabel.textContent = 'My Assigned Patients';

            const apptCardLabel = document.querySelector('#stat-today-appointments')?.previousElementSibling;
            if (apptCardLabel) apptCardLabel.textContent = 'My Appointments Today';

            const visitCardLabel = document.querySelector('#stat-total-visits')?.previousElementSibling;
            if (visitCardLabel) visitCardLabel.textContent = 'My Logged Visits';

            const apptHeading = document.querySelector('#recent-appointments-tbody')?.closest('.card')?.querySelector('h5');
            if (apptHeading) apptHeading.innerHTML = `<i class="bi bi-calendar-event me-2 text-primary"></i>My Scheduled Consultation Queue`;
        }

        const data = await API.get('/dashboard');
        
        document.getElementById('stat-total-patients').textContent = data.totalPatients || 0;
        document.getElementById('stat-today-appointments').textContent = data.appointmentsToday || 0;
        document.getElementById('stat-total-visits').textContent = data.totalVisits || 0;
        document.getElementById('stat-total-doctors').textContent = data.totalDoctors || 0;

        // Render Recent Appointments Table
        const apptTbody = document.getElementById('recent-appointments-tbody');
        if (apptTbody && data.recentAppointments) {
            apptTbody.innerHTML = data.recentAppointments.map(a => `
                <tr>
                    <td><span class="fw-semibold text-primary">${a.patientUhid || 'N/A'}</span></td>
                    <td class="fw-bold">${a.patientName}</td>
                    <td>Dr. ${a.doctorName}</td>
                    <td>${new Date(a.appointmentDatetime).toLocaleString()}</td>
                    <td><span class="badge badge-status badge-${(a.status || 'scheduled').toLowerCase()}">${a.status}</span></td>
                </tr>
            `).join('') || `<tr><td colspan="5" class="text-center text-muted py-3">No appointments scheduled for you</td></tr>`;
        }

        // Render Recent Visits Table
        const visitTbody = document.getElementById('recent-visits-tbody');
        if (visitTbody && data.recentVisits) {
            visitTbody.innerHTML = data.recentVisits.map(v => `
                <tr>
                    <td><span class="fw-semibold text-primary">${v.patientUhid || 'N/A'}</span></td>
                    <td class="fw-bold">${v.patientName}</td>
                    <td>Dr. ${v.doctorName}</td>
                    <td><span class="badge bg-info-subtle text-info fw-semibold">${v.diagnosis || 'General Visit'}</span></td>
                    <td>${new Date(v.visitDate).toLocaleDateString()}</td>
                </tr>
            `).join('') || `<tr><td colspan="5" class="text-center text-muted py-3">No recent visit logs</td></tr>`;
        }
    } catch (err) {
        console.error('Failed to load dashboard data:', err);
    }
}

/* -------------------------------------------------------------
 * 3. Patients Page (Search, Register & Duplicate Check)
 * ------------------------------------------------------------- */
async function initPatientsPage() {
    const searchInput = document.getElementById('patient-search-input');
    const registerForm = document.getElementById('register-patient-form');
    const alertBox = document.getElementById('patient-alert');
    const isDoctor = Auth.getRole() === 'DOCTOR';
    const doctorQueueBanner = document.getElementById('doctor-queue-banner');
    const doctorQueueName = document.getElementById('doctor-queue-name');
    const heading = document.getElementById('patient-directory-heading');
    const sub = document.getElementById('patient-directory-sub');

    if (isDoctor) {
        if (doctorQueueBanner) doctorQueueBanner.classList.remove('d-none');
        const docName = localStorage.getItem('hprs_user_name') || 'Doctor';
        if (doctorQueueName) doctorQueueName.textContent = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`;
        if (heading) heading.textContent = 'Doctor Scheduled Patient Roster';
        if (sub) sub.textContent = 'Showing patients scheduled for your consultation. Enter any UHID in the search bar to retrieve patient records across all hospitals.';
    }

    loadPatients('');

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => loadPatients(e.target.value), 300);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            alertBox.classList.add('d-none');

            const payload = {
                fullName: document.getElementById('fullName').value.trim(),
                dateOfBirth: document.getElementById('dateOfBirth').value,
                gender: document.getElementById('gender').value,
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                bloodGroup: document.getElementById('bloodGroup').value,
                allergies: document.getElementById('allergies').value.trim(),
                address: document.getElementById('address').value.trim(),
                emergencyContactName: document.getElementById('emergencyContactName').value.trim(),
                emergencyContactPhone: document.getElementById('emergencyContactPhone').value.trim(),
                registeredHospitalId: parseInt(document.getElementById('hospitalId').value) || 1
            };

            try {
                const newPatient = await API.post('/patients', payload);
                const modal = bootstrap.Modal.getInstance(document.getElementById('registerPatientModal'));
                if (modal) modal.hide();
                registerForm.reset();
                alert('Patient registered successfully! Assigned UHID: ' + newPatient.uhid);
                loadPatients('');
            } catch (err) {
                alertBox.textContent = err.message;
                alertBox.classList.remove('d-none');
            }
        });
    }

    const editPatientForm = document.getElementById('edit-patient-form');
    if (editPatientForm) {
        editPatientForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const alertBox = document.getElementById('edit-patient-alert');
            if (alertBox) alertBox.classList.add('d-none');

            const patientId = document.getElementById('editPatientId').value;
            const payload = {
                fullName: document.getElementById('editFullName').value.trim(),
                dateOfBirth: document.getElementById('editDateOfBirth').value,
                gender: document.getElementById('editGender').value,
                phone: document.getElementById('editPhone').value.trim(),
                email: document.getElementById('editEmail').value.trim(),
                bloodGroup: document.getElementById('editBloodGroup').value,
                allergies: document.getElementById('editAllergies').value.trim(),
                address: document.getElementById('editAddress').value.trim(),
                emergencyContactName: document.getElementById('editEmergencyContactName').value.trim(),
                emergencyContactPhone: document.getElementById('editEmergencyContactPhone').value.trim()
            };

            try {
                const updated = await API.put('/patients/' + patientId, payload);
                const modalEl = document.getElementById('editPatientModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
                alert(`Patient record for ${updated.fullName} (${updated.uhid}) updated successfully!`);
                const searchInput = document.getElementById('patient-search-input');
                loadPatients(searchInput ? searchInput.value : '');
            } catch (err) {
                if (alertBox) {
                    alertBox.textContent = err.message;
                    alertBox.classList.remove('d-none');
                } else {
                    alert('Failed to update patient: ' + err.message);
                }
            }
        });
    }
}

async function loadPatients(query) {
    const tbody = document.getElementById('patients-tbody');
    const filterBadge = document.getElementById('search-filter-badge');
    const isDoctor = Auth.getRole() === 'DOCTOR';
    if (!tbody) return;

    try {
        const patients = await API.get(`/patients?query=${encodeURIComponent(query)}`);
        window.currentLoadedPatients = patients;

        if (filterBadge) {
            if (query && query.trim().length > 0) {
                filterBadge.className = 'badge bg-primary-subtle text-primary border border-primary-subtle';
                filterBadge.innerHTML = `<i class="bi bi-search me-1"></i> Universal Search across network: "${query.trim()}" (${patients.length} found)`;
            } else if (isDoctor) {
                filterBadge.className = 'badge bg-info-subtle text-info-emphasis border border-info-subtle';
                filterBadge.innerHTML = `<i class="bi bi-person-check-fill me-1"></i> Doctor Queue: Showing My Scheduled Patients (${patients.length})`;
            } else {
                filterBadge.className = 'badge bg-light text-secondary border';
                filterBadge.innerHTML = `<i class="bi bi-collection me-1"></i> Central Directory (${patients.length} Patients)`;
            }
        }

        if (patients.length === 0) {
            if (query && query.trim().length > 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4"><i class="bi bi-search me-2"></i>No patient found with UHID / query "<strong>${query}</strong>" across any participating hospital.</td></tr>`;
            } else if (isDoctor) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4"><i class="bi bi-calendar2-check me-2"></i>No scheduled patients found in your assigned consultation queue.<br><small class="text-secondary">Enter any patient's <strong>UHID</strong> in the search bar above to retrieve their complete electronic health record.</small></td></tr>`;
            } else {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No matching patient records found</td></tr>`;
            }
            return;
        }

        tbody.innerHTML = patients.map(p => `
            <tr>
                <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">${p.uhid}</span></td>
                <td class="fw-bold">${p.fullName}</td>
                <td>${p.gender || 'N/A'} / ${p.dateOfBirth || 'N/A'}</td>
                <td><i class="bi bi-telephone text-muted me-1"></i>${p.phone || 'N/A'}</td>
                <td><span class="badge bg-danger-subtle text-danger fs-7">${p.bloodGroup || 'Unknown'}</span></td>
                <td><small class="text-muted">${p.allergies ? p.allergies : 'None'}</small></td>
                <td>
                    <div class="d-flex gap-1">
                        <a href="patient-profile.html?id=${p.patientId}" class="btn btn-outline-primary btn-sm rounded-pill px-2.5">
                            <i class="bi bi-folder2-open me-1"></i> Profile
                        </a>
                        <button class="btn btn-outline-secondary btn-sm rounded-pill px-2.5" onclick="openEditPatientModal(${p.patientId})">
                            <i class="bi bi-pencil-square me-1"></i> Edit
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Failed to load patient records: ${err.message}</td></tr>`;
    }
}

window.openEditPatientModal = async function(patientId) {
    let patient = window.currentLoadedPatients ? window.currentLoadedPatients.find(p => p.patientId == patientId) : null;
    if (!patient && window.currentProfilePatient && window.currentProfilePatient.patientId == patientId) {
        patient = window.currentProfilePatient;
    }
    if (!patient) {
        try {
            patient = await API.get(`/patients/${patientId}`);
        } catch (e) {
            console.error('Error fetching patient:', e);
            return;
        }
    }
    if (!patient) return;

    document.getElementById('editPatientId').value = patient.patientId;
    const uhidBadge = document.getElementById('editPatientUhidBadge');
    if (uhidBadge) uhidBadge.textContent = patient.uhid || 'UHID';
    document.getElementById('editFullName').value = patient.fullName || '';
    document.getElementById('editDateOfBirth').value = patient.dateOfBirth || '';
    document.getElementById('editGender').value = patient.gender || 'Male';
    document.getElementById('editPhone').value = patient.phone || '';
    document.getElementById('editEmail').value = patient.email || '';
    document.getElementById('editBloodGroup').value = patient.bloodGroup || 'O+';
    document.getElementById('editAllergies').value = patient.allergies || '';
    document.getElementById('editAddress').value = patient.address || '';
    document.getElementById('editEmergencyContactName').value = patient.emergencyContactName || '';
    document.getElementById('editEmergencyContactPhone').value = patient.emergencyContactPhone || '';

    const alertBox = document.getElementById('edit-patient-alert');
    if (alertBox) alertBox.classList.add('d-none');

    const modal = new bootstrap.Modal(document.getElementById('editPatientModal'));
    modal.show();
};

/* -------------------------------------------------------------
 * 4. Patient Profile Page
 * ------------------------------------------------------------- */
async function initPatientProfilePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id') || 1;

    try {
        const patient = await API.get(`/patients/${patientId}`);
        window.currentProfilePatient = patient;
        
        document.getElementById('profile-name').textContent = patient.fullName;
        document.getElementById('profile-uhid').textContent = patient.uhid;
        document.getElementById('profile-phone').textContent = patient.phone || 'N/A';
        document.getElementById('profile-email').textContent = patient.email || 'N/A';
        document.getElementById('profile-dob').textContent = patient.dateOfBirth || 'N/A';
        document.getElementById('profile-gender').textContent = patient.gender || 'N/A';
        document.getElementById('profile-blood').textContent = patient.bloodGroup || 'N/A';
        document.getElementById('profile-allergies').textContent = patient.allergies || 'None';
        document.getElementById('profile-address').textContent = patient.address || 'N/A';
        document.getElementById('profile-emergency').textContent = `${patient.emergencyContactName || 'N/A'} (${patient.emergencyContactPhone || 'N/A'})`;

        // Edit Patient Trigger from Profile Page
        const editBtn = document.getElementById('btn-edit-patient-profile');
        if (editBtn) {
            editBtn.onclick = () => {
                openEditPatientModal(patientId);
            };
        }

        // Edit form submission on Profile Page
        const profileEditForm = document.getElementById('edit-patient-form');
        if (profileEditForm) {
            profileEditForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const alertBox = document.getElementById('edit-patient-alert');
                if (alertBox) alertBox.classList.add('d-none');

                const pId = document.getElementById('editPatientId').value;
                const payload = {
                    fullName: document.getElementById('editFullName').value.trim(),
                    dateOfBirth: document.getElementById('editDateOfBirth').value,
                    gender: document.getElementById('editGender').value,
                    phone: document.getElementById('editPhone').value.trim(),
                    email: document.getElementById('editEmail').value.trim(),
                    bloodGroup: document.getElementById('editBloodGroup').value,
                    allergies: document.getElementById('editAllergies').value.trim(),
                    address: document.getElementById('editAddress').value.trim(),
                    emergencyContactName: document.getElementById('editEmergencyContactName').value.trim(),
                    emergencyContactPhone: document.getElementById('editEmergencyContactPhone').value.trim()
                };

                try {
                    const updated = await API.put('/patients/' + pId, payload);
                    window.currentProfilePatient = updated;
                    const modalEl = document.getElementById('editPatientModal');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();

                    // Update Profile Page UI
                    document.getElementById('profile-name').textContent = updated.fullName;
                    document.getElementById('profile-phone').textContent = updated.phone || 'N/A';
                    document.getElementById('profile-email').textContent = updated.email || 'N/A';
                    document.getElementById('profile-dob').textContent = updated.dateOfBirth || 'N/A';
                    document.getElementById('profile-gender').textContent = updated.gender || 'N/A';
                    document.getElementById('profile-blood').textContent = updated.bloodGroup || 'N/A';
                    document.getElementById('profile-allergies').textContent = updated.allergies || 'None';
                    document.getElementById('profile-address').textContent = updated.address || 'N/A';
                    document.getElementById('profile-emergency').textContent = `${updated.emergencyContactName || 'N/A'} (${updated.emergencyContactPhone || 'N/A'})`;

                    alert(`Patient record for ${updated.fullName} (${updated.uhid}) updated successfully!`);
                } catch (err) {
                    if (alertBox) {
                        alertBox.textContent = err.message;
                        alertBox.classList.remove('d-none');
                    } else {
                        alert('Failed to update patient: ' + err.message);
                    }
                }
            });
        }

        // PDF Download Trigger
        const downloadBtn = document.getElementById('btn-download-pdf');
        if (downloadBtn) {
            downloadBtn.onclick = () => {
                downloadPatientReport(patientId);
            };
        }

        // Load History
        const visits = await API.get(`/patients/${patientId}/history`);
        const historyContainer = document.getElementById('visit-history-container');
        if (historyContainer) {
            if (visits.length === 0) {
                historyContainer.innerHTML = `<div class="text-center text-muted py-5">No clinical visits recorded for this patient.</div>`;
            } else {
                historyContainer.innerHTML = visits.map(v => `
                    <div class="card card-custom mb-3">
                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                            <div>
                                <span class="fw-bold text-dark me-2"><i class="bi bi-calendar3 me-1"></i> ${new Date(v.visitDate).toLocaleString()}</span>
                                <span class="badge bg-secondary-subtle text-secondary">${v.hospitalName || 'Hospital'}</span>
                            </div>
                            <span class="text-muted small">Attending: Dr. ${v.doctorName}</span>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <div class="text-muted small fw-semibold">Vitals</div>
                                    <div class="fw-semibold text-dark">${v.vitals || 'N/A'}</div>
                                </div>
                                <div class="col-md-4">
                                    <div class="text-muted small fw-semibold">Symptoms</div>
                                    <div>${v.symptoms || 'N/A'}</div>
                                </div>
                                <div class="col-md-4">
                                    <div class="text-muted small fw-semibold">Diagnosis</div>
                                    <div class="fw-bold text-primary">${v.diagnosis || 'N/A'}</div>
                                </div>
                            </div>
                            ${v.prescriptions && v.prescriptions.length > 0 ? `
                                <hr class="my-3">
                                <div class="fw-bold small text-secondary mb-2"><i class="bi bi-capsule me-1"></i> Prescribed Medicines</div>
                                <div class="table-responsive">
                                    <table class="table table-sm align-middle mb-0" style="font-size: 0.85rem;">
                                        <thead class="table-light">
                                            <tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>
                                        </thead>
                                        <tbody>
                                            ${v.prescriptions.map(rx => `
                                                <tr>
                                                    <td class="fw-bold">${rx.medicineName}</td>
                                                    <td>${rx.dosage || ''}</td>
                                                    <td>${rx.frequency || ''}</td>
                                                    <td>${rx.duration || ''}</td>
                                                    <td class="text-muted">${rx.instructions || ''}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Failed to load patient profile:', err);
    }
}

/* -------------------------------------------------------------
 * 5. Appointments Page
 * ------------------------------------------------------------- */
async function initAppointmentsPage() {
    const tbody = document.getElementById('appointments-tbody');
    const scheduleForm = document.getElementById('schedule-appointment-form');
    const alertBox = document.getElementById('schedule-alert');
    const searchInput = document.getElementById('appointment-search-input');
    const isDoctor = Auth.getRole() === 'DOCTOR';
    const doctorApptBanner = document.getElementById('doctor-appt-banner');
    const doctorApptName = document.getElementById('doctor-appt-name');
    const apptSub = document.getElementById('appointments-sub');

    if (isDoctor) {
        if (doctorApptBanner) doctorApptBanner.classList.remove('d-none');
        const docName = localStorage.getItem('hprs_user_name') || 'Doctor';
        if (doctorApptName) doctorApptName.textContent = docName.startsWith('Dr.') ? docName : `Dr. ${docName}`;
        if (apptSub) apptSub.textContent = 'Consultations and appointments assigned to your personal doctor schedule.';
    }

    loadAppointments('');
    populatePatientSelects();
    populateDoctorSelects();

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => loadAppointments(e.target.value), 250);
        });
    }

    if (scheduleForm) {
        scheduleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            alertBox.classList.add('d-none');

            const payload = {
                patientId: parseInt(document.getElementById('apptPatientId').value),
                doctorId: parseInt(document.getElementById('apptDoctorId').value),
                hospitalId: 1,
                appointmentDatetime: document.getElementById('apptDatetime').value,
                reason: document.getElementById('apptReason').value.trim()
            };

            try {
                await API.post('/appointments', payload);
                const modal = bootstrap.Modal.getInstance(document.getElementById('scheduleModal'));
                if (modal) modal.hide();
                scheduleForm.reset();
                alert('Appointment scheduled successfully!');
                loadAppointments(searchInput ? searchInput.value : '');
            } catch (err) {
                alertBox.textContent = err.message;
                alertBox.classList.remove('d-none');
            }
        });
    }

    window.updateApptStatus = async (id, status) => {
        try {
            await API.put(`/appointments/${id}?status=${status}`, {});
            loadAppointments(searchInput ? searchInput.value : '');
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };
}

async function loadAppointments(filterQuery = '') {
    const tbody = document.getElementById('appointments-tbody');
    if (!tbody) return;

    try {
        let appts = await API.get('/appointments');
        if (filterQuery && filterQuery.trim().length > 0) {
            const q = filterQuery.trim().toLowerCase();
            appts = appts.filter(a => 
                (a.patientUhid && a.patientUhid.toLowerCase().includes(q)) ||
                (a.patientName && a.patientName.toLowerCase().includes(q)) ||
                (a.doctorName && a.doctorName.toLowerCase().includes(q)) ||
                (a.reason && a.reason.toLowerCase().includes(q)) ||
                (a.status && a.status.toLowerCase().includes(q))
            );
        }

        if (appts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">${filterQuery ? `No appointments matching "${filterQuery}"` : 'No appointments scheduled'}</td></tr>`;
            return;
        }

        tbody.innerHTML = appts.map(a => `
            <tr>
                <td><span class="fw-semibold text-primary">${a.patientUhid || 'N/A'}</span></td>
                <td class="fw-bold">${a.patientName}</td>
                <td>Dr. ${a.doctorName}</td>
                <td>${new Date(a.appointmentDatetime).toLocaleString()}</td>
                <td><small class="text-muted">${a.reason || 'General Consultation'}</small></td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-sm badge-status badge-${(a.status || 'scheduled').toLowerCase()} dropdown-toggle border-0" data-bs-toggle="dropdown">
                            ${a.status}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="#" onclick="updateApptStatus(${a.appointmentId}, 'COMPLETED')">Mark Completed</a></li>
                            <li><a class="dropdown-item" href="#" onclick="updateApptStatus(${a.appointmentId}, 'CANCELLED')">Cancel Appointment</a></li>
                            <li><a class="dropdown-item" href="#" onclick="updateApptStatus(${a.appointmentId}, 'NO_SHOW')">Mark No-Show</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Error loading appointments: ${err.message}</td></tr>`;
    }
}

/* -------------------------------------------------------------
 * 6. Doctor Visit / Clinical Entry Page
 * ------------------------------------------------------------- */
function initVisitPage() {
    const rxContainer = document.getElementById('rx-rows-container');
    const addRxBtn = document.getElementById('btn-add-rx-row');
    const visitForm = document.getElementById('clinical-visit-form');
    const uhidInput = document.getElementById('visitUhidLookupInput');
    const lookupBtn = document.getElementById('btn-visit-uhid-lookup');
    const feedback = document.getElementById('visit-uhid-lookup-feedback');

    populatePatientSelects();

    // Universal UHID Retrieval function for Visit page
    const executeVisitUhidLookup = async () => {
        const query = (uhidInput?.value || '').trim();
        if (!query) {
            if (feedback) {
                feedback.className = 'small mb-1 text-danger';
                feedback.innerHTML = '<i class="bi bi-exclamation-circle me-1"></i> Please enter a UHID to retrieve.';
                feedback.classList.remove('d-none');
            }
            return;
        }
        if (feedback) {
            feedback.className = 'small mb-1 text-secondary';
            feedback.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Retrieving patient record across hospital network...';
            feedback.classList.remove('d-none');
        }

        try {
            const results = await API.get(`/patients?query=${encodeURIComponent(query)}`);
            if (!results || results.length === 0) {
                if (feedback) {
                    feedback.className = 'small mb-1 text-danger';
                    feedback.innerHTML = `<i class="bi bi-exclamation-triangle me-1"></i> No patient found matching UHID "<strong>${query}</strong>" across any hospital.`;
                }
                return;
            }
            const patient = results[0];
            const select = document.getElementById('visitPatientId');
            if (select) {
                let opt = select.querySelector(`option[value="${patient.patientId}"]`);
                if (!opt) {
                    opt = document.createElement('option');
                    opt.value = patient.patientId;
                    opt.textContent = `${patient.fullName} (${patient.uhid}) [Universal UHID Retrieval]`;
                    select.appendChild(opt);
                }
                select.value = patient.patientId;
            }
            if (feedback) {
                feedback.className = 'small mb-1 text-success fw-semibold';
                feedback.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> Patient Retrieved: <strong>${patient.fullName}</strong> (${patient.uhid}, Blood Group: ${patient.bloodGroup || 'N/A'}) - Ready for consultation.`;
            }
        } catch (err) {
            if (feedback) {
                feedback.className = 'small mb-1 text-danger';
                feedback.innerHTML = `<i class="bi bi-x-circle me-1"></i> Retrieval failed: ${err.message}`;
            }
        }
    };

    if (lookupBtn) {
        lookupBtn.addEventListener('click', executeVisitUhidLookup);
    }
    if (uhidInput) {
        uhidInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                executeVisitUhidLookup();
            }
        });
    }

    if (addRxBtn && rxContainer) {
        addRxBtn.addEventListener('click', () => {
            const row = document.createElement('div');
            row.className = 'row g-2 rx-row align-items-center mb-2';
            row.innerHTML = `
                <div class="col-md-3"><input type="text" class="form-control rx-name" placeholder="Medicine Name (e.g. Paracetamol)" required></div>
                <div class="col-md-2"><input type="text" class="form-control rx-dosage" placeholder="Dosage (e.g. 500 mg)"></div>
                <div class="col-md-2"><input type="text" class="form-control rx-freq" placeholder="Freq (e.g. Twice daily)"></div>
                <div class="col-md-2"><input type="text" class="form-control rx-dur" placeholder="Duration (e.g. 5 Days)"></div>
                <div class="col-md-2"><input type="text" class="form-control rx-inst" placeholder="Instructions"></div>
                <div class="col-md-1 text-center"><button type="button" class="btn btn-outline-danger btn-sm rounded-circle" onclick="this.closest('.rx-row').remove()"><i class="bi bi-x"></i></button></div>
            `;
            rxContainer.appendChild(row);
        });
    }

    if (visitForm) {
        visitForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const rxRows = document.querySelectorAll('.rx-row');
            const prescriptions = [];
            rxRows.forEach(r => {
                const name = r.querySelector('.rx-name')?.value.trim();
                if (name) {
                    prescriptions.push({
                        medicineName: name,
                        dosage: r.querySelector('.rx-dosage')?.value.trim() || '',
                        frequency: r.querySelector('.rx-freq')?.value.trim() || '',
                        duration: r.querySelector('.rx-dur')?.value.trim() || '',
                        instructions: r.querySelector('.rx-inst')?.value.trim() || ''
                    });
                }
            });

            const payload = {
                patientId: parseInt(document.getElementById('visitPatientId').value) || 1,
                doctorId: parseInt(localStorage.getItem('hprs_user_id')) || 2,
                hospitalId: parseInt(localStorage.getItem('hprs_hospital_id')) || 1,
                vitals: document.getElementById('visitVitals').value.trim(),
                symptoms: document.getElementById('visitSymptoms').value.trim(),
                diagnosis: document.getElementById('visitDiagnosis').value.trim(),
                notes: document.getElementById('visitNotes').value.trim(),
                prescriptions
            };

            try {
                await API.post('/visits', payload);
                alert('Clinical visit record & prescriptions saved successfully!');
                window.location.href = `patient-profile.html?id=${payload.patientId}`;
            } catch (err) {
                alert('Failed to save visit record: ' + err.message);
            }
        });
    }
}

/* -------------------------------------------------------------
 * 7. Reports Page
 * ------------------------------------------------------------- */
async function initReportsPage() {
    const reportList = document.getElementById('reports-patient-list');
    if (!reportList) return;

    try {
        const patients = await API.get('/patients');
        reportList.innerHTML = patients.map(p => `
            <div class="card card-custom mb-2 p-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="badge bg-primary-subtle text-primary me-2">${p.uhid}</span>
                        <span class="fw-bold">${p.fullName}</span>
                        <span class="text-muted small ms-2">${p.phone || ''}</span>
                    </div>
                    <button onclick="downloadPatientReport(${p.patientId})" class="btn btn-outline-primary btn-sm rounded-pill">
                        <i class="bi bi-file-earmark-pdf me-1"></i> Download PDF Summary
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        reportList.innerHTML = `<div class="text-danger">Failed to load report directory: ${err.message}</div>`;
    }
}

/* -------------------------------------------------------------
 * 8. Admin Panel Page
 * ------------------------------------------------------------- */
async function initAdminPage() {
    loadAdminUsers();
    loadAdminAuditLogs();

    const userForm = document.getElementById('create-user-form');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                fullName: document.getElementById('userFullName').value.trim(),
                email: document.getElementById('userEmail').value.trim(),
                role: document.getElementById('userRole').value,
                hospitalId: parseInt(document.getElementById('userHospitalId').value) || 1,
                specialization: document.getElementById('userSpecialization').value.trim(),
                password: 'Password123!'
            };

            try {
                await API.post('/admin/users', payload);
                const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
                if (modal) modal.hide();
                userForm.reset();
                alert('User created successfully with default password (Password123!)');
                loadAdminUsers();
            } catch (err) {
                alert('Failed to create user: ' + err.message);
            }
        });
    }
    const editUserForm = document.getElementById('edit-user-role-form');
    if (editUserForm) {
        editUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = document.getElementById('editUserId').value;
            const payload = {
                fullName: document.getElementById('editUserFullName').value.trim(),
                email: document.getElementById('editUserEmail').value.trim(),
                role: document.getElementById('editUserRole').value,
                specialization: document.getElementById('editUserSpecialization').value.trim(),
                active: document.getElementById('editUserStatus').value === 'true'
            };

            try {
                await API.put(`/admin/users/${userId}`, payload);
                const modal = bootstrap.Modal.getInstance(document.getElementById('editUserRoleModal'));
                if (modal) modal.hide();
                alert('User role and permissions updated successfully!');
                loadAdminUsers();
                loadAdminAuditLogs();
                populateDoctorSelects();
            } catch (err) {
                alert('Failed to update user role: ' + err.message);
            }
        });
    }
}

async function loadAdminUsers() {
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;

    try {
        const users = await API.get('/admin/users');
        tbody.innerHTML = users.map(u => `
            <tr>
                <td class="fw-bold">${u.fullName}</td>
                <td>${u.email}</td>
                <td><span class="badge badge-role badge-role-${u.role.toLowerCase()}">${u.role}</span></td>
                <td>${u.specialization || 'N/A'}</td>
                <td><span class="badge ${u.active ? 'bg-success' : 'bg-danger'}">${u.active ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn btn-outline-primary btn-sm rounded-pill px-3" onclick="openEditUserRole(${u.userId}, '${u.fullName.replace(/'/g, "\\'")}', '${u.email}', '${u.role}', '${(u.specialization || '').replace(/'/g, "\\'")}', ${u.active})">
                        <i class="bi bi-pencil-square me-1"></i> Edit Role
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load users:', err);
    }
}

window.openEditUserRole = function(userId, fullName, email, role, specialization, active) {
    document.getElementById('editUserId').value = userId;
    document.getElementById('editUserFullName').value = fullName;
    document.getElementById('editUserEmail').value = email;
    document.getElementById('editUserRole').value = role.toUpperCase();
    document.getElementById('editUserSpecialization').value = specialization || '';
    document.getElementById('editUserStatus').value = active ? 'true' : 'false';

    const modal = new bootstrap.Modal(document.getElementById('editUserRoleModal'));
    modal.show();
};

async function loadAdminAuditLogs() {
    const tbody = document.getElementById('admin-audit-tbody');
    if (!tbody) return;

    try {
        const logs = await API.get('/admin/audit-logs');
        tbody.innerHTML = logs.map(l => `
            <tr>
                <td><small class="text-muted">${new Date(l.timestamp).toLocaleString()}</small></td>
                <td class="fw-bold">${l.userName}</td>
                <td><span class="badge badge-role badge-role-${(l.userRole || 'receptionist').toLowerCase()}">${l.userRole}</span></td>
                <td><span class="badge bg-secondary-subtle text-dark">${l.action}</span></td>
                <td><small>${l.details}</small></td>
                <td><small class="text-muted">${l.ipAddress || '127.0.0.1'}</small></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load audit logs:', err);
    }
}

async function populatePatientSelects() {
    try {
        const isDoctor = Auth.getRole() === 'DOCTOR';
        const patients = await API.get('/patients');
        const apptPatientSelect = document.getElementById('apptPatientId');
        const visitPatientSelect = document.getElementById('visitPatientId');

        let visitPlaceholder = isDoctor 
            ? `<option value="">-- Select from your scheduled patients (${patients.length}) or enter UHID above --</option>`
            : `<option value="">-- Select Patient --</option>`;

        let optionsHtml = (patients || []).map(p => 
            `<option value="${p.patientId}">${p.fullName} (${p.uhid})</option>`
        ).join('');

        if (apptPatientSelect) {
            apptPatientSelect.innerHTML = `<option value="">-- Select Patient --</option>` + optionsHtml;
        }
        if (visitPatientSelect) {
            visitPatientSelect.innerHTML = visitPlaceholder + optionsHtml;
        }

        // Check URL parameter for pre-selection (e.g. ?patientId=3 or ?id=3 or ?uhid=...)
        const urlParams = new URLSearchParams(window.location.search);
        const targetPatientId = urlParams.get('patientId') || urlParams.get('id');
        const targetUhid = urlParams.get('uhid');

        if (targetPatientId && visitPatientSelect) {
            let opt = visitPatientSelect.querySelector(`option[value="${targetPatientId}"]`);
            if (!opt) {
                try {
                    const p = await API.get(`/patients/${targetPatientId}`);
                    if (p) {
                        opt = document.createElement('option');
                        opt.value = p.patientId;
                        opt.textContent = `${p.fullName} (${p.uhid}) [Universal UHID Retrieval]`;
                        visitPatientSelect.appendChild(opt);
                        visitPatientSelect.value = targetPatientId;
                        const feedback = document.getElementById('visit-uhid-lookup-feedback');
                        if (feedback) {
                            feedback.className = 'small mb-1 text-success fw-semibold';
                            feedback.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> Patient Retrieved: <strong>${p.fullName}</strong> (${p.uhid})`;
                            feedback.classList.remove('d-none');
                        }
                    }
                } catch (e) {
                    console.warn('Could not auto-fetch patient for visit:', e);
                }
            } else {
                visitPatientSelect.value = targetPatientId;
            }
        } else if (targetUhid && visitPatientSelect) {
            const uhidInput = document.getElementById('visitUhidLookupInput');
            if (uhidInput) uhidInput.value = targetUhid;
            const lookupBtn = document.getElementById('btn-visit-uhid-lookup');
            if (lookupBtn) lookupBtn.click();
        }
    } catch (err) {
        console.error('Failed to populate patient dropdowns:', err);
    }
}

async function populateDoctorSelects() {
    try {
        const users = await API.get('/admin/users');
        const doctors = users.filter(u => u.role === 'DOCTOR' || u.role === 'Doctor');
        const apptDoctorSelect = document.getElementById('apptDoctorId');

        if (apptDoctorSelect && doctors.length > 0) {
            apptDoctorSelect.innerHTML = doctors.map(d => 
                `<option value="${d.userId}">Dr. ${d.fullName} (${d.specialization || 'General Practice'})</option>`
            ).join('');
        }
    } catch (err) {
        console.error('Failed to populate doctor dropdowns:', err);
    }
}

/**
 * Universal Patient Report PDF Generator
 * Tries authenticated backend API download, then seamlessly falls back
 * to generating an official printable Medical Record PDF in browser.
 */
async function downloadPatientReport(patientId) {
    try {
        const patient = await API.get(`/patients/${patientId}`);
        const visits = await API.get(`/patients/${patientId}/history`).catch(() => []);

        // Attempt direct authenticated binary PDF download from Spring Boot backend
        const token = localStorage.getItem('hprs_token');
        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/reports/patient/${patientId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok && response.headers.get('content-type')?.includes('application/pdf')) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Medical_Record_${patient.uhid || patientId}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                    return;
                }
            } catch (backendErr) {
                console.warn('Backend PDF endpoint unreachable, launching printable PDF generator:', backendErr);
            }
        }

        // Generate high-resolution hospital medical summary and launch Print-to-PDF
        generatePrintablePatientReport(patient, visits);

    } catch (err) {
        alert('Could not generate medical report: ' + err.message);
    }
}

function generatePrintablePatientReport(patient, visits) {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
        alert('Please allow popups for this page to download/print the PDF report.');
        return;
    }

    const hospitalName = localStorage.getItem('hprs_hospital_name') || 'Global City Hospital';
    const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let visitsHtml = '';
    if (!visits || visits.length === 0) {
        visitsHtml = `<p style="color: #64748b; font-style: italic; margin-top: 10px;">No historical clinical visits recorded for this patient.</p>`;
    } else {
        visitsHtml = visits.map((v, idx) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; background: #fafafa; page-break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 12px;">
                    <div><strong>Visit #${visits.length - idx}</strong> — ${new Date(v.visitDate).toLocaleString()}</div>
                    <div><strong>Doctor:</strong> Dr. ${v.doctorName || 'Attending Physician'} (${v.hospitalName || hospitalName})</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div><strong>Vitals:</strong> ${v.vitals || 'Normal'}</div>
                    <div><strong>Symptoms:</strong> ${v.symptoms || 'None specified'}</div>
                </div>
                <div style="margin-bottom: 12px;">
                    <strong>Clinical Diagnosis:</strong> <span style="color: #1e3a8a; font-weight: bold;">${v.diagnosis || 'General Medical Consultation'}</span>
                </div>
                ${v.notes ? `<div style="margin-bottom: 12px; font-size: 13px;"><strong>Physician Notes:</strong> ${v.notes}</div>` : ''}

                ${v.prescriptions && v.prescriptions.length > 0 ? `
                    <div style="margin-top: 14px;">
                        <strong style="color: #047857; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Rx Prescribed Medications</strong>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 12px;">
                            <thead>
                                <tr style="background: #e2e8f0; text-align: left;">
                                    <th style="padding: 6px; border: 1px solid #cbd5e1;">Medicine</th>
                                    <th style="padding: 6px; border: 1px solid #cbd5e1;">Dosage</th>
                                    <th style="padding: 6px; border: 1px solid #cbd5e1;">Frequency</th>
                                    <th style="padding: 6px; border: 1px solid #cbd5e1;">Duration</th>
                                    <th style="padding: 6px; border: 1px solid #cbd5e1;">Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${v.prescriptions.map(rx => `
                                    <tr>
                                        <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${rx.medicineName}</td>
                                        <td style="padding: 6px; border: 1px solid #cbd5e1;">${rx.dosage || '-'}</td>
                                        <td style="padding: 6px; border: 1px solid #cbd5e1;">${rx.frequency || '-'}</td>
                                        <td style="padding: 6px; border: 1px solid #cbd5e1;">${rx.duration || '-'}</td>
                                        <td style="padding: 6px; border: 1px solid #cbd5e1;">${rx.instructions || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Medical_Record_${patient.uhid}</title>
            <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; margin: 0; padding: 25px; line-height: 1.5; font-size: 14px; }
                .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
                .report-title { font-size: 22px; font-weight: bold; color: #1e3a8a; }
                .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 25px; }
                .info-item strong { color: #475569; display: inline-block; width: 140px; }
                .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                .badge-uhid { background: #dbeafe; color: #1d4ed8; }
                .badge-allergy { background: #fee2e2; color: #b91c1c; }
                .section-header { font-size: 16px; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 20px 0 15px 0; }
                .btn-bar { position: fixed; top: 15px; right: 20px; background: white; padding: 8px 16px; border-radius: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); display: flex; gap: 10px; z-index: 1000; }
                .btn { padding: 8px 16px; font-size: 13px; font-weight: bold; border-radius: 20px; cursor: pointer; border: none; }
                .btn-primary { background: #2563eb; color: white; }
                .btn-secondary { background: #e2e8f0; color: #334155; }
                .signature-section { margin-top: 50px; display: flex; justify-content: space-between; page-break-inside: avoid; }
                .signature-box { border-top: 1px dashed #94a3b8; width: 220px; text-align: center; padding-top: 8px; font-size: 12px; color: #475569; }
                @media print {
                    .no-print { display: none !important; }
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="no-print btn-bar">
                <button class="btn btn-primary" onclick="window.print()">🖨️ Save as PDF / Print</button>
                <button class="btn btn-secondary" onclick="window.close()">❌ Close</button>
            </div>

            <div class="report-header">
                <div>
                    <div class="report-title">${hospitalName}</div>
                    <div style="color: #64748b; font-size: 13px;">Official Electronic Health Record (EHR) Summary</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: #2563eb;">CONFIDENTIAL MEDICAL REPORT</div>
                    <div style="font-size: 12px; color: #64748b;">Issued on: ${reportDate}</div>
                </div>
            </div>

            <div class="info-grid">
                <div class="info-item"><strong>Patient Name:</strong> <b>${patient.fullName}</b></div>
                <div class="info-item"><strong>Unique Health ID:</strong> <span class="badge badge-uhid">${patient.uhid}</span></div>
                <div class="info-item"><strong>Date of Birth:</strong> ${patient.dateOfBirth || 'N/A'}</div>
                <div class="info-item"><strong>Gender / Blood:</strong> ${patient.gender || 'N/A'} | <b>${patient.bloodGroup || 'Unknown'}</b></div>
                <div class="info-item"><strong>Phone Contact:</strong> ${patient.phone || 'N/A'}</div>
                <div class="info-item"><strong>Email:</strong> ${patient.email || 'N/A'}</div>
                <div class="info-item"><strong>Known Allergies:</strong> <span class="badge badge-allergy">${patient.allergies || 'None Recorded'}</span></div>
                <div class="info-item"><strong>Emergency Contact:</strong> ${patient.emergencyContactName || 'N/A'} (${patient.emergencyContactPhone || 'N/A'})</div>
                <div class="info-item" style="grid-column: span 2;"><strong>Address:</strong> ${patient.address || 'N/A'}</div>
            </div>

            <div class="section-header">Chronological Medical History & Prescriptions</div>
            ${visitsHtml}

            <div class="signature-section">
                <div class="signature-box">Hospital Records Officer</div>
                <div class="signature-box">Authorized Doctor Signature & Stamp</div>
            </div>

            <script>
                // Automatically open browser Print-to-PDF dialog after 500ms
                setTimeout(() => {
                    window.print();
                }, 500);
            </script>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
}
