import { apiRequest } from "./api";
import type {
  ApiResponse,
  DiscordChannel,
  DiscordServer,
  ServerConfiguration,
} from "../types/server";

export async function getServers() {
  const response = await apiRequest<
    ApiResponse<DiscordServer[]>
  >("/api/servers");

  return response.data;
}

export async function getServerChannels(serverId: string) {
  const response = await apiRequest<
    ApiResponse<DiscordChannel[]>
  >(`/api/servers/${serverId}/channels`);

  return response.data;
}

export async function getServerConfiguration(
  serverId: string,
) {
  const response = await apiRequest<
    ApiResponse<ServerConfiguration>
  >(`/api/servers/${serverId}/config`);

  return response.data;
}

export async function saveServerConfiguration(
  serverId: string,
  configuration: {
    commandChannelId: string;
    mirrorChannelId: string;
  },
) {
  const response = await apiRequest<
    ApiResponse<ServerConfiguration>
  >(`/api/servers/${serverId}/config`, {
    method: "PUT",
    body: JSON.stringify(configuration),
  });

  return response.data;
}