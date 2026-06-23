"use client";

import { FormEvent, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import Table from "@/components/ui/Table";
import { getStoredUser } from "@/lib/auth";
import { getDepartments } from "@/lib/departments";
import { createPosition, deletePosition, getPositions, updatePosition, } from "@/lib/positions";
import type { Department } from "@/types/department";
import type { Position } from "@/types/position";

export default function PositionsPage() {
  const user = getStoredUser();
  const isAdmin = user?.role === "admin";

  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [departmentId, setDepartmentId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const departmentMap = Object.fromEntries(
    departments.map((department) => [department.id, department.name]),
  );

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [positionsData, departmentsData] = await Promise.all([
        getPositions(),
        getDepartments(),
      ]);
      setPositions(positionsData);
      setDepartments(departmentsData);
    } catch {
      setError("Failed to load positions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreateModal() {
    setEditingPosition(null);
    setDepartmentId(departments[0]?.id ?? "");
    setTitle("");
    setDescription("");
    setIsActive(true);
    setIsModalOpen(true);
  }

  function openEditModal(position: Position) {
    setEditingPosition(position);
    setDepartmentId(position.department_id);
    setTitle(position.title);
    setDescription(position.description ?? "");
    setIsActive(position.is_active);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingPosition(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (editingPosition) {
        await updatePosition(editingPosition.id, {
          department_id: departmentId,
          title,
          description,
          is_active: isActive,
        });
      } else {
        await createPosition({
          department_id: departmentId,
          title,
          description,
          is_active: isActive,
        });
      }

      closeModal();
      await loadData();
    } catch {
      setError("Failed to save position");
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
      await deletePosition(deleteId);
      await loadData();
      setDeleteId(null);
    } catch {
      setError("Failed to delete position");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card title="Positions">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-body text-secondary">Manage job positions</p>
        {isAdmin && (
          <Button onClick={openCreateModal} disabled={departments.length === 0}>
            Add Position
          </Button>
        )}
      </div>

      {departments.length === 0 && !loading && (
        <p className="mb-4 text-body text-warning">
          Create a department before adding positions.
        </p>
      )}

      {error && <p className="mb-4 text-body text-danger">{error}</p>}

      {loading ? (
        <p className="text-body text-secondary">Loading positions...</p>
      ) : (
        <Table
          columns={
            isAdmin
              ? ["Title", "Department", "Status", "Actions"]
              : ["Title", "Department", "Status"]
          }
        >
          {positions.length === 0 ? (
            <tr>
              <td
                colSpan={isAdmin ? 4 : 3}
                className="px-4 py-8 text-center text-body text-secondary"
              >
                No positions yet
              </td>
            </tr>
          ) : (
            positions.map((position) => (
              <tr key={position.id}>
                <td className="px-4 py-3 text-body">{position.title}</td>
                <td className="px-4 py-3 text-body text-secondary">
                  {departmentMap[position.department_id] || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={position.is_active ? "Active" : "Inactive"}
                    variant={position.is_active ? "success" : "neutral"}
                  />
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        onClick={() => openEditModal(position)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => setDeleteId(position.id)}
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
        title={editingPosition ? "Edit Position" : "Add Position"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label="Department"
            name="department_id"
            value={departmentId}
            onChange={(event) => setDepartmentId(event.target.value)}
            options={departments.map((department) => ({
              label: department.name,
              value: department.id,
            }))}
            required
          />
          <Input
            label="Title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
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
          <Button type="submit" disabled={submitting || !departmentId}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Are you sure you want to delete this position? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </Card>
  );
}
