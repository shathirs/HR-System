"use client";

import { FormEvent, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import Table from "@/components/ui/Table";
import { getStoredUser } from "@/lib/auth";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "@/lib/departments";
import type { Department } from "@/types/department";

export default function DepartmentsPage() {
  const user = getStoredUser();
  const isAdmin = user?.role === "admin";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadDepartments() {
    setLoading(true);
    setError("");

    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch {
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  function openCreateModal() {
    setEditingDepartment(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setIsModalOpen(true);
  }

  function openEditModal(department: Department) {
    setEditingDepartment(department);
    setName(department.name);
    setDescription(department.description ?? "");
    setIsActive(department.is_active);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingDepartment(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, {
          name,
          description,
          is_active: isActive,
        });
      } else {
        await createDepartment({
          name,
          description,
          is_active: isActive,
        });
      }

      closeModal();
      await loadDepartments();
    } catch {
      setError("Failed to save department");
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
      await deleteDepartment(deleteId);
      await loadDepartments();
      setDeleteId(null);
    } catch {
      setError("Failed to delete department");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card
      title="Departments"
      className={isAdmin ? "" : ""}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-body text-secondary">
          Manage company departments
        </p>
        {isAdmin && <Button onClick={openCreateModal}>Add Department</Button>}
      </div>

      {error && <p className="mb-4 text-body text-danger">{error}</p>}

      {loading ? (
        <p className="text-body text-secondary">Loading departments...</p>
      ) : (
        <Table
          columns={
            isAdmin
              ? ["Name", "Description", "Status", "Actions"]
              : ["Name", "Description", "Status"]
          }
        >
          {departments.length === 0 ? (
            <tr>
              <td
                colSpan={isAdmin ? 4 : 3}
                className="px-4 py-8 text-center text-body text-secondary"
              >
                No departments yet
              </td>
            </tr>
          ) : (
            departments.map((department) => (
              <tr key={department.id}>
                <td className="px-4 py-3 text-body">{department.name}</td>
                <td className="px-4 py-3 text-body text-secondary">
                  {department.description || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={department.is_active ? "Active" : "Inactive"}
                    variant={department.is_active ? "success" : "neutral"}
                  />
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        onClick={() => openEditModal(department)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => setDeleteId(department.id)}
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
        title={editingDepartment ? "Edit Department" : "Add Department"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Input
            label="Description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <label className="flex items-center gap-2 text-body">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Active
          </label>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Are you sure you want to delete this department? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </Card>
  );
}
