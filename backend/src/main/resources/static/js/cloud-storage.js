/**
 * Hospital Patient Record System (HPRS) - Cloud Storage Engine v4
 * Provides persistent data storage with localStorage fallback.
 */

const CloudStorage = {
    STORAGE_KEY: 'hprs_cloud_db_v4',

    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            const db = {
                version: '4.0.0',
                lastSynced: new Date().toISOString(),
                hospitals: [
                    { hospitalId: 1,  name: 'Global City Hospital',          code: 'GCH',  registrationNo: 'HOSP-2026-01', phone: '+1-555-0199', address: '123 Healthcare Ave, Central District',       themeColor: '#1d4ed8', active: true },
                    { hospitalId: 2,  name: 'Municipal City Hospital',        code: 'MCH',  registrationNo: 'HOSP-2026-02', phone: '+1-555-0288', address: '456 Wellness Blvd, Northside',               themeColor: '#047857', active: true },
                    { hospitalId: 3,  name: 'Sunrise Medical Center',         code: 'SMC',  registrationNo: 'HOSP-2026-03', phone: '+1-555-0311', address: '789 Sunrise Pkwy, East Quarter',             themeColor: '#d97706', active: true },
                    { hospitalId: 4,  name: 'Apollo Speciality Hospital',     code: 'ASH',  registrationNo: 'HOSP-2026-04', phone: '+1-555-0422', address: '10 Apollo Drive, Medical Hub',               themeColor: '#7c3aed', active: true },
                    { hospitalId: 5,  name: 'City Heart Institute',           code: 'CHI',  registrationNo: 'HOSP-2026-05', phone: '+1-555-0533', address: '55 Cardiac Blvd, Heartland District',        themeColor: '#dc2626', active: true },
                    { hospitalId: 6,  name: 'Greenview Community Hospital',   code: 'GVCH', registrationNo: 'HOSP-2026-06', phone: '+1-555-0644', address: '200 Greenview Rd, Suburbia',                 themeColor: '#16a34a', active: true },
                    { hospitalId: 7,  name: 'St. Thomas General Hospital',    code: 'STGH', registrationNo: 'HOSP-2026-07', phone: '+1-555-0755', address: '7 Saint Thomas Way, Old Town',               themeColor: '#0891b2', active: true },
                    { hospitalId: 8,  name: 'National Cancer Centre',         code: 'NCC',  registrationNo: 'HOSP-2026-08', phone: '+1-555-0866', address: '1 Oncology Ave, Research Park',              themeColor: '#be185d', active: true },
                    { hospitalId: 9,  name: 'LifeCare Maternity Hospital',    code: 'LMH',  registrationNo: 'HOSP-2026-09', phone: '+1-555-0977', address: '33 Blossom Lane, Family District',           themeColor: '#db2777', active: true },
                    { hospitalId: 10, name: 'Metro Spine & Brain Hospital',   code: 'MSBH', registrationNo: 'HOSP-2026-10', phone: '+1-555-1088', address: '99 Neuroscience Blvd, Uptown',               themeColor: '#0f766e', active: true }
                ],
                departments: [
                    // GCH
                    { departmentId: 1,  name: 'General Medicine',      hospitalId: 1,  hospitalName: 'Global City Hospital'          },
                    { departmentId: 2,  name: 'Cardiology',            hospitalId: 1,  hospitalName: 'Global City Hospital'          },
                    { departmentId: 3,  name: 'Neurology',             hospitalId: 1,  hospitalName: 'Global City Hospital'          },
                    // MCH
                    { departmentId: 4,  name: 'Orthopedics',           hospitalId: 2,  hospitalName: 'Municipal City Hospital'       },
                    { departmentId: 5,  name: 'General Medicine',      hospitalId: 2,  hospitalName: 'Municipal City Hospital'       },
                    // SMC
                    { departmentId: 6,  name: 'Internal Medicine',     hospitalId: 3,  hospitalName: 'Sunrise Medical Center'        },
                    { departmentId: 7,  name: 'Pulmonology',           hospitalId: 3,  hospitalName: 'Sunrise Medical Center'        },
                    // ASH
                    { departmentId: 8,  name: 'Orthopedics',           hospitalId: 4,  hospitalName: 'Apollo Speciality Hospital'    },
                    { departmentId: 9,  name: 'Endocrinology',         hospitalId: 4,  hospitalName: 'Apollo Speciality Hospital'    },
                    { departmentId: 10, name: 'Rheumatology',          hospitalId: 4,  hospitalName: 'Apollo Speciality Hospital'    },
                    // CHI
                    { departmentId: 11, name: 'Cardiology',            hospitalId: 5,  hospitalName: 'City Heart Institute'          },
                    { departmentId: 12, name: 'Cardiac Surgery',       hospitalId: 5,  hospitalName: 'City Heart Institute'          },
                    // GVCH
                    { departmentId: 13, name: 'General Medicine',      hospitalId: 6,  hospitalName: 'Greenview Community Hospital'  },
                    { departmentId: 14, name: 'OB-GYN',                hospitalId: 6,  hospitalName: 'Greenview Community Hospital'  },
                    // STGH
                    { departmentId: 15, name: 'Emergency Medicine',    hospitalId: 7,  hospitalName: 'St. Thomas General Hospital'   },
                    { departmentId: 16, name: 'General Surgery',       hospitalId: 7,  hospitalName: 'St. Thomas General Hospital'   },
                    // NCC
                    { departmentId: 17, name: 'Medical Oncology',      hospitalId: 8,  hospitalName: 'National Cancer Centre'        },
                    { departmentId: 18, name: 'Radiation Oncology',    hospitalId: 8,  hospitalName: 'National Cancer Centre'        },
                    // LMH
                    { departmentId: 19, name: 'Obstetrics',            hospitalId: 9,  hospitalName: 'LifeCare Maternity Hospital'   },
                    { departmentId: 20, name: 'Neonatology',           hospitalId: 9,  hospitalName: 'LifeCare Maternity Hospital'   },
                    // MSBH
                    { departmentId: 21, name: 'Neurosurgery',          hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital'  },
                    { departmentId: 22, name: 'Spine Surgery',         hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital'  }
                ],
                users: [
                    // GCH
                    { userId: 1,  fullName: 'Global City Administrator',    email: 'gch.admin@hprs.com',        role: 'ADMIN',        hospitalId: 1, hospitalName: 'Global City Hospital',          active: true },
                    { userId: 2,  fullName: 'Dr. Emily Carter',             email: 'gch.dr.carter@hprs.com',    role: 'DOCTOR',       specialization: 'Cardiology Specialist',    departmentId: 2,  hospitalId: 1, hospitalName: 'Global City Hospital',          active: true },
                    { userId: 3,  fullName: 'Dr. Rajesh Sharma',            email: 'gch.dr.sharma@hprs.com',    role: 'DOCTOR',       specialization: 'Neurology Specialist',     departmentId: 3,  hospitalId: 1, hospitalName: 'Global City Hospital',          active: true },
                    { userId: 15, fullName: 'Dr. Priya Raman',              email: 'gch.dr.3@hprs.com',         role: 'DOCTOR',       specialization: 'General Medicine',         departmentId: 1,  hospitalId: 1, hospitalName: 'Global City Hospital',          active: true },
                    { userId: 16, fullName: 'Dr. Marcus Brody',             email: 'gch.dr.4@hprs.com',         role: 'DOCTOR',       specialization: 'Pulmonology',              departmentId: 1,  hospitalId: 1, hospitalName: 'Global City Hospital',          active: true },
                    { userId: 4,  fullName: 'Nurse Sarah Jenkins',          email: 'gch.nurse.sarah@hprs.com',  role: 'NURSE',        hospitalId: 1, hospitalName: 'Global City Hospital',          active: true },
                    { userId: 5,  fullName: 'Nurse David Miller',           email: 'gch.nurse.david@hprs.com',  role: 'NURSE',        hospitalId: 1, hospitalName: 'Global City Hospital',          active: true },
                    { userId: 6,  fullName: 'Mark Jenkins',                 email: 'gch.reception@hprs.com',    role: 'RECEPTIONIST', hospitalId: 1, hospitalName: 'Global City Hospital',          active: true },
                    // MCH
                    { userId: 7,  fullName: 'Municipal City Administrator', email: 'mch.admin@hprs.com',        role: 'ADMIN',        hospitalId: 2, hospitalName: 'Municipal City Hospital',        active: true },
                    { userId: 8,  fullName: 'Dr. James Rivera',             email: 'mch.dr.rivera@hprs.com',    role: 'DOCTOR',       specialization: 'Orthopedic Surgeon',       departmentId: 4,  hospitalId: 2, hospitalName: 'Municipal City Hospital',        active: true },
                    { userId: 9,  fullName: 'Dr. Anita Patel',              email: 'mch.dr.patel@hprs.com',     role: 'DOCTOR',       specialization: 'General Medicine',         departmentId: 5,  hospitalId: 2, hospitalName: 'Municipal City Hospital',        active: true },
                    { userId: 17, fullName: 'Dr. Sarah O\'Connor',          email: 'mch.dr.3@hprs.com',         role: 'DOCTOR',       specialization: 'Pediatrics Specialist',    departmentId: 5,  hospitalId: 2, hospitalName: 'Municipal City Hospital',        active: true },
                    { userId: 18, fullName: 'Dr. Tariq Mansoor',            email: 'mch.dr.4@hprs.com',         role: 'DOCTOR',       specialization: 'Dermatologist',            departmentId: 5,  hospitalId: 2, hospitalName: 'Municipal City Hospital',        active: true },
                    { userId: 10, fullName: 'Nurse Priya Nair',             email: 'mch.nurse.priya@hprs.com',  role: 'NURSE',        hospitalId: 2, hospitalName: 'Municipal City Hospital',        active: true },
                    { userId: 11, fullName: 'Rachel Green',                 email: 'mch.reception@hprs.com',    role: 'RECEPTIONIST', hospitalId: 2, hospitalName: 'Municipal City Hospital',        active: true },
                    // Legacy aliases
                    { userId: 12, fullName: 'Dr. Emily Carter',             email: 'doctor@hprs.com',           role: 'DOCTOR',       specialization: 'Cardiology Specialist',    departmentId: 2,  hospitalId: 1, hospitalName: 'Global City Hospital',          active: true },
                    { userId: 13, fullName: 'Global City Administrator',    email: 'admin@hprs.com',            role: 'ADMIN',        hospitalId: 1, hospitalName: 'Global City Hospital',          active: true },
                    { userId: 14, fullName: 'Dr. James Rivera',             email: 'dr.rivera@hprs.com',        role: 'DOCTOR',       specialization: 'Orthopedic Surgeon',       departmentId: 4,  hospitalId: 2, hospitalName: 'Municipal City Hospital',        active: true },
                    // SMC (Sunrise Medical Center) — IDs 20-26
                    { userId: 20, fullName: 'SMC Administrator',            email: 'smc.admin@hprs.com',        role: 'ADMIN',        hospitalId: 3, hospitalName: 'Sunrise Medical Center',         active: true },
                    { userId: 21, fullName: 'Dr. Victor Nguyen',            email: 'smc.dr.1@hprs.com',         role: 'DOCTOR',       specialization: 'Internal Medicine',        departmentId: 6,  hospitalId: 3, hospitalName: 'Sunrise Medical Center',         active: true },
                    { userId: 22, fullName: 'Dr. Aisha Okafor',             email: 'smc.dr.2@hprs.com',         role: 'DOCTOR',       specialization: 'Pulmonology',              departmentId: 7,  hospitalId: 3, hospitalName: 'Sunrise Medical Center',         active: true },
                    { userId: 23, fullName: 'Dr. Liam Hoffmann',            email: 'smc.dr.3@hprs.com',         role: 'DOCTOR',       specialization: 'General Surgery',          departmentId: 6,  hospitalId: 3, hospitalName: 'Sunrise Medical Center',         active: true },
                    { userId: 24, fullName: 'Dr. Preethi Subramaniam',      email: 'smc.dr.4@hprs.com',         role: 'DOCTOR',       specialization: 'Dermatology',              departmentId: 6,  hospitalId: 3, hospitalName: 'Sunrise Medical Center',         active: true },
                    { userId: 25, fullName: 'Nurse Bethany Cole',           email: 'smc.nurse@hprs.com',        role: 'NURSE',        hospitalId: 3, hospitalName: 'Sunrise Medical Center',         active: true },
                    { userId: 26, fullName: 'Owen Fletcher',                email: 'smc.reception@hprs.com',    role: 'RECEPTIONIST', hospitalId: 3, hospitalName: 'Sunrise Medical Center',         active: true },
                    // ASH (Apollo Speciality Hospital) — IDs 30-36
                    { userId: 30, fullName: 'ASH Administrator',            email: 'ash.admin@hprs.com',        role: 'ADMIN',        hospitalId: 4, hospitalName: 'Apollo Speciality Hospital',     active: true },
                    { userId: 31, fullName: 'Dr. Suresh Pillai',            email: 'ash.dr.1@hprs.com',         role: 'DOCTOR',       specialization: 'Orthopedic Surgeon',       departmentId: 8,  hospitalId: 4, hospitalName: 'Apollo Speciality Hospital',     active: true },
                    { userId: 32, fullName: 'Dr. Kavitha Reddy',            email: 'ash.dr.2@hprs.com',         role: 'DOCTOR',       specialization: 'Endocrinologist',          departmentId: 9,  hospitalId: 4, hospitalName: 'Apollo Speciality Hospital',     active: true },
                    { userId: 33, fullName: 'Dr. Mohammed Al-Farsi',        email: 'ash.dr.3@hprs.com',         role: 'DOCTOR',       specialization: 'Rheumatologist',           departmentId: 10, hospitalId: 4, hospitalName: 'Apollo Speciality Hospital',     active: true },
                    { userId: 34, fullName: 'Dr. Sandra Blackwell',         email: 'ash.dr.4@hprs.com',         role: 'DOCTOR',       specialization: 'Sports Medicine',          departmentId: 8,  hospitalId: 4, hospitalName: 'Apollo Speciality Hospital',     active: true },
                    { userId: 35, fullName: 'Nurse Amara Diallo',           email: 'ash.nurse@hprs.com',        role: 'NURSE',        hospitalId: 4, hospitalName: 'Apollo Speciality Hospital',     active: true },
                    { userId: 36, fullName: 'Ciara Murphy',                 email: 'ash.reception@hprs.com',    role: 'RECEPTIONIST', hospitalId: 4, hospitalName: 'Apollo Speciality Hospital',     active: true },
                    // CHI (City Heart Institute) — IDs 40-46
                    { userId: 40, fullName: 'CHI Administrator',            email: 'chi.admin@hprs.com',        role: 'ADMIN',        hospitalId: 5, hospitalName: 'City Heart Institute',           active: true },
                    { userId: 41, fullName: 'Dr. Aryan Kapoor',             email: 'chi.dr.1@hprs.com',         role: 'DOCTOR',       specialization: 'Interventional Cardiologist', departmentId: 11, hospitalId: 5, hospitalName: 'City Heart Institute',      active: true },
                    { userId: 42, fullName: 'Dr. Helena Vasquez',           email: 'chi.dr.2@hprs.com',         role: 'DOCTOR',       specialization: 'Cardiac Surgeon',          departmentId: 12, hospitalId: 5, hospitalName: 'City Heart Institute',           active: true },
                    { userId: 43, fullName: 'Dr. Benjamin Osei',            email: 'chi.dr.3@hprs.com',         role: 'DOCTOR',       specialization: 'Echocardiography',         departmentId: 11, hospitalId: 5, hospitalName: 'City Heart Institute',           active: true },
                    { userId: 44, fullName: 'Dr. Naina Krishnaswamy',       email: 'chi.dr.4@hprs.com',         role: 'DOCTOR',       specialization: 'Electrophysiology',        departmentId: 11, hospitalId: 5, hospitalName: 'City Heart Institute',           active: true },
                    { userId: 45, fullName: 'Nurse Fiona Walsh',            email: 'chi.nurse@hprs.com',        role: 'NURSE',        hospitalId: 5, hospitalName: 'City Heart Institute',           active: true },
                    { userId: 46, fullName: 'Tyler Evans',                  email: 'chi.reception@hprs.com',    role: 'RECEPTIONIST', hospitalId: 5, hospitalName: 'City Heart Institute',           active: true },
                    // GVCH (Greenview Community Hospital) — IDs 50-56
                    { userId: 50, fullName: 'GVCH Administrator',           email: 'gvch.admin@hprs.com',       role: 'ADMIN',        hospitalId: 6, hospitalName: 'Greenview Community Hospital',   active: true },
                    { userId: 51, fullName: 'Dr. Laura Mwangi',             email: 'gvch.dr.1@hprs.com',        role: 'DOCTOR',       specialization: 'General Practitioner',     departmentId: 13, hospitalId: 6, hospitalName: 'Greenview Community Hospital',   active: true },
                    { userId: 52, fullName: 'Dr. Tariq Hassan',             email: 'gvch.dr.2@hprs.com',        role: 'DOCTOR',       specialization: 'OB-GYN Specialist',        departmentId: 14, hospitalId: 6, hospitalName: 'Greenview Community Hospital',   active: true },
                    { userId: 53, fullName: 'Dr. Isabela Costa',            email: 'gvch.dr.3@hprs.com',        role: 'DOCTOR',       specialization: 'Pediatrics',               departmentId: 13, hospitalId: 6, hospitalName: 'Greenview Community Hospital',   active: true },
                    { userId: 54, fullName: 'Dr. Patrick Lorne',            email: 'gvch.dr.4@hprs.com',        role: 'DOCTOR',       specialization: 'Family Medicine',          departmentId: 13, hospitalId: 6, hospitalName: 'Greenview Community Hospital',   active: true },
                    { userId: 55, fullName: 'Nurse Grace Obi',              email: 'gvch.nurse@hprs.com',       role: 'NURSE',        hospitalId: 6, hospitalName: 'Greenview Community Hospital',   active: true },
                    { userId: 56, fullName: 'Sophia Barrett',               email: 'gvch.reception@hprs.com',   role: 'RECEPTIONIST', hospitalId: 6, hospitalName: 'Greenview Community Hospital',   active: true },
                    // STGH (St. Thomas General Hospital) — IDs 60-66
                    { userId: 60, fullName: 'STGH Administrator',           email: 'stgh.admin@hprs.com',       role: 'ADMIN',        hospitalId: 7, hospitalName: 'St. Thomas General Hospital',    active: true },
                    { userId: 61, fullName: 'Dr. Jonathan Reed',            email: 'stgh.dr.1@hprs.com',        role: 'DOCTOR',       specialization: 'Emergency Medicine',       departmentId: 15, hospitalId: 7, hospitalName: 'St. Thomas General Hospital',    active: true },
                    { userId: 62, fullName: 'Dr. Yuki Tanaka',              email: 'stgh.dr.2@hprs.com',        role: 'DOCTOR',       specialization: 'General Surgeon',          departmentId: 16, hospitalId: 7, hospitalName: 'St. Thomas General Hospital',    active: true },
                    { userId: 63, fullName: 'Dr. Chidi Eze',                email: 'stgh.dr.3@hprs.com',        role: 'DOCTOR',       specialization: 'Trauma Surgery',           departmentId: 16, hospitalId: 7, hospitalName: 'St. Thomas General Hospital',    active: true },
                    { userId: 64, fullName: 'Dr. Alicia Monroe',            email: 'stgh.dr.4@hprs.com',        role: 'DOCTOR',       specialization: 'Internal Medicine',        departmentId: 15, hospitalId: 7, hospitalName: 'St. Thomas General Hospital',    active: true },
                    { userId: 65, fullName: 'Nurse Hana Kim',               email: 'stgh.nurse@hprs.com',       role: 'NURSE',        hospitalId: 7, hospitalName: 'St. Thomas General Hospital',    active: true },
                    { userId: 66, fullName: 'Derek Ashby',                  email: 'stgh.reception@hprs.com',   role: 'RECEPTIONIST', hospitalId: 7, hospitalName: 'St. Thomas General Hospital',    active: true },
                    // NCC (National Cancer Centre) — IDs 70-76
                    { userId: 70, fullName: 'NCC Administrator',            email: 'ncc.admin@hprs.com',        role: 'ADMIN',        hospitalId: 8, hospitalName: 'National Cancer Centre',         active: true },
                    { userId: 71, fullName: 'Dr. Ramona Gheorghiu',         email: 'ncc.dr.1@hprs.com',         role: 'DOCTOR',       specialization: 'Medical Oncologist',       departmentId: 17, hospitalId: 8, hospitalName: 'National Cancer Centre',         active: true },
                    { userId: 72, fullName: 'Dr. Sanjay Mehta',             email: 'ncc.dr.2@hprs.com',         role: 'DOCTOR',       specialization: 'Radiation Oncologist',     departmentId: 18, hospitalId: 8, hospitalName: 'National Cancer Centre',         active: true },
                    { userId: 73, fullName: 'Dr. Alice Brennan',            email: 'ncc.dr.3@hprs.com',         role: 'DOCTOR',       specialization: 'Surgical Oncologist',      departmentId: 17, hospitalId: 8, hospitalName: 'National Cancer Centre',         active: true },
                    { userId: 74, fullName: 'Dr. Kenji Watanabe',           email: 'ncc.dr.4@hprs.com',         role: 'DOCTOR',       specialization: 'Hematology & Oncology',    departmentId: 17, hospitalId: 8, hospitalName: 'National Cancer Centre',         active: true },
                    { userId: 75, fullName: 'Nurse Carla Dominguez',        email: 'ncc.nurse@hprs.com',        role: 'NURSE',        hospitalId: 8, hospitalName: 'National Cancer Centre',         active: true },
                    { userId: 76, fullName: 'Felix Adeyemi',                email: 'ncc.reception@hprs.com',    role: 'RECEPTIONIST', hospitalId: 8, hospitalName: 'National Cancer Centre',         active: true },
                    // LMH (LifeCare Maternity Hospital) — IDs 80-86
                    { userId: 80, fullName: 'LMH Administrator',            email: 'lmh.admin@hprs.com',        role: 'ADMIN',        hospitalId: 9, hospitalName: 'LifeCare Maternity Hospital',    active: true },
                    { userId: 81, fullName: 'Dr. Priya Venkatesh',          email: 'lmh.dr.1@hprs.com',         role: 'DOCTOR',       specialization: 'Obstetrician & Gynaecologist', departmentId: 19, hospitalId: 9, hospitalName: 'LifeCare Maternity Hospital', active: true },
                    { userId: 82, fullName: 'Dr. Stella Obinna',            email: 'lmh.dr.2@hprs.com',         role: 'DOCTOR',       specialization: 'Maternal-Fetal Medicine',  departmentId: 19, hospitalId: 9, hospitalName: 'LifeCare Maternity Hospital',    active: true },
                    { userId: 83, fullName: 'Dr. Colm Gallagher',           email: 'lmh.dr.3@hprs.com',         role: 'DOCTOR',       specialization: 'Neonatologist',            departmentId: 20, hospitalId: 9, hospitalName: 'LifeCare Maternity Hospital',    active: true },
                    { userId: 84, fullName: 'Dr. Rashida Okonkwo',          email: 'lmh.dr.4@hprs.com',         role: 'DOCTOR',       specialization: 'Lactation & Postnatal Care', departmentId: 19, hospitalId: 9, hospitalName: 'LifeCare Maternity Hospital', active: true },
                    { userId: 85, fullName: 'Nurse Deepa Krishnan',         email: 'lmh.nurse@hprs.com',        role: 'NURSE',        hospitalId: 9, hospitalName: 'LifeCare Maternity Hospital',    active: true },
                    { userId: 86, fullName: 'Angeline Torres',              email: 'lmh.reception@hprs.com',    role: 'RECEPTIONIST', hospitalId: 9, hospitalName: 'LifeCare Maternity Hospital',    active: true },
                    // MSBH (Metro Spine & Brain Hospital) — IDs 90-96
                    { userId: 90, fullName: 'MSBH Administrator',           email: 'msbh.admin@hprs.com',       role: 'ADMIN',        hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital',  active: true },
                    { userId: 91, fullName: 'Dr. Ivan Petrov',              email: 'msbh.dr.1@hprs.com',        role: 'DOCTOR',       specialization: 'Neurosurgeon',             departmentId: 21, hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital', active: true },
                    { userId: 92, fullName: 'Dr. Zara Hussain',             email: 'msbh.dr.2@hprs.com',        role: 'DOCTOR',       specialization: 'Spine Surgeon',            departmentId: 22, hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital', active: true },
                    { userId: 93, fullName: 'Dr. Feng Li',                  email: 'msbh.dr.3@hprs.com',        role: 'DOCTOR',       specialization: 'Neurologist',              departmentId: 21, hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital', active: true },
                    { userId: 94, fullName: 'Dr. Margaret O\'Brien',        email: 'msbh.dr.4@hprs.com',        role: 'DOCTOR',       specialization: 'Neuro-Rehabilitation',     departmentId: 21, hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital', active: true },
                    { userId: 95, fullName: 'Nurse Leila Ahmadi',           email: 'msbh.nurse@hprs.com',       role: 'NURSE',        hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital',  active: true },
                    { userId: 96, fullName: 'Damien Cross',                 email: 'msbh.reception@hprs.com',   role: 'RECEPTIONIST', hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital',  active: true }
                ],
                patients: [
                    // ── Existing Patients (1-7, unchanged) ──────────────────────────────────
                    { patientId: 1,  uhid: 'UHID-2026-10001', aadhaarNumber: '123456781001', aadhaarMasked: 'XXXX-XXXX-1001', fullName: 'John Doe',           dateOfBirth: '1985-06-15', gender: 'Male',   phone: '5551234567', email: 'john.doe@example.com',       address: '789 Elm St, Cityville',              bloodGroup: 'O+',  allergies: 'Penicillin',                    emergencyContactName: 'Jane Doe',           emergencyContactPhone: '5559876543', registeredHospitalId: 1, registeredHospitalName: 'Global City Hospital',          createdAt: '2026-10-01T09:00:00.000Z' },
                    { patientId: 2,  uhid: 'UHID-2026-10002', aadhaarNumber: '123456781002', aadhaarMasked: 'XXXX-XXXX-1002', fullName: 'Sarah Connor',       dateOfBirth: '1990-11-20', gender: 'Female', phone: '5552345678', email: 'sarah.c@example.com',        address: '321 Oak St, Metro City',             bloodGroup: 'A-',  allergies: 'Sulfa Drugs',                   emergencyContactName: 'Kyle Reese',         emergencyContactPhone: '5558765432', registeredHospitalId: 1, registeredHospitalName: 'Global City Hospital',          createdAt: '2026-10-05T14:30:00.000Z' },
                    { patientId: 3,  uhid: 'UHID-2026-10003', aadhaarNumber: '123456781003', aadhaarMasked: 'XXXX-XXXX-1003', fullName: 'Robert Chen',        dateOfBirth: '1978-03-08', gender: 'Male',   phone: '5553456789', email: 'r.chen@example.com',         address: '555 Pine Rd, Westside',              bloodGroup: 'B+',  allergies: 'Dust, Peanuts',                 emergencyContactName: 'Lisa Chen',          emergencyContactPhone: '5557654321', registeredHospitalId: 2, registeredHospitalName: 'Municipal City Hospital',       createdAt: '2026-10-08T11:15:00.000Z' },
                    { patientId: 4,  uhid: 'UHID-2026-10004', aadhaarNumber: '123456781004', aadhaarMasked: 'XXXX-XXXX-1004', fullName: 'Priya Sharma',       dateOfBirth: '1995-04-12', gender: 'Female', phone: '5554567890', email: 'priya.s@example.com',        address: '101 Rosewood Ave, East',             bloodGroup: 'B+',  allergies: 'None',                          emergencyContactName: 'Ravi Sharma',        emergencyContactPhone: '5556543210', registeredHospitalId: 2, registeredHospitalName: 'Municipal City Hospital',       createdAt: '2026-10-09T09:00:00.000Z' },
                    { patientId: 5,  uhid: 'UHID-2026-10005', aadhaarNumber: '123456781005', aadhaarMasked: 'XXXX-XXXX-1005', fullName: 'Michael Brown',      dateOfBirth: '1974-08-25', gender: 'Male',   phone: '5555678901', email: 'michael.b@example.com',      address: '220 Maple Dr, Northgate',            bloodGroup: 'AB+', allergies: 'Aspirin',                       emergencyContactName: 'Carol Brown',        emergencyContactPhone: '5555432109', registeredHospitalId: 1, registeredHospitalName: 'Global City Hospital',          createdAt: '2026-10-09T10:00:00.000Z' },
                    { patientId: 6,  uhid: 'UHID-2026-10006', aadhaarNumber: '123456781006', aadhaarMasked: 'XXXX-XXXX-1006', fullName: 'Amina Khan',         dateOfBirth: '1982-12-03', gender: 'Female', phone: '5556789012', email: 'amina.k@example.com',        address: '44 Cedar Blvd, Southside',           bloodGroup: 'O-',  allergies: 'Latex',                         emergencyContactName: 'Omar Khan',          emergencyContactPhone: '5554321098', registeredHospitalId: 2, registeredHospitalName: 'Municipal City Hospital',       createdAt: '2026-10-10T08:00:00.000Z' },
                    { patientId: 7,  uhid: 'UHID-2026-10007', aadhaarNumber: '123456781007', aadhaarMasked: 'XXXX-XXXX-1007', fullName: 'David Wilson',       dateOfBirth: '1961-02-18', gender: 'Male',   phone: '5557890123', email: 'david.w@example.com',        address: '8 Birch Lane, Downtown',             bloodGroup: 'A+',  allergies: 'Shellfish',                     emergencyContactName: 'Mary Wilson',        emergencyContactPhone: '5553210987', registeredHospitalId: 2, registeredHospitalName: 'Municipal City Hospital',       createdAt: '2026-10-10T09:00:00.000Z' },
                    // ── New Patients (8-17) ─────────────────────────────────────────────────
                    { patientId: 8,  uhid: 'UHID-2026-10008', aadhaarNumber: '234567891008', aadhaarMasked: 'XXXX-XXXX-1008', fullName: 'Arjun Mehta',        dateOfBirth: '1972-03-22', gender: 'Male',   phone: '5558901234', email: 'arjun.m@example.com',        address: '14 Cardiac Way, Heartland',          bloodGroup: 'B+',  allergies: 'Aspirin, Ibuprofen',            emergencyContactName: 'Sunita Mehta',       emergencyContactPhone: '5559012345', registeredHospitalId: 5, registeredHospitalName: 'City Heart Institute',          createdAt: '2026-10-11T08:00:00.000Z' },
                    { patientId: 9,  uhid: 'UHID-2026-10009', aadhaarNumber: '234567891009', aadhaarMasked: 'XXXX-XXXX-1009', fullName: 'Fatima Al-Hassan',   dateOfBirth: '1996-07-14', gender: 'Female', phone: '5559012345', email: 'fatima.h@example.com',       address: '22 Crescent Ave, Midtown',           bloodGroup: 'A+',  allergies: 'None',                          emergencyContactName: 'Yusuf Al-Hassan',    emergencyContactPhone: '5550123456', registeredHospitalId: 9, registeredHospitalName: 'LifeCare Maternity Hospital',   createdAt: '2026-10-12T09:00:00.000Z' },
                    { patientId: 10, uhid: 'UHID-2026-10010', aadhaarNumber: '234567891010', aadhaarMasked: 'XXXX-XXXX-1010', fullName: 'Chen Wei',           dateOfBirth: '1980-11-05', gender: 'Male',   phone: '5550123456', email: 'chen.w@example.com',         address: '77 Dragon St, Chinatown',            bloodGroup: 'O+',  allergies: 'Codeine',                       emergencyContactName: 'Chen Mei',           emergencyContactPhone: '5551234560', registeredHospitalId: 10, registeredHospitalName: 'Metro Spine & Brain Hospital', createdAt: '2026-10-12T10:00:00.000Z' },
                    { patientId: 11, uhid: 'UHID-2026-10011', aadhaarNumber: '234567891011', aadhaarMasked: 'XXXX-XXXX-1011', fullName: 'Lakshmi Devi',       dateOfBirth: '1965-05-30', gender: 'Female', phone: '5551234560', email: 'lakshmi.d@example.com',      address: '5 Lotus Road, South Quarter',        bloodGroup: 'O-',  allergies: 'Sulfa Drugs, Morphine',         emergencyContactName: 'Rajan Devi',         emergencyContactPhone: '5552234561', registeredHospitalId: 8, registeredHospitalName: 'National Cancer Centre',        createdAt: '2026-10-13T08:00:00.000Z' },
                    { patientId: 12, uhid: 'UHID-2026-10012', aadhaarNumber: '234567891012', aadhaarMasked: 'XXXX-XXXX-1012', fullName: 'Thomas Anderson',    dateOfBirth: '1988-09-17', gender: 'Male',   phone: '5552234561', email: 'thomas.a@example.com',       address: '303 Matrix Ave, Neo City',           bloodGroup: 'A+',  allergies: 'Penicillin',                    emergencyContactName: 'Trinity Anderson',   emergencyContactPhone: '5553234562', registeredHospitalId: 4, registeredHospitalName: 'Apollo Speciality Hospital',    createdAt: '2026-10-13T09:00:00.000Z' },
                    { patientId: 13, uhid: 'UHID-2026-10013', aadhaarNumber: '234567891013', aadhaarMasked: 'XXXX-XXXX-1013', fullName: 'Nadia Petrov',       dateOfBirth: '1993-02-28', gender: 'Female', phone: '5553234562', email: 'nadia.p@example.com',        address: '12 Volga Street, Eastbridge',        bloodGroup: 'B-',  allergies: 'None',                          emergencyContactName: 'Alexei Petrov',      emergencyContactPhone: '5554234563', registeredHospitalId: 3, registeredHospitalName: 'Sunrise Medical Center',        createdAt: '2026-10-13T10:00:00.000Z' },
                    { patientId: 14, uhid: 'UHID-2026-10014', aadhaarNumber: '234567891014', aadhaarMasked: 'XXXX-XXXX-1014', fullName: 'Samuel Okonkwo',     dateOfBirth: '1977-08-10', gender: 'Male',   phone: '5554234563', email: 'samuel.o@example.com',       address: '90 Lagos Blvd, West End',            bloodGroup: 'AB+', allergies: 'Latex, NSAIDs',                 emergencyContactName: 'Chioma Okonkwo',     emergencyContactPhone: '5555234564', registeredHospitalId: 10, registeredHospitalName: 'Metro Spine & Brain Hospital', createdAt: '2026-10-14T08:00:00.000Z' },
                    { patientId: 15, uhid: 'UHID-2026-10015', aadhaarNumber: '234567891015', aadhaarMasked: 'XXXX-XXXX-1015', fullName: 'Isabella Romano',    dateOfBirth: '1984-04-19', gender: 'Female', phone: '5555234564', email: 'isabella.r@example.com',     address: '28 Via Roma, Little Italy',          bloodGroup: 'A-',  allergies: 'Aspirin',                       emergencyContactName: 'Marco Romano',       emergencyContactPhone: '5556234565', registeredHospitalId: 5, registeredHospitalName: 'City Heart Institute',          createdAt: '2026-10-14T09:00:00.000Z' },
                    { patientId: 16, uhid: 'UHID-2026-10016', aadhaarNumber: '234567891016', aadhaarMasked: 'XXXX-XXXX-1016', fullName: 'Ravi Kumar',         dateOfBirth: '1969-12-25', gender: 'Male',   phone: '5556234565', email: 'ravi.k@example.com',         address: '45 Nehru Nagar, Central',            bloodGroup: 'O+',  allergies: 'None',                          emergencyContactName: 'Meena Kumar',        emergencyContactPhone: '5557234566', registeredHospitalId: 1, registeredHospitalName: 'Global City Hospital',          createdAt: '2026-10-14T10:00:00.000Z' },
                    { patientId: 17, uhid: 'UHID-2026-10017', aadhaarNumber: '234567891017', aadhaarMasked: 'XXXX-XXXX-1017', fullName: 'Meera Nair',         dateOfBirth: '1991-06-08', gender: 'Female', phone: '5557234566', email: 'meera.n@example.com',        address: '19 Coconut Grove, Southside',        bloodGroup: 'B+',  allergies: 'Penicillin, Shellfish',         emergencyContactName: 'Suresh Nair',        emergencyContactPhone: '5558234567', registeredHospitalId: 9, registeredHospitalName: 'LifeCare Maternity Hospital',   createdAt: '2026-10-14T11:00:00.000Z' }
                ],
                appointments: [
                    // ── Existing Appointments (1-7) ──────────────────────────────────────────
                    { appointmentId: 1,  patientId: 1,  patientName: 'John Doe',          patientUhid: 'UHID-2026-10001', doctorId: 2,  doctorName: 'Dr. Emily Carter',       hospitalId: 1,  hospitalName: 'Global City Hospital',          appointmentDatetime: '2026-10-16T09:30', reason: 'Cardiology Routine Followup',              status: 'SCHEDULED', createdAt: '2026-10-09T08:00:00.000Z' },
                    { appointmentId: 2,  patientId: 2,  patientName: 'Sarah Connor',      patientUhid: 'UHID-2026-10002', doctorId: 3,  doctorName: 'Dr. Rajesh Sharma',      hospitalId: 1,  hospitalName: 'Global City Hospital',          appointmentDatetime: '2026-10-16T11:00', reason: 'Chronic Migraine & Neuro Screening',      status: 'SCHEDULED', createdAt: '2026-10-09T09:00:00.000Z' },
                    { appointmentId: 3,  patientId: 3,  patientName: 'Robert Chen',       patientUhid: 'UHID-2026-10003', doctorId: 8,  doctorName: 'Dr. James Rivera',       hospitalId: 2,  hospitalName: 'Municipal City Hospital',        appointmentDatetime: '2026-10-17T10:15', reason: 'Right Knee Arthroscopy Post-Op',           status: 'SCHEDULED', createdAt: '2026-10-09T10:00:00.000Z' },
                    { appointmentId: 4,  patientId: 4,  patientName: 'Priya Sharma',      patientUhid: 'UHID-2026-10004', doctorId: 9,  doctorName: 'Dr. Anita Patel',        hospitalId: 2,  hospitalName: 'Municipal City Hospital',        appointmentDatetime: '2026-10-17T14:00', reason: 'General Health Checkup',                  status: 'SCHEDULED', createdAt: '2026-10-09T11:00:00.000Z' },
                    { appointmentId: 5,  patientId: 5,  patientName: 'Michael Brown',     patientUhid: 'UHID-2026-10005', doctorId: 2,  doctorName: 'Dr. Emily Carter',       hospitalId: 1,  hospitalName: 'Global City Hospital',          appointmentDatetime: '2026-10-18T10:30', reason: 'Chest Tightness & Lipid Review',          status: 'SCHEDULED', createdAt: '2026-10-09T12:00:00.000Z' },
                    { appointmentId: 6,  patientId: 6,  patientName: 'Amina Khan',        patientUhid: 'UHID-2026-10006', doctorId: 8,  doctorName: 'Dr. James Rivera',       hospitalId: 2,  hospitalName: 'Municipal City Hospital',        appointmentDatetime: '2026-10-18T15:30', reason: 'Ankle Sprain Physical Therapy',           status: 'SCHEDULED', createdAt: '2026-10-09T13:00:00.000Z' },
                    { appointmentId: 7,  patientId: 7,  patientName: 'David Wilson',      patientUhid: 'UHID-2026-10007', doctorId: 9,  doctorName: 'Dr. Anita Patel',        hospitalId: 2,  hospitalName: 'Municipal City Hospital',        appointmentDatetime: '2026-10-19T11:15', reason: 'Type-2 Diabetes HbA1c Management',        status: 'SCHEDULED', createdAt: '2026-10-09T14:00:00.000Z' },
                    // ── New Appointments (8-27) ──────────────────────────────────────────────
                    { appointmentId: 8,  patientId: 8,  patientName: 'Arjun Mehta',       patientUhid: 'UHID-2026-10008', doctorId: 41, doctorName: 'Dr. Aryan Kapoor',       hospitalId: 5,  hospitalName: 'City Heart Institute',          appointmentDatetime: '2026-10-20T09:00', reason: 'Cardiac Stress Test & Echo Evaluation',  status: 'SCHEDULED', createdAt: '2026-10-11T08:00:00.000Z' },
                    { appointmentId: 9,  patientId: 9,  patientName: 'Fatima Al-Hassan',  patientUhid: 'UHID-2026-10009', doctorId: 81, doctorName: 'Dr. Priya Venkatesh',    hospitalId: 9,  hospitalName: 'LifeCare Maternity Hospital',   appointmentDatetime: '2026-10-20T10:30', reason: '28-Week Antenatal Checkup',               status: 'SCHEDULED', createdAt: '2026-10-12T09:00:00.000Z' },
                    { appointmentId: 10, patientId: 10, patientName: 'Chen Wei',          patientUhid: 'UHID-2026-10010', doctorId: 91, doctorName: 'Dr. Ivan Petrov',        hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital',  appointmentDatetime: '2026-10-21T11:00', reason: 'Cranial MRI Review — Seizure History',   status: 'SCHEDULED', createdAt: '2026-10-12T10:00:00.000Z' },
                    { appointmentId: 11, patientId: 10, patientName: 'Chen Wei',          patientUhid: 'UHID-2026-10010', doctorId: 2,  doctorName: 'Dr. Emily Carter',       hospitalId: 1,  hospitalName: 'Global City Hospital',          appointmentDatetime: '2026-10-22T14:00', reason: 'Referral Follow-up — General Medicine',  status: 'COMPLETED', createdAt: '2026-10-12T10:30:00.000Z' },
                    { appointmentId: 12, patientId: 11, patientName: 'Lakshmi Devi',      patientUhid: 'UHID-2026-10011', doctorId: 71, doctorName: 'Dr. Ramona Gheorghiu',   hospitalId: 8,  hospitalName: 'National Cancer Centre',         appointmentDatetime: '2026-10-21T09:30', reason: 'Breast Cancer Screening & Biopsy',       status: 'SCHEDULED', createdAt: '2026-10-13T08:00:00.000Z' },
                    { appointmentId: 13, patientId: 12, patientName: 'Thomas Anderson',   patientUhid: 'UHID-2026-10012', doctorId: 31, doctorName: 'Dr. Suresh Pillai',      hospitalId: 4,  hospitalName: 'Apollo Speciality Hospital',    appointmentDatetime: '2026-10-22T10:00', reason: 'ACL Reconstruction Post-Op Review',      status: 'SCHEDULED', createdAt: '2026-10-13T09:00:00.000Z' },
                    { appointmentId: 14, patientId: 12, patientName: 'Thomas Anderson',   patientUhid: 'UHID-2026-10012', doctorId: 8,  doctorName: 'Dr. James Rivera',       hospitalId: 2,  hospitalName: 'Municipal City Hospital',        appointmentDatetime: '2026-10-24T15:00', reason: 'Second Opinion — Knee Ligament',         status: 'SCHEDULED', createdAt: '2026-10-13T09:30:00.000Z' },
                    { appointmentId: 15, patientId: 13, patientName: 'Nadia Petrov',      patientUhid: 'UHID-2026-10013', doctorId: 21, doctorName: 'Dr. Victor Nguyen',      hospitalId: 3,  hospitalName: 'Sunrise Medical Center',         appointmentDatetime: '2026-10-23T09:00', reason: 'Routine Annual Wellness Exam',           status: 'SCHEDULED', createdAt: '2026-10-13T10:00:00.000Z' },
                    { appointmentId: 16, patientId: 14, patientName: 'Samuel Okonkwo',   patientUhid: 'UHID-2026-10014', doctorId: 92, doctorName: 'Dr. Zara Hussain',       hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital',  appointmentDatetime: '2026-10-23T11:00', reason: 'L4-L5 Disc Herniation Consultation',     status: 'SCHEDULED', createdAt: '2026-10-14T08:00:00.000Z' },
                    { appointmentId: 17, patientId: 15, patientName: 'Isabella Romano',  patientUhid: 'UHID-2026-10015', doctorId: 41, doctorName: 'Dr. Aryan Kapoor',       hospitalId: 5,  hospitalName: 'City Heart Institute',          appointmentDatetime: '2026-10-24T09:30', reason: 'Palpitations & Holter Monitor Review',  status: 'SCHEDULED', createdAt: '2026-10-14T09:00:00.000Z' },
                    { appointmentId: 18, patientId: 15, patientName: 'Isabella Romano',  patientUhid: 'UHID-2026-10015', doctorId: 2,  doctorName: 'Dr. Emily Carter',       hospitalId: 1,  hospitalName: 'Global City Hospital',          appointmentDatetime: '2026-10-14T16:00', reason: 'Emergency Cardiology Consult (GCH)',     status: 'COMPLETED', createdAt: '2026-10-14T09:30:00.000Z' },
                    { appointmentId: 19, patientId: 16, patientName: 'Ravi Kumar',        patientUhid: 'UHID-2026-10016', doctorId: 2,  doctorName: 'Dr. Emily Carter',       hospitalId: 1,  hospitalName: 'Global City Hospital',          appointmentDatetime: '2026-10-25T08:30', reason: 'HbA1c Review & Insulin Dose Adjustment', status: 'SCHEDULED', createdAt: '2026-10-14T10:00:00.000Z' },
                    { appointmentId: 20, patientId: 16, patientName: 'Ravi Kumar',        patientUhid: 'UHID-2026-10016', doctorId: 32, doctorName: 'Dr. Kavitha Reddy',      hospitalId: 4,  hospitalName: 'Apollo Speciality Hospital',    appointmentDatetime: '2026-10-27T10:00', reason: 'Diabetic Nephropathy Consult',           status: 'SCHEDULED', createdAt: '2026-10-14T10:30:00.000Z' },
                    { appointmentId: 21, patientId: 17, patientName: 'Meera Nair',        patientUhid: 'UHID-2026-10017', doctorId: 81, doctorName: 'Dr. Priya Venkatesh',    hospitalId: 9,  hospitalName: 'LifeCare Maternity Hospital',   appointmentDatetime: '2026-10-26T09:00', reason: '32-Week OB-GYN Checkup',                 status: 'SCHEDULED', createdAt: '2026-10-14T11:00:00.000Z' },
                    { appointmentId: 22, patientId: 17, patientName: 'Meera Nair',        patientUhid: 'UHID-2026-10017', doctorId: 52, doctorName: 'Dr. Tariq Hassan',       hospitalId: 6,  hospitalName: 'Greenview Community Hospital',  appointmentDatetime: '2026-10-29T10:00', reason: 'OB-GYN Community Follow-up',             status: 'SCHEDULED', createdAt: '2026-10-14T11:30:00.000Z' }
                ],
                visits: [
                    // ── Existing Visits (1-2) ────────────────────────────────────────────────
                    {
                        visitId: 1, patientId: 2, patientName: 'Sarah Connor', patientUhid: 'UHID-2026-10002',
                        doctorId: 3, doctorName: 'Dr. Rajesh Sharma', hospitalId: 1, hospitalName: 'Global City Hospital',
                        visitDate: '2026-10-10T11:30:00.000Z',
                        symptoms: 'Recurring migraine episodes, photophobia, nausea',
                        vitals: 'BP: 130/85 mmHg, Pulse: 76 bpm, Temp: 98.4F, SpO2: 98%',
                        diagnosis: 'Chronic Migraine with Aura — Stage II',
                        notes: 'Avoid bright screens before sleep.',
                        prescriptions: [
                            { prescriptionId: 1, medicineName: 'Sumatriptan',   dosage: '50 mg',  frequency: 'As needed',          duration: '30 Days', instructions: 'Take at onset of migraine' }
                        ],
                        labTests: [{ labTestId: 1, testName: 'MRI Brain (with contrast)', result: 'Pending', status: 'ORDERED' }],
                        reports: [
                            { reportId: 'R1-001', reportType: 'MRI', reportDate: '2026-10-11', results: 'No acute intracranial abnormality; mild periventricular white matter changes consistent with migraine pathology.', status: 'AVAILABLE', orderedBy: 'Dr. Rajesh Sharma' }
                        ]
                    },
                    {
                        visitId: 2, patientId: 1, patientName: 'John Doe', patientUhid: 'UHID-2026-10001',
                        doctorId: 2, doctorName: 'Dr. Emily Carter', hospitalId: 1, hospitalName: 'Global City Hospital',
                        visitDate: '2026-10-12T09:30:00.000Z',
                        symptoms: 'Occasional chest tightness, shortness of breath on exertion',
                        vitals: 'BP: 142/90 mmHg, Pulse: 82 bpm, Temp: 98.6F, SpO2: 97%',
                        diagnosis: 'Stage 1 Hypertension — Lipid Profile Abnormal',
                        notes: 'Low sodium diet. 30 mins brisk walk daily. Reduce processed foods.',
                        prescriptions: [
                            { prescriptionId: 2, medicineName: 'Amlodipine Besylate', dosage: '5 mg',  frequency: 'Once daily (Morning)', duration: '60 Days', instructions: 'Take with water after breakfast' },
                            { prescriptionId: 3, medicineName: 'Rosuvastatin',         dosage: '10 mg', frequency: 'Once daily (Night)',   duration: '60 Days', instructions: 'Avoid grapefruit juice' }
                        ],
                        labTests: [
                            { labTestId: 2, testName: 'ECG',         result: 'Normal sinus rhythm',  status: 'COMPLETED' },
                            { labTestId: 3, testName: 'Lipid Panel', result: 'LDL 160 mg/dL (High)', status: 'COMPLETED' }
                        ],
                        reports: [
                            { reportId: 'R2-001', reportType: 'ECG',        reportDate: '2026-10-12', results: 'Normal sinus rhythm. HR 82 bpm. No ST-segment changes.', status: 'AVAILABLE', orderedBy: 'Dr. Emily Carter' },
                            { reportId: 'R2-002', reportType: 'Blood Test', reportDate: '2026-10-12', results: 'Total Cholesterol: 240 mg/dL; LDL: 160 mg/dL (High); HDL: 42 mg/dL; Triglycerides: 190 mg/dL.', status: 'AVAILABLE', orderedBy: 'Dr. Emily Carter' }
                        ]
                    },
                    // ── New Visits (3-14) ────────────────────────────────────────────────────
                    {
                        visitId: 3, patientId: 8, patientName: 'Arjun Mehta', patientUhid: 'UHID-2026-10008',
                        doctorId: 41, doctorName: 'Dr. Aryan Kapoor', hospitalId: 5, hospitalName: 'City Heart Institute',
                        visitDate: '2026-10-20T09:30:00.000Z',
                        symptoms: 'Exertional chest pain, dyspnoea on climbing stairs, occasional palpitations',
                        vitals: 'BP: 158/96 mmHg, Pulse: 88 bpm, Temp: 98.6F, SpO2: 96%, Weight: 87 kg',
                        diagnosis: 'Stable Angina Pectoris — Coronary Artery Disease (2-vessel)',
                        notes: 'Patient advised cardiac rehab programme. Statin therapy initiated. Angiogram scheduled.',
                        prescriptions: [
                            { prescriptionId: 10, medicineName: 'Metoprolol Succinate', dosage: '25 mg',  frequency: 'Once daily (Morning)', duration: '90 Days', instructions: 'Do not stop abruptly' },
                            { prescriptionId: 11, medicineName: 'Atorvastatin',         dosage: '40 mg',  frequency: 'Once daily (Night)',   duration: '90 Days', instructions: 'Report any muscle pain' },
                            { prescriptionId: 12, medicineName: 'Aspirin',              dosage: '75 mg',  frequency: 'Once daily',           duration: '90 Days', instructions: 'Take after food' }
                        ],
                        labTests: [
                            { labTestId: 10, testName: 'Echocardiogram',          result: 'EF 50%, mild hypokinesia anterolateral wall', status: 'COMPLETED' },
                            { labTestId: 11, testName: 'Troponin I',              result: '0.02 ng/mL (Normal)',                          status: 'COMPLETED' },
                            { labTestId: 12, testName: 'Coronary Angiogram',      result: 'Pending — scheduled 2026-10-28',               status: 'ORDERED'   }
                        ],
                        reports: [
                            { reportId: 'R3-001', reportType: 'ECG',   reportDate: '2026-10-20', results: 'ST depression 1 mm in leads V4-V6 on stress testing. Suggestive of ischaemia.', status: 'AVAILABLE', orderedBy: 'Dr. Aryan Kapoor' },
                            { reportId: 'R3-002', reportType: 'Blood Test', reportDate: '2026-10-20', results: 'Troponin I: 0.02 ng/mL; CK-MB: 18 U/L; BNP: 95 pg/mL. Lipid panel: LDL 178 mg/dL (High).', status: 'AVAILABLE', orderedBy: 'Dr. Aryan Kapoor' }
                        ]
                    },
                    {
                        visitId: 4, patientId: 9, patientName: 'Fatima Al-Hassan', patientUhid: 'UHID-2026-10009',
                        doctorId: 81, doctorName: 'Dr. Priya Venkatesh', hospitalId: 9, hospitalName: 'LifeCare Maternity Hospital',
                        visitDate: '2026-10-20T10:30:00.000Z',
                        symptoms: 'Mild ankle swelling, back pain, fetal movements normal. 28-week antenatal visit.',
                        vitals: 'BP: 118/74 mmHg, Pulse: 78 bpm, Temp: 98.4F, SpO2: 99%, Weight: 68 kg',
                        diagnosis: 'Normal Intrauterine Pregnancy — 28 Weeks Gestational Age',
                        notes: 'Iron supplementation continued. Glucose tolerance test completed. Next visit at 32 weeks.',
                        prescriptions: [
                            { prescriptionId: 13, medicineName: 'Ferrous Sulphate',    dosage: '200 mg', frequency: 'Twice daily',          duration: '60 Days', instructions: 'Take on empty stomach with orange juice' },
                            { prescriptionId: 14, medicineName: 'Folic Acid',          dosage: '5 mg',   frequency: 'Once daily',           duration: '60 Days', instructions: 'Continue as prescribed' }
                        ],
                        labTests: [
                            { labTestId: 13, testName: 'Glucose Tolerance Test (GTT)', result: '1-hr: 140 mg/dL (borderline)',  status: 'COMPLETED' },
                            { labTestId: 14, testName: 'Anomaly Ultrasound',           result: 'Normal fetal anatomy; 28w3d',   status: 'COMPLETED' }
                        ],
                        reports: [
                            { reportId: 'R4-001', reportType: 'Ultrasound', reportDate: '2026-10-20', results: 'Single live fetus, cephalic presentation. BPD 71mm, FL 54mm. AFI 14cm (normal). Placenta posterior.', status: 'AVAILABLE', orderedBy: 'Dr. Priya Venkatesh' },
                            { reportId: 'R4-002', reportType: 'Blood Test', reportDate: '2026-10-20', results: 'Hb: 10.8 g/dL (mild anaemia); MCV: 72 fL; Ferritin: 8 ng/mL (low). GTT 1-hr: 140 mg/dL.', status: 'AVAILABLE', orderedBy: 'Dr. Priya Venkatesh' }
                        ]
                    },
                    {
                        visitId: 5, patientId: 10, patientName: 'Chen Wei', patientUhid: 'UHID-2026-10010',
                        doctorId: 91, doctorName: 'Dr. Ivan Petrov', hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital',
                        visitDate: '2026-10-21T11:00:00.000Z',
                        symptoms: 'Two episodes of generalised tonic-clonic seizure in the past 3 months, post-ictal confusion lasting 10 mins',
                        vitals: 'BP: 124/80 mmHg, Pulse: 72 bpm, Temp: 98.4F, SpO2: 99%',
                        diagnosis: 'New-Onset Epilepsy — Idiopathic Generalised (rule out structural cause)',
                        notes: 'Anti-epileptic medication initiated. Patient advised not to drive. EEG and MRI brain ordered.',
                        prescriptions: [
                            { prescriptionId: 15, medicineName: 'Levetiracetam',  dosage: '500 mg', frequency: 'Twice daily',          duration: '90 Days', instructions: 'Do not stop without medical advice' },
                            { prescriptionId: 16, medicineName: 'Clonazepam',     dosage: '0.5 mg', frequency: 'Once daily (Night)',   duration: '30 Days', instructions: 'Avoid alcohol' }
                        ],
                        labTests: [
                            { labTestId: 15, testName: 'MRI Brain (with contrast)', result: 'Pending',                           status: 'ORDERED'   },
                            { labTestId: 16, testName: 'EEG',                       result: 'Generalised spike-wave discharges', status: 'COMPLETED' },
                            { labTestId: 17, testName: 'Serum Electrolytes',        result: 'Na 138, K 4.1, Ca 9.2 — Normal',   status: 'COMPLETED' }
                        ],
                        reports: [
                            { reportId: 'R5-001', reportType: 'MRI', reportDate: '2026-10-22', results: 'Pending — MRI brain with contrast scheduled; prior CT showed no haemorrhage or mass lesion.', status: 'PENDING', orderedBy: 'Dr. Ivan Petrov' },
                            { reportId: 'R5-002', reportType: 'Blood Test', reportDate: '2026-10-21', results: 'Electrolytes normal. Fasting glucose 94 mg/dL. LFT and RFT within normal limits.', status: 'AVAILABLE', orderedBy: 'Dr. Ivan Petrov' }
                        ]
                    },
                    {
                        visitId: 6, patientId: 10, patientName: 'Chen Wei', patientUhid: 'UHID-2026-10010',
                        doctorId: 2, doctorName: 'Dr. Emily Carter', hospitalId: 1, hospitalName: 'Global City Hospital',
                        visitDate: '2026-10-22T14:00:00.000Z',
                        symptoms: 'Referred from MSBH. Incidental hypertension noted during seizure workup. No symptoms of hypertensive urgency.',
                        vitals: 'BP: 148/94 mmHg, Pulse: 76 bpm, Temp: 98.6F, SpO2: 98%',
                        diagnosis: 'Stage 1 Hypertension — Secondary Evaluation (Renal Profile Normal)',
                        notes: 'Lifestyle modification advised. BP log to be maintained. Review in 4 weeks.',
                        prescriptions: [
                            { prescriptionId: 17, medicineName: 'Amlodipine',  dosage: '5 mg',  frequency: 'Once daily',           duration: '60 Days', instructions: 'Monitor BP daily' },
                            { prescriptionId: 18, medicineName: 'Losartan',    dosage: '50 mg', frequency: 'Once daily (Morning)', duration: '60 Days', instructions: 'Avoid high-potassium foods' }
                        ],
                        labTests: [
                            { labTestId: 18, testName: 'Renal Function Test', result: 'Creatinine 0.9 mg/dL — Normal', status: 'COMPLETED' },
                            { labTestId: 19, testName: 'Urine Microalbumin',  result: '12 mg/g — Normal',              status: 'COMPLETED' }
                        ],
                        reports: [
                            { reportId: 'R6-001', reportType: 'Blood Test', reportDate: '2026-10-22', results: 'RFT: Creatinine 0.9, Urea 28 mg/dL, eGFR 92 mL/min — Normal. Electrolytes balanced.', status: 'AVAILABLE', orderedBy: 'Dr. Emily Carter' }
                        ]
                    },
                    {
                        visitId: 7, patientId: 11, patientName: 'Lakshmi Devi', patientUhid: 'UHID-2026-10011',
                        doctorId: 71, doctorName: 'Dr. Ramona Gheorghiu', hospitalId: 8, hospitalName: 'National Cancer Centre',
                        visitDate: '2026-10-21T09:30:00.000Z',
                        symptoms: 'Painless lump in right breast, noticed 3 weeks ago. No nipple discharge. Family history of breast cancer.',
                        vitals: 'BP: 122/78 mmHg, Pulse: 74 bpm, Temp: 98.4F, SpO2: 99%, Weight: 62 kg',
                        diagnosis: 'Suspicious Right Breast Mass — Biopsy Pending (BI-RADS 4B)',
                        notes: 'Core needle biopsy performed. Genetic counselling referred. Patient counselled regarding findings.',
                        prescriptions: [
                            { prescriptionId: 19, medicineName: 'Ondansetron',  dosage: '4 mg',   frequency: 'As needed (nausea)', duration: '14 Days', instructions: 'Post-procedure nausea relief' },
                            { prescriptionId: 20, medicineName: 'Paracetamol',  dosage: '500 mg', frequency: 'Three times daily', duration: '5 Days',  instructions: 'For post-biopsy discomfort' }
                        ],
                        labTests: [
                            { labTestId: 20, testName: 'Mammography (Bilateral)',  result: 'BI-RADS 4B — Right breast 1.8 cm irregular mass', status: 'COMPLETED' },
                            { labTestId: 21, testName: 'Core Needle Biopsy',       result: 'Pending histopathology',                          status: 'ORDERED'   },
                            { labTestId: 22, testName: 'Tumour Markers (CA 15-3)', result: 'CA 15-3: 32 U/mL (Borderline)',                   status: 'COMPLETED' }
                        ],
                        reports: [
                            { reportId: 'R7-001', reportType: 'X-Ray',      reportDate: '2026-10-21', results: 'Mammogram: Right breast — irregular spiculated mass 1.8cm at 10 o\'clock position. Microcalcifications present. BI-RADS 4B.', status: 'AVAILABLE', orderedBy: 'Dr. Ramona Gheorghiu' },
                            { reportId: 'R7-002', reportType: 'Blood Test', reportDate: '2026-10-21', results: 'CA 15-3: 32 U/mL (mild elevation). CEA: 2.1 ng/mL (normal). CBC: Hb 11.4 g/dL, WBC 7800.', status: 'AVAILABLE', orderedBy: 'Dr. Ramona Gheorghiu' }
                        ]
                    },
                    {
                        visitId: 8, patientId: 12, patientName: 'Thomas Anderson', patientUhid: 'UHID-2026-10012',
                        doctorId: 31, doctorName: 'Dr. Suresh Pillai', hospitalId: 4, hospitalName: 'Apollo Speciality Hospital',
                        visitDate: '2026-10-22T10:00:00.000Z',
                        symptoms: 'Post-ACL reconstruction. 6 weeks post-op. Mild stiffness, achieving 90° flexion. No fever, no wound issues.',
                        vitals: 'BP: 118/76 mmHg, Pulse: 68 bpm, Temp: 98.4F, SpO2: 99%',
                        diagnosis: 'Post-ACL Reconstruction (Right Knee) — Week 6 Rehabilitation Review',
                        notes: 'Physiotherapy progressing well. Full weight bearing achieved. Target 120° flexion by week 10.',
                        prescriptions: [
                            { prescriptionId: 21, medicineName: 'Celecoxib',    dosage: '200 mg', frequency: 'Twice daily',  duration: '14 Days', instructions: 'Take with food. Avoid if allergic to sulfa.' },
                            { prescriptionId: 22, medicineName: 'Calcium+D3',   dosage: '500 mg', frequency: 'Once daily',   duration: '60 Days', instructions: 'Take after meals' }
                        ],
                        labTests: [
                            { labTestId: 23, testName: 'X-Ray Right Knee (AP/Lateral)', result: 'Graft tunnel in good position; no hardware complications', status: 'COMPLETED' },
                            { labTestId: 24, testName: 'CRP',                            result: '8 mg/L (Mildly elevated)',                                status: 'COMPLETED' }
                        ],
                        reports: [
                            { reportId: 'R8-001', reportType: 'X-Ray', reportDate: '2026-10-22', results: 'Right knee X-ray: ACL graft tunnel placement satisfactory. Tibial and femoral tunnels well positioned. No fracture or effusion.', status: 'AVAILABLE', orderedBy: 'Dr. Suresh Pillai' }
                        ]
                    },
                    {
                        visitId: 9, patientId: 12, patientName: 'Thomas Anderson', patientUhid: 'UHID-2026-10012',
                        doctorId: 8, doctorName: 'Dr. James Rivera', hospitalId: 2, hospitalName: 'Municipal City Hospital',
                        visitDate: '2026-10-24T15:00:00.000Z',
                        symptoms: 'Second opinion for ACL surgery outcome. Persistent lateral pain at 6 weeks post-op.',
                        vitals: 'BP: 120/78 mmHg, Pulse: 70 bpm, Temp: 98.6F, SpO2: 99%',
                        diagnosis: 'Post-ACL Reconstruction — Lateral Compartment Syndrome (early). Second Opinion Confirmed Good Graft Position.',
                        notes: 'Lateral knee pain attributed to IT band tightness. Foam rolling and stretching protocol recommended. No re-operation needed.',
                        prescriptions: [
                            { prescriptionId: 23, medicineName: 'Diclofenac Gel',   dosage: '1%',    frequency: 'Three times daily (topical)', duration: '14 Days', instructions: 'Apply to outer knee area' }
                        ],
                        labTests: [
                            { labTestId: 25, testName: 'MRI Right Knee', result: 'Intact graft. Mild lateral soft tissue oedema.', status: 'COMPLETED' }
                        ],
                        reports: [
                            { reportId: 'R9-001', reportType: 'MRI', reportDate: '2026-10-24', results: 'MRI Right Knee: ACL graft intact with normal signal. Mild lateral soft tissue oedema consistent with IT band syndrome. No re-tear.', status: 'AVAILABLE', orderedBy: 'Dr. James Rivera' }
                        ]
                    },
                    {
                        visitId: 10, patientId: 13, patientName: 'Nadia Petrov', patientUhid: 'UHID-2026-10013',
                        doctorId: 21, doctorName: 'Dr. Victor Nguyen', hospitalId: 3, hospitalName: 'Sunrise Medical Center',
                        visitDate: '2026-10-23T09:00:00.000Z',
                        symptoms: 'Annual check-up. Mild fatigue, occasional headaches. No specific complaints.',
                        vitals: 'BP: 116/72 mmHg, Pulse: 64 bpm, Temp: 98.4F, SpO2: 99%, Weight: 58 kg',
                        diagnosis: 'Mild Iron-Deficiency Anaemia — Otherwise Healthy Young Adult',
                        notes: 'Iron supplementation prescribed. Dietary advice given (leafy greens, lentils). Recheck CBC in 6 weeks.',
                        prescriptions: [
                            { prescriptionId: 24, medicineName: 'Ferrous Gluconate', dosage: '300 mg', frequency: 'Once daily',  duration: '42 Days', instructions: 'Take with vitamin C for better absorption' },
                            { prescriptionId: 25, medicineName: 'Multivitamin',      dosage: '1 tab',  frequency: 'Once daily',  duration: '42 Days', instructions: 'Take after breakfast' }
                        ],
                        labTests: [
                            { labTestId: 26, testName: 'Complete Blood Count (CBC)', result: 'Hb: 10.2 g/dL, MCV 70 fL, MCH 22 pg', status: 'COMPLETED' },
                            { labTestId: 27, testName: 'Serum Ferritin',             result: '6 ng/mL (Low)',                       status: 'COMPLETED' }
                        ],
                        reports: [
                            { reportId: 'R10-001', reportType: 'Blood Test', reportDate: '2026-10-23', results: 'CBC: Hb 10.2 g/dL (Low), WBC 6400, Plt 280k. MCV 70 fL, MCH 22 pg — Microcytic hypochromic anaemia. Ferritin 6 ng/mL (severely low).', status: 'AVAILABLE', orderedBy: 'Dr. Victor Nguyen' }
                        ]
                    },
                    {
                        visitId: 11, patientId: 14, patientName: 'Samuel Okonkwo', patientUhid: 'UHID-2026-10014',
                        doctorId: 92, doctorName: 'Dr. Zara Hussain', hospitalId: 10, hospitalName: 'Metro Spine & Brain Hospital',
                        visitDate: '2026-10-23T11:00:00.000Z',
                        symptoms: 'Lower back pain radiating to left leg (sciatica), tingling in left foot, difficulty standing >15 mins. 3-month history.',
                        vitals: 'BP: 128/84 mmHg, Pulse: 74 bpm, Temp: 98.4F, SpO2: 99%',
                        diagnosis: 'L4-L5 Disc Herniation with Left-Sided Sciatica — Conservative Management First',
                        notes: 'Epidural steroid injection offered. Patient chose conservative management first. Physiotherapy referred.',
                        prescriptions: [
                            { prescriptionId: 26, medicineName: 'Pregabalin',         dosage: '75 mg',  frequency: 'Twice daily',       duration: '30 Days', instructions: 'May cause drowsiness — avoid driving' },
                            { prescriptionId: 27, medicineName: 'Methocarbamol',       dosage: '750 mg', frequency: 'Three times daily', duration: '14 Days', instructions: 'Short-term muscle relaxant' },
                            { prescriptionId: 28, medicineName: 'Pantoprazole',        dosage: '40 mg',  frequency: 'Once daily (Morning)', duration: '30 Days', instructions: 'Gastric protection' }
                        ],
                        labTests: [
                            { labTestId: 28, testName: 'MRI Lumbosacral Spine',   result: 'L4-L5 broad-based disc herniation with left neural foraminal narrowing', status: 'COMPLETED' },
                            { labTestId: 29, testName: 'Nerve Conduction Study',   result: 'Mild left L5 radiculopathy',                                             status: 'COMPLETED' }
                        ],
                        reports: [
                            { reportId: 'R11-001', reportType: 'MRI', reportDate: '2026-10-23', results: 'MRI LS Spine: L4-L5 broad-based disc herniation causing left-sided neural foraminal narrowing. Moderate compression of left L5 nerve root. L5-S1 mild bulge without compression.', status: 'AVAILABLE', orderedBy: 'Dr. Zara Hussain' },
                            { reportId: 'R11-002', reportType: 'Blood Test', reportDate: '2026-10-23', results: 'Inflammatory markers: CRP 4 mg/L, ESR 18 mm/hr — normal. Vitamin D: 18 ng/mL (insufficient). Calcium normal.', status: 'AVAILABLE', orderedBy: 'Dr. Zara Hussain' }
                        ]
                    },
                    {
                        visitId: 12, patientId: 15, patientName: 'Isabella Romano', patientUhid: 'UHID-2026-10015',
                        doctorId: 2, doctorName: 'Dr. Emily Carter', hospitalId: 1, hospitalName: 'Global City Hospital',
                        visitDate: '2026-10-14T16:00:00.000Z',
                        symptoms: 'Sudden-onset palpitations, heart racing, associated lightheadedness. Episode lasted 20 minutes. First occurrence.',
                        vitals: 'BP: 102/68 mmHg, Pulse: 142 bpm (irregular), Temp: 98.4F, SpO2: 97%',
                        diagnosis: 'Paroxysmal Atrial Fibrillation — First Episode. Haemodynamically Stable.',
                        notes: 'Spontaneous cardioversion to sinus rhythm within 1 hour. Holter monitor applied. Cardiology referral (CHI) made.',
                        prescriptions: [
                            { prescriptionId: 29, medicineName: 'Bisoprolol',      dosage: '2.5 mg', frequency: 'Once daily (Morning)', duration: '30 Days', instructions: 'Monitor heart rate; hold if <50 bpm' },
                            { prescriptionId: 30, medicineName: 'Apixaban',        dosage: '5 mg',   frequency: 'Twice daily',          duration: '30 Days', instructions: 'Anticoagulant — avoid alcohol' }
                        ],
                        labTests: [
                            { labTestId: 30, testName: 'ECG (12-lead)',      result: 'Sinus rhythm restored; no delta waves', status: 'COMPLETED' },
                            { labTestId: 31, testName: 'Thyroid Function (TSH)', result: 'TSH 0.8 mIU/L — Normal',           status: 'COMPLETED' }
                        ],
                        reports: [
                            { reportId: 'R12-001', reportType: 'ECG',        reportDate: '2026-10-14', results: 'Initial ECG: Atrial fibrillation with rapid ventricular response (142 bpm). Repeat ECG post-1hr: Normal sinus rhythm, 72 bpm, no ST changes.', status: 'AVAILABLE', orderedBy: 'Dr. Emily Carter' },
                            { reportId: 'R12-002', reportType: 'Blood Test', reportDate: '2026-10-14', results: 'TSH 0.8 mIU/L (normal). Electrolytes normal. Troponin I 0.01 ng/mL (negative). Magnesium 1.9 mg/dL (normal).', status: 'AVAILABLE', orderedBy: 'Dr. Emily Carter' }
                        ]
                    },
                    {
                        visitId: 13, patientId: 16, patientName: 'Ravi Kumar', patientUhid: 'UHID-2026-10016',
                        doctorId: 2, doctorName: 'Dr. Emily Carter', hospitalId: 1, hospitalName: 'Global City Hospital',
                        visitDate: '2026-10-25T08:30:00.000Z',
                        symptoms: 'Known Type-2 Diabetic, 12-year history. Increased thirst, polyuria, fatigue. HbA1c review.',
                        vitals: 'BP: 136/88 mmHg, Pulse: 78 bpm, Temp: 98.4F, SpO2: 98%, Weight: 92 kg (BMI 31)',
                        diagnosis: 'Poorly Controlled Type-2 Diabetes Mellitus — HbA1c 9.2% (Target <7%). Insulin Dose Adjustment Required.',
                        notes: 'Insulin dose uptitrated. Diet counselling given. Nephrology consult at Apollo arranged for diabetic nephropathy screening.',
                        prescriptions: [
                            { prescriptionId: 31, medicineName: 'Insulin Glargine',  dosage: '30 units', frequency: 'Once daily (Bedtime)', duration: '30 Days', instructions: 'Rotate injection sites' },
                            { prescriptionId: 32, medicineName: 'Metformin',         dosage: '1000 mg',  frequency: 'Twice daily',          duration: '30 Days', instructions: 'Take with meals' },
                            { prescriptionId: 33, medicineName: 'Empagliflozin',     dosage: '10 mg',    frequency: 'Once daily (Morning)', duration: '30 Days', instructions: 'Ensure adequate hydration' }
                        ],
                        labTests: [
                            { labTestId: 32, testName: 'HbA1c',               result: '9.2% (Poorly Controlled)',          status: 'COMPLETED' },
                            { labTestId: 33, testName: 'Fasting Blood Sugar',  result: '198 mg/dL (High)',                  status: 'COMPLETED' },
                            { labTestId: 34, testName: 'Urine Microalbumin',   result: '48 mg/g (Mildly Elevated)',         status: 'COMPLETED' }
                        ],
                        reports: [
                            { reportId: 'R13-001', reportType: 'Blood Test', reportDate: '2026-10-25', results: 'HbA1c 9.2%. FBS 198 mg/dL. Post-prandial 268 mg/dL. LFT normal. RFT: Creatinine 1.1 mg/dL, eGFR 72 mL/min. Microalbumin 48 mg/g (early nephropathy).', status: 'AVAILABLE', orderedBy: 'Dr. Emily Carter' }
                        ]
                    },
                    {
                        visitId: 14, patientId: 17, patientName: 'Meera Nair', patientUhid: 'UHID-2026-10017',
                        doctorId: 81, doctorName: 'Dr. Priya Venkatesh', hospitalId: 9, hospitalName: 'LifeCare Maternity Hospital',
                        visitDate: '2026-10-26T09:00:00.000Z',
                        symptoms: '32-week antenatal visit. Mild pelvic pressure, reduced fetal movement noted morning of visit. Otherwise well.',
                        vitals: 'BP: 122/76 mmHg, Pulse: 82 bpm, Temp: 98.6F, SpO2: 99%, Weight: 72 kg',
                        diagnosis: 'Normal Intrauterine Pregnancy 32 Weeks — Fetal Movements Reassured by CTG. No Foetal Distress.',
                        notes: 'CTG reactive and reassuring. Fetal kick count chart provided. GBS swab taken. Next visit 36 weeks.',
                        prescriptions: [
                            { prescriptionId: 34, medicineName: 'Ferrous Sulphate', dosage: '200 mg', frequency: 'Twice daily', duration: '56 Days', instructions: 'Continue iron supplementation' },
                            { prescriptionId: 35, medicineName: 'Folic Acid',       dosage: '5 mg',   frequency: 'Once daily',  duration: '56 Days', instructions: 'Continue as prescribed' }
                        ],
                        labTests: [
                            { labTestId: 35, testName: 'Cardiotocography (CTG)',   result: 'Reactive — FHR 142 bpm, 2 accelerations, no decelerations', status: 'COMPLETED' },
                            { labTestId: 36, testName: 'Anomaly Scan (32W)',        result: 'Normal fetal growth; AFI 13.5 cm',                         status: 'COMPLETED' }
                        ],
                        reports: [
                            { reportId: 'R14-001', reportType: 'Ultrasound', reportDate: '2026-10-26', results: 'Ultrasound 32 weeks: Singleton pregnancy. EFW 1820g (50th centile). BPD 82mm, FL 62mm. AFI 13.5 cm (normal). Grade II placenta, posterior. CTG reactive.', status: 'AVAILABLE', orderedBy: 'Dr. Priya Venkatesh' }
                        ]
                    }
                ],
                documents: [],
                auditLogs: [
                    { auditId: 1, userName: 'System', userRole: 'ADMIN', action: 'SYSTEM_INIT_V4', details: 'Cloud database v4 initialized — 10 hospitals, 60+ staff, 17 patients', timestamp: new Date().toISOString(), ipAddress: '127.0.0.1' }
                ]
            };
            this.saveData(db);
        } else {
            // Migrate old db keys if user has v2/v3 data
            try {
                const oldKey = 'hprs_cloud_db_v3';
                if (localStorage.getItem(oldKey) && !localStorage.getItem(this.STORAGE_KEY)) {
                    console.log('[HPRS] Migrating v3 → v4 localStorage...');
                    // Already handled by not finding v4 key above
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
