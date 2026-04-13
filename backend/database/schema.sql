-- Digital Documentation and Identity Verification System Database Schema

-- Drop existing views if they exist
DROP VIEW IF EXISTS document_stats;
DROP VIEW IF EXISTS verification_stats;
DROP VIEW IF EXISTS user_document_stats;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS document_signatures;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS verifications;
DROP TABLE IF EXISTS templates;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verifications Table
CREATE TABLE verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    document_type ENUM('passport', 'drivers_license', 'national_id', 'other') NOT NULL,
    document_number VARCHAR(100),
    document_path VARCHAR(500),
    otp_code VARCHAR(10),
    otp_expires_at DATETIME NULL,
    otp_verified BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    submitted_at DATETIME NULL,
    reviewed_at DATETIME NULL,
    reviewed_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Templates Table
CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    content TEXT NOT NULL,
    fields TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Documents Table
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    template_id INT,
    title VARCHAR(255) NOT NULL,
    document_number VARCHAR(100) UNIQUE,
    content TEXT NOT NULL,
    file_path VARCHAR(500),
    encrypted_path VARCHAR(500),
    status ENUM('draft', 'pending', 'signed', 'completed', 'rejected') DEFAULT 'draft',
    category VARCHAR(100),
    metadata TEXT,
    is_encrypted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    signed_at DATETIME NULL,
    expires_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_document_number (document_number),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Document Signatures Table
CREATE TABLE document_signatures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    user_id INT NOT NULL,
    signature_data TEXT NOT NULL,
    signature_type ENUM('canvas', 'typed', 'uploaded') DEFAULT 'canvas',
    ip_address VARCHAR(45),
    user_agent TEXT,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user
-- Password: Admin@123 (hashed with bcrypt)
INSERT INTO users (email, password, full_name, role, is_verified, verification_status) VALUES
('admin@system.com', '$2a$10$ghr7aEUP4BiXHrg2FuX/0.epiNrNWKAxe8YpO4h/u7wiVNgh9lrFW', 'System Administrator', 'admin', TRUE, 'verified');

-- Insert sample templates
INSERT INTO templates (name, description, category, content, fields, created_by) VALUES
('Non-Disclosure Agreement', 'Standard NDA template for confidential information', 'Legal', 
'NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement (\"Agreement\") is entered into as of {{date}} between {{party1_name}} and {{party2_name}}.\n\n1. CONFIDENTIAL INFORMATION\n{{party1_name}} agrees to disclose certain confidential information to {{party2_name}} for the purpose of {{purpose}}.\n\n2. OBLIGATIONS\nThe receiving party agrees to maintain the confidentiality of all information disclosed.\n\n3. TERM\nThis agreement shall remain in effect for a period of {{duration}} years.\n\nSignature: _______________\nDate: {{signature_date}}',
'["party1_name", "party2_name", "purpose", "duration", "date", "signature_date"]', 1),

('Service Agreement', 'General service agreement template', 'Contracts', 
'SERVICE AGREEMENT\n\nThis Service Agreement is made on {{date}} between:\nService Provider: {{provider_name}}\nClient: {{client_name}}\n\n1. SERVICES\nThe Service Provider agrees to provide the following services: {{service_description}}\n\n2. COMPENSATION\nThe Client agrees to pay {{amount}} for the services rendered.\n\n3. TERM\nThis agreement shall commence on {{start_date}} and continue until {{end_date}}.\n\nSignature: _______________\nDate: {{signature_date}}',
'["provider_name", "client_name", "service_description", "amount", "start_date", "end_date", "date", "signature_date"]', 1),

('Employee Agreement', 'Standard employment agreement', 'Employment', 
'EMPLOYMENT AGREEMENT\n\nThis Employment Agreement is made on {{date}} between:\nEmployer: {{company_name}}\nEmployee: {{employee_name}}\n\n1. POSITION\nThe Employee is hired for the position of {{position}} in the {{department}} department.\n\n2. COMPENSATION\nThe Employee shall receive a salary of {{salary}} per {{period}}.\n\n3. START DATE\nEmployment shall commence on {{start_date}}.\n\n4. RESPONSIBILITIES\n{{responsibilities}}\n\nSignature: _______________\nDate: {{signature_date}}',
'["company_name", "employee_name", "position", "department", "salary", "period", "start_date", "responsibilities", "date", "signature_date"]', 1),

