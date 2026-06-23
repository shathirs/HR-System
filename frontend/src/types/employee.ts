export type EmployeeStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ONBOARDING"
  | "TERMINATED";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERN";

export type DocumentType =
  | "NIC_ID_COPY"
  | "PASSPORT_COPY"
  | "CV_RESUME"
  | "EDUCATION_CERTIFICATE"
  | "PREVIOUS_EMPLOYMENT_LETTER"
  | "BANK_DETAILS"
  | "SIGNED_CONTRACT"
  | "OTHER";

export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  department_id: string;
  position_id: string;
  joining_date: string;
  employment_type: EmploymentType;
  basic_salary: number;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: DocumentType;
  original_file_name: string;
  stored_file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface CreateEmployeePayload {
  employee_code?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  department_id: string;
  position_id: string;
  joining_date: string;
  employment_type?: EmploymentType;
  basic_salary?: number;
  status?: EmployeeStatus;
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {}

export const DOCUMENT_TYPE_OPTIONS: { label: string; value: DocumentType }[] = [
  { label: "NIC / ID Copy", value: "NIC_ID_COPY" },
  { label: "Passport Copy", value: "PASSPORT_COPY" },
  { label: "CV / Resume", value: "CV_RESUME" },
  { label: "Education Certificate", value: "EDUCATION_CERTIFICATE" },
  {
    label: "Previous Employment Letter",
    value: "PREVIOUS_EMPLOYMENT_LETTER",
  },
  { label: "Bank Details", value: "BANK_DETAILS" },
  { label: "Signed Contract", value: "SIGNED_CONTRACT" },
  { label: "Other", value: "OTHER" },
];

export const EMPLOYMENT_TYPE_OPTIONS: {
  label: string;
  value: EmploymentType;
}[] = [
  { label: "Full Time", value: "FULL_TIME" },
  { label: "Part Time", value: "PART_TIME" },
  { label: "Contract", value: "CONTRACT" },
  { label: "Intern", value: "INTERN" },
];

export const EMPLOYEE_STATUS_OPTIONS: {
  label: string;
  value: EmployeeStatus;
}[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Onboarding", value: "ONBOARDING" },
  { label: "Terminated", value: "TERMINATED" },
];
