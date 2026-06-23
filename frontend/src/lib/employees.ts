import { api, apiDownload, apiFormData } from "./api";
import type {
  CreateEmployeePayload,
  DocumentType,
  Employee,
  EmployeeDocument,
  UpdateEmployeePayload,
} from "@/types/employee";

export function getEmployees() {
  return api<Employee[]>("/employees");
}

export function getEmployee(id: string) {
  return api<Employee>(`/employees/${id}`);
}

export function createEmployee(payload: CreateEmployeePayload) {
  return api<Employee>("/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateEmployee(id: string, payload: UpdateEmployeePayload) {
  return api<Employee>(`/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteEmployee(id: string) {
  return api<{ message: string }>(`/employees/${id}`, {
    method: "DELETE",
  });
}

export function getEmployeeDocuments(employeeId: string) {
  return api<EmployeeDocument[]>(`/employees/${employeeId}/documents`);
}

export function uploadEmployeeDocument(
  employeeId: string,
  file: File,
  documentType: DocumentType,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", documentType);

  return apiFormData<EmployeeDocument>(
    `/employees/${employeeId}/documents`,
    formData,
  );
}

export function deleteEmployeeDocument(documentId: string) {
  return api<{ message: string }>(`/employees/documents/${documentId}`, {
    method: "DELETE",
  });
}

export function downloadEmployeeDocument(
  documentId: string,
  filename: string,
) {
  return apiDownload(
    `/employees/documents/${documentId}/download`,
    filename,
  );
}
