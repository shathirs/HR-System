"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import Table from "@/components/ui/Table";
import { getStoredUser } from "@/lib/auth";
import { getEmployees } from "@/lib/employees";
import {
  createPayroll,
  deletePayroll,
  getPayrolls,
  updatePayroll,
} from "@/lib/payrolls";
import type { Employee } from "@/types/employee";
import type { PaymentStatus, Payroll } from "@/types/payroll";
import { MONTH_OPTIONS, PAYMENT_STATUS_OPTIONS } from "@/types/payroll";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getPaymentVariant(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "success" as const;
    case "FAILED":
      return "danger" as const;
    default:
      return "warning" as const;
  }
}

function getMonthLabel(month: number) {
  return new Date(2000, month - 1, 1).toLocaleString("en-US", {
    month: "short",
  });
}

export default function PayrollPage() {
  const user = getStoredUser();
  const isAdmin = user?.role === "admin";

  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [basicSalary, setBasicSalary] = useState("0");
  const [allowances, setAllowances] = useState("0");
  const [deductions, setDeductions] = useState("0");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PENDING");

  const employeeMap = Object.fromEntries(
    employees.map((employee) => [
      employee.id,
      `${employee.first_name} ${employee.last_name}`,
    ]),
  );

  const netSalary = useMemo(() => {
    return (
      Number(basicSalary || 0) +
      Number(allowances || 0) -
      Number(deductions || 0)
    );
  }, [basicSalary, allowances, deductions]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [payrollsData, employeesData] = await Promise.all([
        getPayrolls(),
        getEmployees(),
      ]);
      setPayrolls(payrollsData);
      setEmployees(employeesData);
    } catch {
      setError("Failed to load payroll records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setEmployeeId(employees[0]?.id ?? "");
    setMonth(String(new Date().getMonth() + 1));
    setYear(String(new Date().getFullYear()));
    setBasicSalary("0");
    setAllowances("0");
    setDeductions("0");
    setPaymentStatus("PENDING");
  }

  function openCreateModal() {
    setEditingPayroll(null);
    setFormError("");
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(payroll: Payroll) {
    setEditingPayroll(payroll);
    setFormError("");
    setEmployeeId(payroll.employee_id);
    setMonth(String(payroll.month));
    setYear(String(payroll.year));
    setBasicSalary(String(payroll.basic_salary));
    setAllowances(String(payroll.allowances));
    setDeductions(String(payroll.deductions));
    setPaymentStatus(payroll.payment_status);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingPayroll(null);
    setFormError("");
  }

  function handleEmployeeChange(nextEmployeeId: string) {
    setEmployeeId(nextEmployeeId);
    const employee = employees.find((item) => item.id === nextEmployeeId);
    if (employee && !editingPayroll) {
      setBasicSalary(String(employee.basic_salary));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");

    if (!employeeId) {
      setFormError("Please select an employee");
      setSubmitting(false);
      return;
    }

    const payload = {
      employee_id: employeeId,
      month: Number(month),
      year: Number(year),
      basic_salary: Number(basicSalary),
      allowances: Number(allowances),
      deductions: Number(deductions),
      payment_status: paymentStatus,
    };

    try {
      if (editingPayroll) {
        await updatePayroll(editingPayroll.id, payload);
      } else {
        await createPayroll(payload);
      }

      closeModal();
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save payroll");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deletePayroll(deleteId);
      await loadData();
      setDeleteId(null);
    } catch {
      setError("Failed to delete payroll record");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card title="Payroll">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-body text-secondary">Manage employee payroll records</p>
        {isAdmin && (
          <Button onClick={openCreateModal} disabled={employees.length === 0}>
            Add Payroll
          </Button>
        )}
      </div>

      {employees.length === 0 && !loading && (
        <p className="mb-4 text-body text-warning">
          Create employees before adding payroll records.
        </p>
      )}

      {error && <p className="mb-4 text-body text-danger">{error}</p>}

      {loading ? (
        <p className="text-body text-secondary">Loading payroll records...</p>
      ) : (
        <Table
          columns={
            isAdmin
              ? ["Employee", "Period", "Net Salary", "Status", "Actions"]
              : ["Employee", "Period", "Net Salary", "Status"]
          }
        >
          {payrolls.length === 0 ? (
            <tr>
              <td
                colSpan={isAdmin ? 5 : 4}
                className="px-4 py-8 text-center text-body text-secondary"
              >
                No payroll records yet
              </td>
            </tr>
          ) : (
            payrolls.map((payroll) => (
              <tr key={payroll.id}>
                <td className="px-4 py-3 text-body">
                  {employeeMap[payroll.employee_id] || "—"}
                </td>
                <td className="px-4 py-3 text-body text-secondary">
                  {getMonthLabel(payroll.month)} {payroll.year}
                </td>
                <td className="px-4 py-3 text-body font-medium">
                  {formatCurrency(payroll.net_salary)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={payroll.payment_status}
                    variant={getPaymentVariant(payroll.payment_status)}
                  />
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        onClick={() => openEditModal(payroll)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => setDeleteId(payroll.id)}
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
        title={editingPayroll ? "Edit Payroll" : "Add Payroll"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <p className="rounded-md bg-danger/10 px-3 py-2 text-body text-danger">
              {formError}
            </p>
          )}

          <Select
            label="Employee"
            name="employee_id"
            value={employeeId}
            onChange={(event) => handleEmployeeChange(event.target.value)}
            placeholder="Select an employee"
            options={employees.map((employee) => ({
              label: `${employee.first_name} ${employee.last_name} (${employee.employee_code})`,
              value: employee.id,
            }))}
            required
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Month"
              name="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              options={MONTH_OPTIONS}
              required
            />
            <Input
              label="Year"
              type="number"
              min="2000"
              max="2100"
              name="year"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              required
            />
            <Input
              label="Basic Salary"
              type="number"
              min="0"
              step="0.01"
              name="basic_salary"
              value={basicSalary}
              onChange={(event) => setBasicSalary(event.target.value)}
              required
            />
            <Input
              label="Allowances"
              type="number"
              min="0"
              step="0.01"
              name="allowances"
              value={allowances}
              onChange={(event) => setAllowances(event.target.value)}
            />
            <Input
              label="Deductions"
              type="number"
              min="0"
              step="0.01"
              name="deductions"
              value={deductions}
              onChange={(event) => setDeductions(event.target.value)}
            />
            <Select
              label="Payment Status"
              name="payment_status"
              value={paymentStatus}
              onChange={(event) =>
                setPaymentStatus(event.target.value as PaymentStatus)
              }
              options={PAYMENT_STATUS_OPTIONS}
            />
          </div>

          <div className="rounded-md border border-secondary/20 bg-surface px-4 py-3">
            <p className="text-caption text-secondary">Calculated Net Salary</p>
            <p className="text-subheading font-semibold">
              {formatCurrency(netSalary)}
            </p>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Payroll"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Are you sure you want to delete this payroll record? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </Card>
  );
}
