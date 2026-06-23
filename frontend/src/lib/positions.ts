import { api } from "./api";
import type {
  CreatePositionPayload,
  Position,
  UpdatePositionPayload,
} from "@/types/position";

export function getPositions() {
  return api<Position[]>("/positions");
}

export function getPosition(id: string) {
  return api<Position>(`/positions/${id}`);
}

export function createPosition(payload: CreatePositionPayload) {
  return api<Position>("/positions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePosition(id: string, payload: UpdatePositionPayload) {
  return api<Position>(`/positions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deletePosition(id: string) {
  return api<{ message: string }>(`/positions/${id}`, {
    method: "DELETE",
  });
}
