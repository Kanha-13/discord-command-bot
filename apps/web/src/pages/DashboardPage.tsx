import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ConfigurationPanel from "../components/ConfigurationPanel";
import InteractionTable from "../components/InteractionTable";
import Pagination from "../components/Pagination";
import { getServers } from "../services/server.service";
import { getInteractions } from "../services/interaction.service";
import type { DiscordServer } from "../types/server";
import type { CommandInteraction } from "../types/interaction";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [servers, setServers] = useState<DiscordServer[]>(
    [],
  );

  const [selectedServerId, setSelectedServerId] =
    useState("");

  const [interactions, setInteractions] = useState<
    CommandInteraction[]
  >([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loadingServers, setLoadingServers] =
    useState(true);

  const [loadingInteractions, setLoadingInteractions] =
    useState(true);

  const [serverError, setServerError] = useState("");
  const [interactionError, setInteractionError] =
    useState("");

  useEffect(() => {
    async function loadServers() {
      try {
        setLoadingServers(true);
        setServerError("");

        const data = await getServers();

        setServers(data);

        if (data.length > 0) {
          setSelectedServerId(data[0].id);
        }
      } catch (error) {
        setServerError(
          error instanceof Error
            ? error.message
            : "Failed to load servers.",
        );
      } finally {
        setLoadingServers(false);
      }
    }

    loadServers();
  }, []);

  const loadInteractions = useCallback(
    async (showLoading = true) => {
      if (!selectedServerId) {
        setInteractions([]);
        return;
      }

      try {
        if (showLoading) {
          setLoadingInteractions(true);
        }

        setInteractionError("");

        const result = await getInteractions({
          page,
          limit: 20,
          serverId: selectedServerId,
        });

        setInteractions(result.items);
        setTotalPages(result.pagination.totalPages);
      } catch (error) {
        setInteractionError(
          error instanceof Error
            ? error.message
            : "Failed to load command activity.",
        );
      } finally {
        if (showLoading) {
          setLoadingInteractions(false);
        }
      }
    },
    [selectedServerId, page],
  );

  useEffect(() => {
    setPage(1);
  }, [selectedServerId]);

  useEffect(() => {
    loadInteractions(true);

    const interval = window.setInterval(() => {
      loadInteractions(false);
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadInteractions]);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Discord Command Bot
            </h1>

            <p className="text-sm text-slate-500">
              Bot management dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-8 w-8 rounded-full"
              />
            )}

            <span className="text-sm font-medium text-slate-700">
              {user?.username}
            </span>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Discord Server
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select the server you want to manage.
          </p>

          {loadingServers ? (
            <p className="mt-5 text-sm text-slate-500">
              Loading servers...
            </p>
          ) : serverError ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          ) : servers.length === 0 ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              No Discord servers are available.
            </div>
          ) : (
            <select
              value={selectedServerId}
              onChange={(event) => {
                setSelectedServerId(
                  event.target.value,
                );
              }}
              className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 md:max-w-md"
            >
              {servers.map((server) => (
                <option
                  key={server.id}
                  value={server.id}
                >
                  {server.name}
                </option>
              ))}
            </select>
          )}
        </section>

        {selectedServerId && (
          <ConfigurationPanel
            serverId={selectedServerId}
          />
        )}

        {interactionError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {interactionError}
          </div>
        )}

        <InteractionTable
          interactions={interactions}
          loading={loadingInteractions}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </main>
  );
}