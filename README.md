# Hospital Patient Record System (HPRS) - Complete Enterprise Edition

A production-ready, full-stack, multi-hospital Electronic Health Record (EHR) web application built with **Spring Boot 3.x (Java 17)**, **Spring Security with JWT**, **Spring Data JPA**, **OpenPDF**, and a responsive **Bootstrap 5 & JavaScript Presentation Layer**.

---

## 🌟 Key Functional Features & Architecture

1. **Unified Single-Server Deployment**:
   - The Spring Boot backend embeds and serves all frontend static assets (`src/main/resources/static/`).
   - Running the backend automatically serves the full interactive Web UI at `http://localhost:8080/`.

2. **Role-Based Security (RBAC & JWT)**:
   - Enforces 4 role permissions across all endpoints and UI elements: **ADMIN**, **DOCTOR**, **RECEPTIONIST**, and **NURSE**.
   - Passwords hashed with BCrypt, stateless JWT tokens passed via HTTP `Authorization: Bearer <token>`.

3. **Centralized Patient Management & EHR**:
   - Automatic Unique Health ID generation (`UHID-YYYY-XXXXX`).
   - Real-time search by Patient Name, Phone Number, or UHID across connected hospitals.
   - **Duplicate Patient Detection**: Automatically prevents duplicate registration if Name, DOB, and Phone match an existing record.

4. **Appointment Scheduling & Availability Validation**:
   - Schedule appointments with doctor slot validation to **prevent double-booking**.
   - Manage appointment statuses: `SCHEDULED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`.

5. **Doctor Clinical Records, Prescriptions & Lab Orders**:
   - Record vitals (BP, pulse, temperature, weight), chief symptoms, clinical diagnosis, and doctor notes.
   - Prescribe medications with dynamic dosage, frequency, duration, and instructions.
   - Order lab tests (`ORDERED`, `COMPLETED`) and record diagnostic results.

6. **Medical Record Reports & OpenPDF Export**:
   - Export official PDF Patient Medical Record Summaries and Prescriptions.

7. **System Administration & Audit Logs**:
   - User account provisioning and role assignments.
   - Comprehensive Security Audit Trail recording user actions, timestamps, and client IP addresses.

---

## 🔑 Default Production Seed Accounts

All pre-seeded accounts use password: `Password123!`

| Role | Username / Email | Primary Capabilities |
| :--- | :--- | :--- |
| **Admin** | `admin@hprs.com` | User account provisioning, hospital/dept management, audit logs |
| **Doctor** | `doctor@hprs.com` | Patient EHR profile access, record clinical visits & prescriptions, PDF export |
| **Receptionist** | `receptionist@hprs.com` | Register patients, search records, schedule & update appointments |
| **Nurse** | `nurse@hprs.com` | Search patients, view medical history, check vitals |

---

## 🚀 Running the Complete Application

### Prerequisites
- **Java 17+** (OpenJDK or Oracle JDK)

### Launch Command

```bash
cd backend

# Option A: Using Maven Wrapper (Unix/Linux/macOS)
./mvnw spring-boot:run

# Option B: Using Maven Wrapper (Windows Command Prompt)
mvnw.cmd spring-boot:run

# Option C: Using System Maven
mvn spring-boot:run
```

Once launched:
- **Web Interface**: Open `http://localhost:8080/` in your browser.
- **REST API**: Accessible under `http://localhost:8080/api/`.
- **H2 Database Console**: Accessible at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:hprsdb`).

---

## 📋 Production Database Configuration

To connect to a Cloud MySQL database (e.g., AWS RDS, Google Cloud SQL, Azure Database for MySQL, Aiven):

Set the following environment variables before launching:

```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://your-mysql-host:3306/hprs_db?useSSL=true"
export SPRING_DATASOURCE_USERNAME="your_db_user"
export SPRING_DATASOURCE_PASSWORD="your_db_password"
export SPRING_DATASOURCE_DRIVER="com.mysql.cj.jdbc.Driver"
export SPRING_JPA_DIALECT="org.hibernate.dialect.MySQLDialect"
export JWT_SECRET="YourProduction32ByteMinimumSecretKeyStringHere!"
```

---

## 📂 Source Code Structure

```
hospital-patient-record-system/
├── backend/
│   ├── pom.xml                                  # Maven Dependencies
│   ├── mvnw / mvnw.cmd                          # Maven Wrapper Scripts
│   └── src/
│       ├── main/
│       │   ├── java/com/hprs/
│       │   │   ├── HospitalApplication.java
│       │   │   ├── controller/                  # REST Controllers (Auth, Patient, Appointment, Visit, Report, Admin)
│       │   │   ├── service/                     # Business Services (Patient, Appointment, Visit, Report, Admin, AuditLog)
│       │   │   ├── repository/                  # Spring Data JPA Repositories
│       │   │   ├── model/                       # Entities (Hospital, Department, User, Patient, Appointment, Visit, Prescription, LabTest, AuditLog)
│       │   │   ├── dto/                         # Data Transfer Objects
│       │   │   ├── security/                    # SecurityConfig, JwtUtil, JwtAuthFilter, UserDetailsService
│       │   │   └── exception/                   # Global Exception Handler
│       │   └── resources/
│       │       ├── application.properties        # App Configuration
│       │       ├── schema.sql                   # MySQL/H2 DDL Schema
│       │       ├── data.sql                     # Seed Data
│       │       └── static/                      # Embedded Web UI (HTML, CSS, JS)
│       └── test/java/com/hprs/service/          # JUnit 5 & Mockito Unit Tests
│
└── README.md
```