('Retail Savings Account Opening Form', 'Standard customer onboarding form for opening a retail savings account.', 'Banking',
'RETAIL SAVINGS ACCOUNT OPENING FORM\n\nApplication Date: {{application_date}}\nBranch: {{branch_name}}\n\nApplicant Information\nFull Name: {{full_name}}\nDate of Birth: {{date_of_birth}}\nNationality: {{nationality}}\nPhone: {{phone}}\nEmail: {{email}}\nAddress: {{address}}\n\nKYC Information\nIdentity Type: {{identity_type}}\nIdentity Number: {{identity_number}}\nTax ID: {{tax_id}}\n\nAccount Details\nAccount Type: {{account_type}}\nInitial Deposit Amount: {{initial_deposit}}\nNominee Name: {{nominee_name}}\nNominee Relationship: {{nominee_relationship}}\n\nDeclaration\nI confirm that all information provided is correct and agree to bank terms and regulatory KYC checks.\n\nCustomer Signature: ____________________\nDate: {{signature_date}}',
'["application_date", "branch_name", "full_name", "date_of_birth", "nationality", "phone", "email", "address", "identity_type", "identity_number", "tax_id", "account_type", "initial_deposit", "nominee_name", "nominee_relationship", "signature_date"]', 1),

('Personal Loan Application', 'Consumer lending application for salaried and self-employed applicants.', 'Banking',
'PERSONAL LOAN APPLICATION\n\nApplication ID: {{application_id}}\nDate: {{application_date}}\n\nApplicant Profile\nFull Name: {{full_name}}\nEmployment Type: {{employment_type}}\nEmployer/Business: {{employer_name}}\nMonthly Income: {{monthly_income}}\n\nLoan Request\nRequested Amount: {{loan_amount}}\nLoan Tenure (months): {{loan_tenure_months}}\nPurpose: {{loan_purpose}}\nPreferred EMI Date: {{emi_date}}\n\nCompliance and Consent\nApplicant consents to credit bureau checks and verification by lender.\n\nApplicant Signature: ____________________\nDate: {{signature_date}}',
'["application_id", "application_date", "full_name", "employment_type", "employer_name", "monthly_income", "loan_amount", "loan_tenure_months", "loan_purpose", "emi_date", "signature_date"]', 1),

('Corporate Current Account Mandate', 'Corporate banking mandate for account operation rules and authorized signatories.', 'Banking',
'CORPORATE CURRENT ACCOUNT MANDATE\n\nCompany Name: {{company_name}}\nRegistration Number: {{registration_number}}\nDate: {{mandate_date}}\n\nAuthorized Signatories\nPrimary Signatory: {{primary_signatory}}\nSecondary Signatory: {{secondary_signatory}}\nSigning Rule: {{signing_rule}}\n\nAccount Controls\nTransaction Limit Per Day: {{daily_limit}}\nInternational Transfers Allowed: {{intl_transfer_allowed}}\nCheque Book Required: {{cheque_book_required}}\n\nBoard Resolution Reference: {{board_resolution_ref}}\n\nAuthorized Representative Signature: ____________________\nDate: {{signature_date}}',
'["company_name", "registration_number", "mandate_date", "primary_signatory", "secondary_signatory", "signing_rule", "daily_limit", "intl_transfer_allowed", "cheque_book_required", "board_resolution_ref", "signature_date"]', 1),

