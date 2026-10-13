package com.hprs.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.hprs.dto.AppointmentDto;
import com.hprs.dto.DashboardSummaryDto;
import com.hprs.dto.PatientDto;
import com.hprs.dto.PrescriptionDto;
import com.hprs.dto.VisitDto;
import com.hprs.model.User;
import com.hprs.repository.AppointmentRepository;
import com.hprs.repository.PatientRepository;
import com.hprs.repository.UserRepository;
import com.hprs.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.awt.Color;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final PatientService patientService;
    private final VisitService visitService;
    private final AppointmentService appointmentService;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final VisitRepository visitRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        long totalPatients = patientRepository.countAllPatients();
        long appointmentsToday = appointmentRepository.countAppointmentsForToday(
                LocalDate.now().atStartOfDay(), LocalDate.now().atTime(LocalTime.MAX));
        long totalVisits = visitRepository.count();
        long totalDoctors = userRepository.findByRole(User.Role.DOCTOR).size();

        List<AppointmentDto> recentAppointments = appointmentRepository.findTop10ByOrderByAppointmentDatetimeDesc().stream()
                .map(appointmentService::mapToDto)
                .collect(Collectors.toList());

        List<VisitDto> recentVisits = visitRepository.findTop10ByOrderByVisitDateDesc().stream()
                .map(visitService::mapToDto)
                .collect(Collectors.toList());

        return DashboardSummaryDto.builder()
                .totalPatients(totalPatients)
                .appointmentsToday(appointmentsToday)
                .totalVisits(totalVisits)
                .totalDoctors(totalDoctors)
                .recentAppointments(recentAppointments)
                .recentVisits(recentVisits)
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] generatePatientSummaryPdf(Long patientId) {
        PatientDto patient = patientService.getPatientById(patientId);
        List<VisitDto> visits = visitService.getPatientVisits(patientId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Header Title
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(24, 76, 120));
            Paragraph header = new Paragraph("Hospital Patient Medical Record Summary", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph subHeader = new Paragraph("Confidential Health Record Report\n\n", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY));
            subHeader.setAlignment(Element.ALIGN_CENTER);
            document.add(subHeader);

            // Patient Info Table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(15);

            addCell(infoTable, "UHID: " + patient.getUhid(), true);
            addCell(infoTable, "Full Name: " + patient.getFullName(), true);
            addCell(infoTable, "DOB: " + (patient.getDateOfBirth() != null ? patient.getDateOfBirth() : "N/A"), false);
            addCell(infoTable, "Gender: " + (patient.getGender() != null ? patient.getGender() : "N/A"), false);
            addCell(infoTable, "Phone: " + (patient.getPhone() != null ? patient.getPhone() : "N/A"), false);
            addCell(infoTable, "Blood Group: " + (patient.getBloodGroup() != null ? patient.getBloodGroup() : "N/A"), false);
            addCell(infoTable, "Allergies: " + (patient.getAllergies() != null ? patient.getAllergies() : "None"), false);
            addCell(infoTable, "Hospital: " + (patient.getRegisteredHospitalName() != null ? patient.getRegisteredHospitalName() : "General"), false);

            document.add(infoTable);

            // Visits Section
            Paragraph visitsTitle = new Paragraph("Clinical Visits & Diagnosis History", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(24, 76, 120)));
            visitsTitle.setSpacingAfter(10);
            document.add(visitsTitle);

            if (visits.isEmpty()) {
                document.add(new Paragraph("No clinical visits recorded for this patient.", FontFactory.getFont(FontFactory.HELVETICA, 11)));
            } else {
                for (VisitDto v : visits) {
                    Paragraph vHeader = new Paragraph("Visit Date: " + v.getVisitDate() + " | Doctor: " + v.getDoctorName() + " (" + v.getHospitalName() + ")",
                            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.DARK_GRAY));
                    document.add(vHeader);

                    Paragraph vDetails = new Paragraph(
                            "Symptoms: " + (v.getSymptoms() != null ? v.getSymptoms() : "N/A") + "\n" +
                            "Vitals: " + (v.getVitals() != null ? v.getVitals() : "N/A") + "\n" +
                            "Diagnosis: " + (v.getDiagnosis() != null ? v.getDiagnosis() : "N/A") + "\n" +
                            "Notes: " + (v.getNotes() != null ? v.getNotes() : "N/A"),
                            FontFactory.getFont(FontFactory.HELVETICA, 10));
                    vDetails.setSpacingAfter(5);
                    document.add(vDetails);

                    if (v.getPrescriptions() != null && !v.getPrescriptions().isEmpty()) {
                        PdfPTable rxTable = new PdfPTable(4);
                        rxTable.setWidthPercentage(100);
                        rxTable.setSpacingAfter(10);
                        addTableHeader(rxTable, "Medicine");
                        addTableHeader(rxTable, "Dosage");
                        addTableHeader(rxTable, "Frequency");
                        addTableHeader(rxTable, "Duration");

                        for (PrescriptionDto rx : v.getPrescriptions()) {
                            rxTable.addCell(rx.getMedicineName());
                            rxTable.addCell(rx.getDosage() != null ? rx.getDosage() : "");
                            rxTable.addCell(rx.getFrequency() != null ? rx.getFrequency() : "");
                            rxTable.addCell(rx.getDuration() != null ? rx.getDuration() : "");
                        }
                        document.add(rxTable);
                    }
                }
            }

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] generateVisitPdf(Long visitId) {
        VisitDto v = visitService.getVisitById(visitId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(24, 76, 120));
            Paragraph header = new Paragraph("Medical Prescription & Visit Report", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph subHeader = new Paragraph(v.getHospitalName() + "\nVisit Date: " + v.getVisitDate() + "\n\n",
                    FontFactory.getFont(FontFactory.HELVETICA, 11, Color.GRAY));
            subHeader.setAlignment(Element.ALIGN_CENTER);
            document.add(subHeader);

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(15);
            addCell(infoTable, "Patient Name: " + v.getPatientName(), true);
            addCell(infoTable, "UHID: " + v.getPatientUhid(), true);
            addCell(infoTable, "Attending Doctor: Dr. " + v.getDoctorName(), false);
            addCell(infoTable, "Hospital: " + v.getHospitalName(), false);

            document.add(infoTable);

            Paragraph diag = new Paragraph("Diagnosis: " + (v.getDiagnosis() != null ? v.getDiagnosis() : "N/A") + "\n" +
                    "Vitals: " + (v.getVitals() != null ? v.getVitals() : "N/A") + "\n" +
                    "Symptoms: " + (v.getSymptoms() != null ? v.getSymptoms() : "N/A") + "\n\n",
                    FontFactory.getFont(FontFactory.HELVETICA, 11));
            document.add(diag);

            if (v.getPrescriptions() != null && !v.getPrescriptions().isEmpty()) {
                Paragraph rxTitle = new Paragraph("Prescription", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13));
                rxTitle.setSpacingAfter(5);
                document.add(rxTitle);

                PdfPTable rxTable = new PdfPTable(4);
                rxTable.setWidthPercentage(100);
                addTableHeader(rxTable, "Medicine Name");
                addTableHeader(rxTable, "Dosage");
                addTableHeader(rxTable, "Frequency");
                addTableHeader(rxTable, "Duration");

                for (PrescriptionDto rx : v.getPrescriptions()) {
                    rxTable.addCell(rx.getMedicineName());
                    rxTable.addCell(rx.getDosage());
                    rxTable.addCell(rx.getFrequency());
                    rxTable.addCell(rx.getDuration());
                }
                document.add(rxTable);
            }

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    private void addCell(PdfPTable table, String text, boolean isBold) {
        Font font = isBold ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10) : FontFactory.getFont(FontFactory.HELVETICA, 10);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6);
        cell.setBorderColor(Color.LIGHT_GRAY);
        table.addCell(cell);
    }

    private void addTableHeader(PdfPTable table, String title) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
        PdfPCell cell = new PdfPCell(new Phrase(title, font));
        cell.setBackgroundColor(new Color(24, 76, 120));
        cell.setPadding(6);
        table.addCell(cell);
    }
}
