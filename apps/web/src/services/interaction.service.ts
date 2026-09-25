import { apiRequest } from "./api";
import type {
  InteractionListResponse,
} from "../types/interaction";

export interface InteractionFilters {
  page?: number;
  limit?: number;
  serverId?: string;
  command?: string;
  status?: string;
}

export async function getInteractions(
  filters: InteractionFilters = {},
) {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.limit) {
    params.set("limit", String(filters.limit));
  }

  if (filters.serverId) {
    params.set("serverId", filters.serverId);
  }

  if (filters.command) {
    params.set("command", filters.command);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();

  const response =
    await apiRequest<InteractionListResponse>(
      `/api/interactions${query ? `?${query}` : ""}`,
    );

  return response.data;
}