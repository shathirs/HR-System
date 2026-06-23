"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Table from "@/components/ui/Table";
import { getDashboardStats } from "@/lib/dashboard";
import type { DashboardStats } from "@/types/dashboard";
import type { EmployeeStatus } from "@/types/employee";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getMonthLabel(month: number) {
  return new Date(2000, month - 1, 1).toLocaleString("en-US", {
    month: "long",
  });
}

function getEmployeeStatusVariant(status: EmployeeStatus) {
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError("");

      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return <p className="text-body text-secondary">Loading dashboard...</p>;
  }

  if (error || !stats) {
    return <p className="text-body text-danger">{error || "Dashboard unavailable"}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Employees">
          <p className="text-heading font-semibold text-primary">
            {stats.total_employees}
          </p>
        </Card>
        <Card title="Total Departments">
          <p className="text-heading font-semibold text-primary">
            {stats.total_departments}
          </p>
        </Card>
        <Card title="Total Positions">
          <p className="text-heading font-semibold text-primary">
            {stats.total_positions}
          </p>
        </Card>
        <Card title="Monthly Payroll Total">
          <p className="text-caption text-secondary">
            {getMonthLabel(stats.payroll_month)} {stats.payroll_year}
          </p>
          <p className="mt-1 text-heading font-semibold text-primary">
            {formatCurrency(stats.monthly_payroll_total)}
          </p>
          <p className="mt-2 text-caption text-secondary">
            {stats.pending_payrolls_count} pending payroll
            {stats.pending_payrolls_count === 1 ? "" : "s"}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent Employees">
          <Table columns={["Employee", "Email", "Status", "Joined"]}>
            {stats.recent_employees.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-body text-secondary"
                >
                  No employees yet
                </td>
              </tr>
            ) : (
              stats.recent_employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-4 py-3 text-body">
                    <p className="font-medium">
                      {employee.first_name} {employee.last_name}
                    </p>
                    <p className="text-caption text-secondary">
                      {employee.employee_code}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-body text-secondary">
                    {employee.email}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={employee.status}
                      variant={getEmployeeStatusVariant(employee.status)}
                    />
                  </td>
                  <td className="px-4 py-3 text-body text-secondary">
                    {formatDate(employee.created_at)}
                  </td>
                </tr>
              ))
            )}
          </Table>
        </Card>

        <Card title="Pending Payrolls">
          <Table columns={["Employee", "Period", "Net Salary", "Status"]}>
            {stats.pending_payrolls.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-body text-secondary"
                >
                  No pending payrolls
                </td>
              </tr>
            ) : (
              stats.pending_payrolls.map((payroll) => (
                <tr key={payroll.id}>
                  <td className="px-4 py-3 text-body">
                    {payroll.employee_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-body text-secondary">
                    {getMonthLabel(payroll.month)} {payroll.year}
                  </td>
                  <td className="px-4 py-3 text-body font-medium">
                    {formatCurrency(payroll.net_salary)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={payroll.payment_status} variant="warning" />
                  </td>
                </tr>
              ))
            )}
          </Table>
        </Card>
      </div>
    </div>
  );
}
