package com.project.social_media_application.dtos;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String department;
    private String studyYear;
    private String dateOfBirth;
    private String studentId;
    private String contactNumber;
    private String address;

    
    public RegisterRequest() {
    }
    
    public RegisterRequest(String name, String email, String password, String department, String studyYear,
            String dateOfBirth, String studentId, String contactNumber, String address) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.department = department;
        this.studyYear = studyYear;
        this.dateOfBirth = dateOfBirth;
        this.studentId = studentId;
        this.contactNumber = contactNumber;
        this.address = address;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getDepartment() {
        return department;
    }
    public void setDepartment(String department) {
        this.department = department;
    }
    public String getStudyYear() {
        return studyYear;
    }
    public void setStudyYear(String studyYear) {
        this.studyYear = studyYear;
    }
    public String getDateOfBirth() {
        return dateOfBirth;
    }
    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    public String getStudentId() {
        return studentId;
    }
    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
    public String getContactNumber() {
        return contactNumber;
    }
    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
    public String getAddress() {
        return address;
    }
    public void setAddress(String address) {
        this.address = address;
    }

    
}
