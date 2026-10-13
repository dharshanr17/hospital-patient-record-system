/**
 * Hospital Patient Record System (HPRS) - Auth & Navigation Controller
 */

const Auth = {
    getToken() {
        return localStorage.getItem('hprs_token');
    },

    getRole() {
        return localStorage.getItem('hprs_role');
    },

    getUserName() {
        return localStorage.getItem('hprs_user_name');
    },

    getHospitalName() {
        return localStorage.getItem('hprs_hospital_name') || 'Global City Hospital';
    },

    getUserId() {
        return parseInt(localStorage.getItem('hprs_user_id')) || null;
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    requireAuth() {
        if (!this.isAuthenticated() && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        }
    },

    setSession(authData) {
        localStorage.setItem('hprs_token', authData.token);
        localStorage.setItem('hprs_user_id', authData.userId);
        localStorage.setItem('hprs_user_name', authData.fullName);
        localStorage.setItem('hprs_email', authData.email);
        localStorage.setItem('hprs_role', authData.role);
        localStorage.setItem('hprs_hospital_id', authData.hospitalId || '');
        localStorage.setItem('hprs_hospital_name', authData.hospitalName || 'Global City Hospital');
    },

    logout() {
        localStorage.removeItem('hprs_token');
        localStorage.removeItem('hprs_user_id');
        localStorage.removeItem('hprs_user_name');
        localStorage.removeItem('hprs_email');
        localStorage.removeItem('hprs_role');
        localStorage.removeItem('hprs_hospital_id');
        localStorage.removeItem('hprs_hospital_name');
        window.location.href = 'index.html';
    },

    renderNavbar(activePage) {
        const navbarContainer = document.getElementById('navbar-container');
        if (!navbarContainer) return;

        const role = this.getRole() || 'GUEST';
        const userName = this.getUserName() || 'User';
        const hospitalName = this.getHospitalName();

        let roleBadgeClass = 'badge-role-receptionist';
        if (role === 'ADMIN') roleBadgeClass = 'badge-role-admin';
        if (role === 'DOCTOR') roleBadgeClass = 'badge-role-doctor';
        if (role === 'NURSE') roleBadgeClass = 'badge-role-nurse';

        let navLinks = `
            <li class="nav-item">
                <a class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" href="dashboard.html">
                    <i class="bi bi-speedometer2 me-1"></i> Dashboard
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${activePage === 'patients' ? 'active' : ''}" href="patients.html">
                    <i class="bi bi-people me-1"></i> Patients
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link ${activePage === 'appointments' ? 'active' : ''}" href="appointments.html">
                    <i class="bi bi-calendar-event me-1"></i> Appointments
                </a>
            </li>
        `;

        if (role === 'DOCTOR') {
            navLinks += `
                <li class="nav-item">
                    <a class="nav-link ${activePage === 'visit' ? 'active' : ''}" href="visit.html">
                        <i class="bi bi-clipboard2-pulse me-1"></i> Clinical Entry
                    </a>
                </li>
            `;
        }

        if (role === 'ADMIN' || role === 'DOCTOR') {
            navLinks += `
                <li class="nav-item">
                    <a class="nav-link ${activePage === 'reports' ? 'active' : ''}" href="reports.html">
                        <i class="bi bi-file-earmark-pdf me-1"></i> Reports
                    </a>
                </li>
            `;
        }

        if (role === 'ADMIN') {
            navLinks += `
                <li class="nav-item">
                    <a class="nav-link ${activePage === 'admin' ? 'active' : ''}" href="admin.html">
                        <i class="bi bi-shield-lock me-1"></i> Admin Panel
                    </a>
                </li>
            `;
        }

        navbarContainer.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-custom sticky-top">
                <div class="container-fluid px-4">
                    <a class="navbar-brand d-flex align-items-center gap-2" href="dashboard.html">
                        <div class="navbar-brand-logo"><i class="bi bi-hospital"></i></div>
                        <div>
                            <div class="fw-bold brand-font text-dark leading-none">Global City Hospital</div>
                            <div class="text-muted small" style="font-size: 0.72rem;">${hospitalName && hospitalName !== 'Global City Hospital' ? hospitalName : 'Patient Record System'}</div>
                        </div>
                    </a>
                    
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse" id="navbarContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                            ${navLinks}
                        </ul>
                        
                        <div class="d-flex align-items-center gap-3">
                            <span class="badge bg-success-subtle text-success border border-success-subtle d-none d-lg-inline-block px-2.5 py-1.5" title="Cloud Database Synced">
                                <i class="bi bi-cloud-check-fill me-1"></i> Cloud Synced
                            </span>

                            <div class="dropdown">
                                <button class="btn btn-light btn-sm rounded-pill dropdown-toggle px-3 border" data-bs-toggle="dropdown">
                                    <i class="bi bi-person-circle me-1"></i> ${userName}
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2">
                                    <li class="px-3 py-2 border-bottom">
                                        <div class="fw-bold small text-dark">${userName}</div>
                                        <span class="badge badge-role ${roleBadgeClass} mt-1">${role}</span>
                                    </li>
                                    <li><a class="dropdown-item py-2 small" href="#" onclick="CloudStorage.exportBackup()"><i class="bi bi-download me-2 text-primary"></i> Export Cloud Backup (JSON)</a></li>
                                    <li><hr class="dropdown-divider my-1"></li>
                                    <li><a class="dropdown-item py-2 small text-danger" href="#" onclick="Auth.logout()"><i class="bi bi-box-arrow-right me-2"></i> Sign Out</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }
};

// Enforce login status on page load
Auth.requireAuth();
