package com.hprs.service;

import com.hprs.dto.DepartmentDto;
import com.hprs.dto.HospitalDto;
import com.hprs.dto.UserDto;
import com.hprs.exception.DuplicateRecordException;
import com.hprs.exception.ResourceNotFoundException;
import com.hprs.model.Department;
import com.hprs.model.Hospital;
import com.hprs.model.User;
import com.hprs.repository.DepartmentRepository;
import com.hprs.repository.HospitalRepository;
import com.hprs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    // Hospitals
    @Transactional
    public HospitalDto createHospital(HospitalDto dto, Long currentUserId, String ipAddress) {
        if (dto.getRegistrationNo() != null && hospitalRepository.findByRegistrationNo(dto.getRegistrationNo()).isPresent()) {
            throw new DuplicateRecordException("Hospital with registration number " + dto.getRegistrationNo() + " already exists");
        }

        Hospital hospital = Hospital.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .registrationNo(dto.getRegistrationNo())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        Hospital saved = hospitalRepository.save(hospital);
        auditLogService.logAction(currentUserId, null, "CREATE_HOSPITAL", "Created hospital: " + saved.getName(), ipAddress);
        return mapHospitalToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<HospitalDto> getAllHospitals() {
        return hospitalRepository.findAll().stream().map(this::mapHospitalToDto).collect(Collectors.toList());
    }

    // Departments
    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto, Long currentUserId, String ipAddress) {
        Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + dto.getHospitalId()));

        Department department = Department.builder()
                .hospital(hospital)
                .name(dto.getName())
                .build();

        Department saved = departmentRepository.save(department);
        auditLogService.logAction(currentUserId, null, "CREATE_DEPARTMENT", "Created department: " + saved.getName(), ipAddress);
        return mapDepartmentToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getDepartmentsByHospital(Long hospitalId) {
        return departmentRepository.findByHospital_HospitalId(hospitalId).stream()
                .map(this::mapDepartmentToDto).collect(Collectors.toList());
    }

    // Users
    @Transactional
    public UserDto createUser(UserDto dto, Long currentUserId, String ipAddress) {
        if (userRepository.findByEmail(dto.getEmail().toLowerCase().trim()).isPresent()) {
            throw new DuplicateRecordException("User with email " + dto.getEmail() + " already exists");
        }

        Hospital hospital = null;
        if (dto.getHospitalId() != null) {
            hospital = hospitalRepository.findById(dto.getHospitalId()).orElse(null);
        }

        Department department = null;
        if (dto.getDepartmentId() != null) {
            department = departmentRepository.findById(dto.getDepartmentId()).orElse(null);
        }

        User user = User.builder()
                .fullName(dto.getFullName().trim())
                .email(dto.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(dto.getPassword() != null ? dto.getPassword() : "Password123!"))
                .role(User.Role.valueOf(dto.getRole().toUpperCase()))
                .hospital(hospital)
                .department(department)
                .specialization(dto.getSpecialization())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        User saved = userRepository.save(user);
        auditLogService.logAction(currentUserId, null, "CREATE_USER", "Created user: " + saved.getEmail() + " (" + saved.getRole() + ")", ipAddress);
        return mapUserToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapUserToDto).collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUser(Long userId, UserDto dto, Long currentUserId, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(dto.getFullName().trim());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            user.setEmail(dto.getEmail().toLowerCase().trim());
        }
        if (dto.getRole() != null) {
            user.setRole(User.Role.valueOf(dto.getRole().toUpperCase()));
        }
        if (dto.getSpecialization() != null) {
            user.setSpecialization(dto.getSpecialization());
        }
        if (dto.getActive() != null) {
            user.setActive(dto.getActive());
        }

        User updated = userRepository.save(user);
        auditLogService.logAction(currentUserId, null, "UPDATE_USER", "Updated user: " + updated.getEmail(), ipAddress);
        return mapUserToDto(updated);
    }

    public HospitalDto mapHospitalToDto(Hospital h) {
        return HospitalDto.builder()
                .hospitalId(h.getHospitalId())
                .name(h.getName())
                .address(h.getAddress())
                .phone(h.getPhone())
                .registrationNo(h.getRegistrationNo())
                .active(h.getActive())
                .build();
    }

    public DepartmentDto mapDepartmentToDto(Department d) {
        return DepartmentDto.builder()
                .departmentId(d.getDepartmentId())
                .hospitalId(d.getHospital().getHospitalId())
                .hospitalName(d.getHospital().getName())
                .name(d.getName())
                .build();
    }

    public UserDto mapUserToDto(User u) {
        return UserDto.builder()
                .userId(u.getUserId())
                .hospitalId(u.getHospital() != null ? u.getHospital().getHospitalId() : null)
                .hospitalName(u.getHospital() != null ? u.getHospital().getName() : null)
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole().name())
                .departmentId(u.getDepartment() != null ? u.getDepartment().getDepartmentId() : null)
                .departmentName(u.getDepartment() != null ? u.getDepartment().getName() : null)
                .specialization(u.getSpecialization())
                .active(u.getActive())
                .build();
    }
}
