import { api } from "./api";
import type {
  CreateDepartmentPayload,
  Department,
  UpdateDepartmentPayload,
} from "@/types/department";

export function getDepartments() {
  return api<Department[]>("/departments");
}

export function getDepartment(id: string) {
  return api<Department>(`/departments/${id}`);
}

export function createDepartment(payload: CreateDepartmentPayload) {
  return api<Department>("/departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDepartment(id: string, payload: UpdateDepartmentPayload) {
  return api<Department>(`/departments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteDepartment(id: string) {
  return api<{ message: string }>(`/departments/${id}`, {
    method: "DELETE",
  });
}