('Investment Advisory Agreement', 'Advisory service agreement between financial advisor and client.', 'Finance',
'INVESTMENT ADVISORY AGREEMENT\n\nAgreement Date: {{agreement_date}}\nAdvisor Name: {{advisor_name}}\nClient Name: {{client_name}}\n\nScope of Services\nRisk Profiling: {{risk_profile}}\nInvestment Horizon: {{investment_horizon}}\nAdvisory Scope: {{advisory_scope}}\n\nFees and Charges\nAdvisory Fee Model: {{fee_model}}\nFee Percentage/Amount: {{fee_value}}\nBilling Frequency: {{billing_frequency}}\n\nCompliance\nAdvisor shall comply with applicable securities and fiduciary regulations.\n\nAdvisor Signature: ____________________\nClient Signature: ____________________\nDate: {{signature_date}}',
'["agreement_date", "advisor_name", "client_name", "risk_profile", "investment_horizon", "advisory_scope", "fee_model", "fee_value", "billing_frequency", "signature_date"]', 1),

('Invoice Factoring Agreement', 'Agreement for assignment of receivables to a factoring institution.', 'Finance',
'INVOICE FACTORING AGREEMENT\n\nAgreement Date: {{agreement_date}}\nSeller: {{seller_name}}\nFactor: {{factor_name}}\n\nReceivables Portfolio\nPortfolio Value: {{portfolio_value}}\nAdvance Rate: {{advance_rate}}\nDiscount Rate: {{discount_rate}}\nReserve Percentage: {{reserve_percent}}\n\nSettlement Terms\nRecourse Type: {{recourse_type}}\nSettlement Cycle: {{settlement_cycle}}\n\nAuthorized Signatory (Seller): ____________________\nAuthorized Signatory (Factor): ____________________\nDate: {{signature_date}}',
'["agreement_date", "seller_name", "factor_name", "portfolio_value", "advance_rate", "discount_rate", "reserve_percent", "recourse_type", "settlement_cycle", "signature_date"]', 1),

('Mutual Fund SIP Enrollment Form', 'Enrollment template for systematic investment plan setup.', 'Finance',
'MUTUAL FUND SIP ENROLLMENT FORM\n\nForm Date: {{form_date}}\nInvestor Name: {{investor_name}}\nFolio Number: {{folio_number}}\n\nSIP Details\nScheme Name: {{scheme_name}}\nSIP Amount: {{sip_amount}}\nDebit Frequency: {{sip_frequency}}\nDebit Date: {{sip_debit_date}}\nStart Month: {{start_month}}\n\nBank Mandate\nBank Name: {{bank_name}}\nAccount Number: {{account_number}}\nIFSC/SWIFT: {{bank_code}}\n\nInvestor Signature: ____________________\nDate: {{signature_date}}',
'["form_date", "investor_name", "folio_number", "scheme_name", "sip_amount", "sip_frequency", "sip_debit_date", "start_month", "bank_name", "account_number", "bank_code", "signature_date"]', 1),

('Citizen Service Request Form', 'General municipal or district-level citizen service application.', 'Government Services',
'CITIZEN SERVICE REQUEST FORM\n\nRequest Number: {{request_number}}\nService Type: {{service_type}}\nSubmission Date: {{submission_date}}\n\nApplicant Information\nName: {{applicant_name}}\nNational ID: {{national_id}}\nContact Number: {{contact_number}}\nAddress: {{address}}\n\nRequest Details\nDescription: {{request_description}}\nPreferred Processing Office: {{processing_office}}\nSupporting Documents: {{supporting_documents}}\n\nDeclaration\nI certify that the submitted information is true and complete.\n\nApplicant Signature: ____________________\nDate: {{signature_date}}',
'["request_number", "service_type", "submission_date", "applicant_name", "national_id", "contact_number", "address", "request_description", "processing_office", "supporting_documents", "signature_date"]', 1),

('Business License Renewal Application', 'Renewal form for commercial operating licenses.', 'Government Services',
'BUSINESS LICENSE RENEWAL APPLICATION\n\nApplication Date: {{application_date}}\nExisting License Number: {{license_number}}\n\nBusiness Profile\nBusiness Name: {{business_name}}\nOwner Name: {{owner_name}}\nBusiness Category: {{business_category}}\nRegistered Address: {{registered_address}}\n\nRenewal Information\nRequested Renewal Period: {{renewal_period}}\nAnnual Revenue Range: {{revenue_range}}\nTax Compliance Status: {{tax_status}}\n\nApplicant Signature: ____________________\nDate: {{signature_date}}',
'["application_date", "license_number", "business_name", "owner_name", "business_category", "registered_address", "renewal_period", "revenue_range", "tax_status", "signature_date"]', 1),

