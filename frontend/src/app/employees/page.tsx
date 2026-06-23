"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FileUpload from "@/components/ui/FileUpload";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import Table from "@/components/ui/Table";
import { getStoredUser } from "@/lib/auth";
import { getDepartments } from "@/lib/departments";
import {
  createEmployee,
  deleteEmployee,
  deleteEmployeeDocument,
  downloadEmployeeDocument,
  getEmployeeDocuments,
  getEmployees,
  updateEmployee,
  uploadEmployeeDocument,
} from "@/lib/employees";
import { getPositions } from "@/lib/positions";
import type { Department } from "@/types/department";
import type {
  DocumentType,
  Employee,
  EmployeeDocument,
  EmployeeStatus,
  EmploymentType,
} from "@/types/employee";
import {
  DOCUMENT_TYPE_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
} from "@/types/employee";
import type { Position } from "@/types/position";

const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatFileSize(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function getStatusVariant(status: EmployeeStatus) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "ONBOARDING":
      return "warning" as const;
    case "TERMINATED":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

export default function EmployeesPage() {
  const user = getStoredUser();
  const isAdmin = user?.role === "admin";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [employeeCode, setEmployeeCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>("FULL_TIME");
  const [basicSalary, setBasicSalary] = useState("0");
  const [status, setStatus] = useState<EmployeeStatus>("ONBOARDING");
  const [documentType, setDocumentType] = useState<DocumentType>("OTHER");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const departmentMap = Object.fromEntries(
    departments.map((department) => [department.id, department.name]),
  );
  const positionMap = Object.fromEntries(
    positions.map((position) => [position.id, position.title]),
  );

  const filteredPositions = useMemo(
    () => positions.filter((position) => position.department_id === departmentId),
    [positions, departmentId],
  );

  function getDefaultPositionId(deptId: string) {
    return positions.find((position) => position.department_id === deptId)?.id ?? "";
  }

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [employeesData, departmentsData, positionsData] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getPositions(),
      ]);
      setEmployees(employeesData);
      setDepartments(departmentsData);
      setPositions(positionsData);
    } catch {
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadDocuments(employeeId: string) {
    const data = await getEmployeeDocuments(employeeId);
    setDocuments(data);
  }

  function resetForm() {
    setEmployeeCode("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setDepartmentId(departments[0]?.id ?? "");
    setPositionId("");
    setJoiningDate("");
    setEmploymentType("FULL_TIME");
    setBasicSalary("0");
    setStatus("ONBOARDING");
    setDocumentType("OTHER");
    setPendingFiles([]);
    setDocuments([]);
  }

  function openCreateModal() {
    setEditingEmployee(null);
    setFormError("");
    const defaultDepartmentId = departments[0]?.id ?? "";
    resetForm();
    setDepartmentId(defaultDepartmentId);
    setPositionId(getDefaultPositionId(defaultDepartmentId));
    setIsModalOpen(true);
  }

  async function openEditModal(employee: Employee) {
    setFormError("");
    setEditingEmployee(employee);
    setEmployeeCode(employee.employee_code);
    setFirstName(employee.first_name);
    setLastName(employee.last_name);
    setEmail(employee.email);
    setPhone(employee.phone ?? "");
    setAddress(employee.address ?? "");
    setDepartmentId(employee.department_id);
    setPositionId(employee.position_id);
    setJoiningDate(employee.joining_date);
    setEmploymentType(employee.employment_type);
    setBasicSalary(String(employee.basic_salary));
    setStatus(employee.status);
    setPendingFiles([]);
    setIsModalOpen(true);

    try {
      await loadDocuments(employee.id);
    } catch {
      setDocuments([]);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setPendingFiles([]);
    setDocuments([]);
    setFormError("");
  }

  function validateFiles(files: File[]) {
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`${file.name} exceeds the 5 MB limit`);
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");

    if (!positionId) {
      setFormError("Please select a position for the chosen department");
      setSubmitting(false);
      return;
    }

    if (!joiningDate) {
      setFormError("Please select a joining date");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        employee_code: employeeCode || undefined,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address,
        department_id: departmentId,
        position_id: positionId,
        joining_date: joiningDate,
        employment_type: employmentType,
        basic_salary: Number(basicSalary),
        status,
      };

      let employee: Employee;

      if (editingEmployee) {
        employee = await updateEmployee(editingEmployee.id, payload);
      } else {
        validateFiles(pendingFiles);
        employee = await createEmployee(payload);

        for (const file of pendingFiles) {
          await uploadEmployeeDocument(employee.id, file, documentType);
        }
      }

      closeModal();
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save employee");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUploadDocuments() {
    if (!editingEmployee || pendingFiles.length === 0) {
      return;
    }

    setUploading(true);
    setFormError("");

    try {
      validateFiles(pendingFiles);

      for (const file of pendingFiles) {
        await uploadEmployeeDocument(
          editingEmployee.id,
          file,
          documentType,
        );
      }

      setPendingFiles([]);
      await loadDocuments(editingEmployee.id);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to upload documents");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteEmployee(id: string) {
    if (!confirm("Delete this employee?")) return;

    setError("");

    try {
      await deleteEmployee(id);
      await loadData();
    } catch {
      setError("Failed to delete employee");
    }
  }

  async function handleDeleteDocument(documentId: string) {
    if (!confirm("Delete this document?")) return;

    setError("");

    try {
      await deleteEmployeeDocument(documentId);
      if (editingEmployee) {
        await loadDocuments(editingEmployee.id);
      }
    } catch {
      setError("Failed to delete document");
    }
  }

  return (
    <Card title="Employees">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-body text-secondary">Employee onboarding and records</p>
        {isAdmin && (
          <Button
            onClick={openCreateModal}
            disabled={departments.length === 0 || positions.length === 0}
          >
            Add Employee
          </Button>
        )}
      </div>

      {(departments.length === 0 || positions.length === 0) && !loading && (
        <p className="mb-4 text-body text-warning">
          Create departments and positions before onboarding employees.
        </p>
      )}

      {error && <p className="mb-4 text-body text-danger">{error}</p>}

      {loading ? (
        <p className="text-body text-secondary">Loading employees...</p>
      ) : (
        <Table
          columns={
            isAdmin
              ? ["Code", "Name", "Email", "Department", "Status", "Actions"]
              : ["Code", "Name", "Email", "Department", "Status"]
          }
        >
          {employees.length === 0 ? (
            <tr>
              <td
                colSpan={isAdmin ? 6 : 5}
                className="px-4 py-8 text-center text-body text-secondary"
              >
                No employees yet
              </td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-4 py-3 text-body">{employee.employee_code}</td>
                <td className="px-4 py-3 text-body">
                  {employee.first_name} {employee.last_name}
                </td>
                <td className="px-4 py-3 text-body text-secondary">
                  {employee.email}
                </td>
                <td className="px-4 py-3 text-body text-secondary">
                  {departmentMap[employee.department_id] || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={employee.status}
                    variant={getStatusVariant(employee.status)}
                  />
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => openEditModal(employee)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </Table>
      )}

      <Modal
        isOpen={isModalOpen}
        title={editingEmployee ? "Edit Employee" : "Onboard Employee"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-2">
          {formError && (
            <p className="rounded-md bg-danger/10 px-3 py-2 text-body text-danger">
              {formError}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Employee Code"
              name="employee_code"
              value={employeeCode}
              onChange={(event) => setEmployeeCode(event.target.value)}
              placeholder="Auto-generated if empty"
            />
            <Input
              label="Joining Date"
              type="date"
              name="joining_date"
              value={joiningDate}
              onChange={(event) => setJoiningDate(event.target.value)}
              required
            />
            <Input
              label="First Name"
              name="first_name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
            <Input
              label="Last Name"
              name="last_name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Phone"
              name="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <Input
              label="Basic Salary"
              type="number"
              min="0"
              step="0.01"
              name="basic_salary"
              value={basicSalary}
              onChange={(event) => setBasicSalary(event.target.value)}
            />
            <Select
              label="Employment Type"
              name="employment_type"
              value={employmentType}
              onChange={(event) =>
                setEmploymentType(event.target.value as EmploymentType)
              }
              options={EMPLOYMENT_TYPE_OPTIONS}
            />
            <Select
              label="Department"
              name="department_id"
              value={departmentId}
              onChange={(event) => {
                const nextDepartmentId = event.target.value;
                setDepartmentId(nextDepartmentId);
                setPositionId(getDefaultPositionId(nextDepartmentId));
              }}
              options={departments.map((department) => ({
                label: department.name,
                value: department.id,
              }))}
              required
            />
            <Select
              label="Position"
              name="position_id"
              value={positionId}
              onChange={(event) => setPositionId(event.target.value)}
              placeholder="Select a position"
              options={filteredPositions.map((position) => ({
                label: position.title,
                value: position.id,
              }))}
              required
            />
            <Select
              label="Status"
              name="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as EmployeeStatus)
              }
              options={EMPLOYEE_STATUS_OPTIONS}
            />
          </div>

          <Input
            label="Address"
            name="address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />

          <div className="rounded-lg border border-secondary/20 bg-surface/50 p-4">
            <h4 className="mb-1 text-subheading font-semibold">Documents</h4>
            <p className="mb-4 text-caption text-secondary">
              Attach onboarding documents for this employee
            </p>

            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <Select
                label="Document Type"
                name="document_type"
                value={documentType}
                onChange={(event) =>
                  setDocumentType(event.target.value as DocumentType)
                }
                options={DOCUMENT_TYPE_OPTIONS}
              />
              <FileUpload
                label="Upload Documents"
                accept={ACCEPTED_FILE_TYPES}
                multiple
                onChange={setPendingFiles}
              />
            </div>

            {pendingFiles.length > 0 && (
              <div className="mb-4 rounded-md border border-secondary/20 bg-white p-3">
                <p className="mb-2 text-body font-medium">Selected files</p>
                <ul className="space-y-2">
                  {pendingFiles.map((file) => (
                    <li
                      key={`${file.name}-${file.size}`}
                      className="flex items-center justify-between rounded-md bg-surface px-3 py-2 text-body"
                    >
                      <span className="truncate pr-3">{file.name}</span>
                      <span className="shrink-0 text-caption text-secondary">
                        {formatFileSize(file.size)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {editingEmployee && (
              <>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={handleUploadDocuments}
                  disabled={uploading || pendingFiles.length === 0}
                >
                  {uploading ? "Uploading..." : "Upload Selected Documents"}
                </Button>

                <div className="mt-4 space-y-2">
                  {documents.length === 0 ? (
                    <p className="text-body text-secondary">No documents uploaded</p>
                  ) : (
                    documents.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between rounded-md bg-surface px-3 py-2"
                      >
                        <div>
                          <p className="text-body font-medium">
                            {document.original_file_name}
                          </p>
                          <p className="text-caption text-secondary">
                            {document.document_type} · {formatFileSize(document.file_size)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              downloadEmployeeDocument(
                                document.id,
                                document.original_file_name,
                              )
                            }
                          >
                            Download
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => handleDeleteDocument(document.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Employee"}
          </Button>
        </form>
      </Modal>
    </Card>
  );
}
