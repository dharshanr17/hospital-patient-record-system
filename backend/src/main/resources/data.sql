-- Initial Seed Data for Hospital Patient Record System (HPRS)

-- 1. Hospitals
INSERT INTO hospitals (hospital_id, name, address, phone, registration_no, active, created_at, updated_at)
VALUES (1, 'Global City Hospital', '123 Healthcare Ave, Central District', '+1-555-0199', 'HOSP-REG-2026-01', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO hospitals (hospital_id, name, address, phone, registration_no, active, created_at, updated_at)
VALUES (2, 'Metro Multi-Specialty Hospital', '456 Wellness Blvd, Northside', '+1-555-0288', 'HOSP-REG-2026-02', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Departments
INSERT INTO departments (department_id, hospital_id, name, created_at, updated_at)
VALUES (1, 1, 'General Medicine', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO departments (department_id, hospital_id, name, created_at, updated_at)
VALUES (2, 1, 'Cardiology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO departments (department_id, hospital_id, name, created_at, updated_at)
VALUES (3, 1, 'Pediatrics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO departments (department_id, hospital_id, name, created_at, updated_at)
VALUES (4, 2, 'Orthopedics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Users (Password for all default users: Password123!)
-- BCrypt hash for 'Password123!': $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd0P1R5ocvW5RupC
INSERT INTO users (user_id, hospital_id, full_name, email, password_hash, role, department_id, specialization, active, created_at, updated_at)
VALUES (1, 1, 'System Administrator', 'admin@hprs.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd0P1R5ocvW5RupC', 'ADMIN', 1, 'System Admin', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (user_id, hospital_id, full_name, email, password_hash, role, department_id, specialization, active, created_at, updated_at)
VALUES (2, 1, 'Dr. Emily Carter', 'doctor@hprs.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd0P1R5ocvW5RupC', 'DOCTOR', 2, 'Cardiology Specialist', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (user_id, hospital_id, full_name, email, password_hash, role, department_id, specialization, active, created_at, updated_at)
VALUES (3, 1, 'Mark Jenkins', 'receptionist@hprs.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd0P1R5ocvW5RupC', 'RECEPTIONIST', 1, 'Front Desk Operations', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (user_id, hospital_id, full_name, email, password_hash, role, department_id, specialization, active, created_at, updated_at)
VALUES (4, 1, 'Nurse Sarah Jenkins', 'nurse@hprs.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd0P1R5ocvW5RupC', 'NURSE', 1, 'Clinical Nursing', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Patients
INSERT INTO patients (patient_id, uhid, full_name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact_name, emergency_contact_phone, registered_hospital_id, created_at, updated_at)
VALUES (1, 'UHID-2026-10001', 'John Doe', '1985-06-15', 'Male', '5551234567', 'john.doe@example.com', '789 Elm St, Cityville', 'O+', 'Penicillin', 'Jane Doe', '5559876543', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO patients (patient_id, uhid, full_name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact_name, emergency_contact_phone, registered_hospital_id, created_at, updated_at)
VALUES (2, 'UHID-2026-10002', 'Sarah Connor', '1990-11-20', 'Female', '5552345678', 'sarah.c@example.com', '321 Oak St, Metro City', 'A-', 'Sulfa Drugs', 'Kyle Reese', '5558765432', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO patients (patient_id, uhid, full_name, date_of_birth, gender, phone, email, address, blood_group, allergies, emergency_contact_name, emergency_contact_phone, registered_hospital_id, created_at, updated_at)
VALUES (3, 'UHID-2026-10003', 'Robert Chen', '1978-03-08', 'Male', '5553456789', 'r.chen@example.com', '555 Pine Rd, Westside', 'B+', 'Dust, Peanuts', 'Lisa Chen', '5557654321', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. Appointments
INSERT INTO appointments (appointment_id, patient_id, doctor_id, hospital_id, appointment_datetime, reason, status, created_at, updated_at)
VALUES (1, 1, 2, 1, DATEADD('DAY', 1, CURRENT_TIMESTAMP), 'Routine Hypertension Checkup', 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO appointments (appointment_id, patient_id, doctor_id, hospital_id, appointment_datetime, reason, status, created_at, updated_at)
VALUES (2, 2, 2, 1, CURRENT_TIMESTAMP, 'Chest tightness and shortness of breath', 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. Visits
INSERT INTO visits (visit_id, patient_id, doctor_id, hospital_id, appointment_id, visit_date, symptoms, vitals, diagnosis, notes, created_at, updated_at)
VALUES (1, 2, 2, 1, 2, CURRENT_TIMESTAMP, 'Mild chest tightness, fatigue after physical activity', 'BP: 135/88 mmHg, Pulse: 78 bpm, Temp: 98.6F, Weight: 62kg', 'Stage 1 Hypertension & Acute Mild Anxiety', 'Patient advised to reduce sodium intake and maintain blood pressure daily log.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 7. Prescriptions
INSERT INTO prescriptions (prescription_id, visit_id, medicine_name, dosage, frequency, duration, instructions, created_at, updated_at)
VALUES (1, 1, 'Amlodipine Besylate', '5 mg', 'Once daily (Morning)', '30 Days', 'Take with water after breakfast', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO prescriptions (prescription_id, visit_id, medicine_name, dosage, frequency, duration, instructions, created_at, updated_at)
VALUES (2, 1, 'Metoprolol Succinate', '25 mg', 'Once daily (Evening)', '30 Days', 'Do not skip doses', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 8. Lab Tests
INSERT INTO lab_tests (lab_test_id, visit_id, test_name, result, status, created_at, updated_at)
VALUES (1, 1, 'Echocardiogram (ECG)', 'Normal sinus rhythm. No acute ischemia.', 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 9. Audit Logs
INSERT INTO audit_logs (audit_id, user_id, patient_id, action, details, timestamp, ip_address)
VALUES (1, 1, NULL, 'SYSTEM_INIT', 'System database initialized with default seed data', CURRENT_TIMESTAMP, '127.0.0.1');