('Public Information Access Request', 'Formal request template for access to public records and information.', 'Government Services',
'PUBLIC INFORMATION ACCESS REQUEST\n\nRequest Date: {{request_date}}\nDepartment: {{department_name}}\n\nRequester Information\nRequester Name: {{requester_name}}\nOrganization: {{organization_name}}\nEmail: {{email}}\nPhone: {{phone}}\n\nInformation Requested\nRecord Description: {{record_description}}\nTime Period Covered: {{record_period}}\nPreferred Format: {{delivery_format}}\nPurpose of Request: {{request_purpose}}\n\nRequester Signature: ____________________\nDate: {{signature_date}}',
'["request_date", "department_name", "requester_name", "organization_name", "email", "phone", "record_description", "record_period", "delivery_format", "request_purpose", "signature_date"]', 1),

('Candidate Interview Evaluation Form', 'Structured interviewer feedback template for hiring decisions.', 'Job Recruitment',
'CANDIDATE INTERVIEW EVALUATION FORM\n\nInterview Date: {{interview_date}}\nPosition: {{position_title}}\nCandidate Name: {{candidate_name}}\nInterviewer: {{interviewer_name}}\n\nEvaluation Criteria\nTechnical Skills Score (1-10): {{technical_score}}\nCommunication Score (1-10): {{communication_score}}\nProblem Solving Score (1-10): {{problem_solving_score}}\nCulture Fit Score (1-10): {{culture_fit_score}}\n\nSummary Feedback\nStrengths: {{strengths}}\nAreas for Improvement: {{improvements}}\nRecommendation: {{recommendation}}\n\nInterviewer Signature: ____________________\nDate: {{signature_date}}',
'["interview_date", "position_title", "candidate_name", "interviewer_name", "technical_score", "communication_score", "problem_solving_score", "culture_fit_score", "strengths", "improvements", "recommendation", "signature_date"]', 1),

('Employment Offer Letter', 'Standard offer letter template for selected candidates.', 'Job Recruitment',
'EMPLOYMENT OFFER LETTER\n\nDate: {{offer_date}}\nCandidate Name: {{candidate_name}}\nAddress: {{candidate_address}}\n\nWe are pleased to offer you the position of {{position_title}} at {{company_name}}.\n\nCompensation and Terms\nAnnual CTC/Salary: {{annual_salary}}\nJoining Date: {{joining_date}}\nWork Location: {{work_location}}\nReporting Manager: {{reporting_manager}}\nProbation Period: {{probation_period}}\n\nPlease sign and return this letter by {{acceptance_deadline}}.\n\nAuthorized Signatory: ____________________\nCandidate Acceptance Signature: ____________________\nDate: {{signature_date}}',
'["offer_date", "candidate_name", "candidate_address", "position_title", "company_name", "annual_salary", "joining_date", "work_location", "reporting_manager", "probation_period", "acceptance_deadline", "signature_date"]', 1),

('Background Verification Consent Form', 'Candidate consent form for pre-employment background checks.', 'Job Recruitment',
'BACKGROUND VERIFICATION CONSENT FORM\n\nCandidate Name: {{candidate_name}}\nApplication ID: {{application_id}}\nDate: {{consent_date}}\n\nVerification Scope\nIdentity Verification: {{identity_verification}}\nEducation Verification: {{education_verification}}\nEmployment Verification: {{employment_verification}}\nCriminal Record Check: {{criminal_check}}\nAddress Verification: {{address_verification}}\n\nConsent Declaration\nI authorize {{company_name}} and its authorized partners to verify my background information for employment purposes.\n\nCandidate Signature: ____________________\nDate: {{signature_date}}',
'["candidate_name", "application_id", "consent_date", "identity_verification", "education_verification", "employment_verification", "criminal_check", "address_verification", "company_name", "signature_date"]', 1),

('Student Admission Application', 'Comprehensive admission application for schools or colleges.', 'Education',
'STUDENT ADMISSION APPLICATION\n\nApplication Number: {{application_number}}\nAcademic Year: {{academic_year}}\nProgram Applied: {{program_name}}\n\nApplicant Details\nStudent Name: {{student_name}}\nDate of Birth: {{date_of_birth}}\nGender: {{gender}}\nPrevious Institution: {{previous_institution}}\n\nGuardian Details\nParent/Guardian Name: {{guardian_name}}\nGuardian Contact: {{guardian_contact}}\nGuardian Email: {{guardian_email}}\nAddress: {{address}}\n\nApplicant Signature: ____________________\nGuardian Signature: ____________________\nDate: {{signature_date}}',
'["application_number", "academic_year", "program_name", "student_name", "date_of_birth", "gender", "previous_institution", "guardian_name", "guardian_contact", "guardian_email", "address", "signature_date"]', 1),

('Scholarship Application Form', 'Template for merit and need-based scholarship applications.', 'Education',
'SCHOLARSHIP APPLICATION FORM\n\nApplication Date: {{application_date}}\nScholarship Name: {{scholarship_name}}\nStudent ID: {{student_id}}\n\nAcademic Information\nStudent Name: {{student_name}}\nProgram: {{program_name}}\nCurrent GPA/Percentage: {{academic_score}}\nInstitution: {{institution_name}}\n\nFinancial and Supporting Details\nAnnual Family Income: {{family_income}}\nStatement of Purpose: {{sop_summary}}\nDocuments Submitted: {{document_list}}\n\nStudent Signature: ____________________\nDate: {{signature_date}}',
'["application_date", "scholarship_name", "student_id", "student_name", "program_name", "academic_score", "institution_name", "family_income", "sop_summary", "document_list", "signature_date"]', 1),

('Faculty Appointment Contract', 'Employment contract template for teaching faculty appointments.', 'Education',
'FACULTY APPOINTMENT CONTRACT\n\nContract Date: {{contract_date}}\nInstitution Name: {{institution_name}}\nFaculty Name: {{faculty_name}}\nDesignation: {{designation}}\nDepartment: {{department}}\n\nAppointment Terms\nContract Type: {{contract_type}}\nStart Date: {{start_date}}\nEnd Date: {{end_date}}\nCompensation: {{compensation}}\nTeaching Load: {{teaching_load}}\n\nBoth parties agree to institutional policies and academic conduct standards.\n\nInstitution Representative Signature: ____________________\nFaculty Signature: ____________________\nDate: {{signature_date}}',
'["contract_date", "institution_name", "faculty_name", "designation", "department", "contract_type", "start_date", "end_date", "compensation", "teaching_load", "signature_date"]', 1);

-- Create views for analytics
CREATE VIEW user_document_stats AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    COUNT(DISTINCT d.id) as total_documents,
    SUM(CASE WHEN d.status = 'completed' THEN 1 ELSE 0 END) as completed_documents,
    SUM(CASE WHEN d.status = 'pending' THEN 1 ELSE 0 END) as pending_documents,
    SUM(CASE WHEN d.status = 'signed' THEN 1 ELSE 0 END) as signed_documents
FROM users u
LEFT JOIN documents d ON u.id = d.user_id
WHERE u.role = 'user'
GROUP BY u.id, u.full_name, u.email;

CREATE VIEW verification_stats AS
SELECT 
    COUNT(*) as total_verifications,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_verifications,
    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_verifications,
    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_verifications,
    SUM(CASE WHEN otp_verified = TRUE THEN 1 ELSE 0 END) as otp_verified_count
FROM verifications;

CREATE VIEW document_stats AS
SELECT 
    COUNT(*) as total_documents,
    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_documents,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_documents,
    SUM(CASE WHEN status = 'signed' THEN 1 ELSE 0 END) as signed_documents,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_documents,
    COUNT(DISTINCT user_id) as unique_users
FROM documents;
