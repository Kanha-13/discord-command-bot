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

  const [servers, setServers] = useState<DiscordServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [interactions, setInteractions] = useState<CommandInteraction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingServers, setLoadingServers] = useState(true);
  const [loadingInteractions, setLoadingInteractions] = useState(true);
  const [serverError, setServerError] = useState("");
  const [interactionError, setInteractionError] = useState("");

  useEffect(() => {
    async function loadServers() {
      try {
        setLoadingServers(true);
        setServerError("");
        const data = await getServers();
        setServers(data);
        if (data.length > 0) setSelectedServerId(data[0].id);
      } catch (error) {
        setServerError(error instanceof Error ? error.message : "Failed to load servers.");
      } finally {
        setLoadingServers(false);
      }
    }
    loadServers();
  }, []);

  const loadInteractions = useCallback(
    async (showLoading = true) => {
      if (!selectedServerId) { setInteractions([]); return; }
      try {
        if (showLoading) setLoadingInteractions(true);
        setInteractionError("");
        const result = await getInteractions({ page, limit: 20, serverId: selectedServerId });
        setInteractions(result.items);
        setTotalPages(result.pagination.totalPages);
      } catch (error) {
        setInteractionError(error instanceof Error ? error.message : "Failed to load command activity.");
      } finally {
        if (showLoading) setLoadingInteractions(false);
      }
    },
    [selectedServerId, page],
  );

  useEffect(() => { setPage(1); }, [selectedServerId]);

  useEffect(() => {
    loadInteractions(true);
    const interval = window.setInterval(() => loadInteractions(false), 3000);
    return () => window.clearInterval(interval);
  }, [loadInteractions]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-950 text-white">

      {/* Ambient background blobs — fixed so they don't scroll */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 -top-48 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/8 blur-2xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgb(255 255 255) 1px, transparent 1px),
                            linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shadow-md shadow-indigo-500/30">
              <svg className="h-4 w-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019 9.617 9.617 0 0 0 .724-1.18.05.05 0 0 0-.028-.07 8.743 8.743 0 0 1-1.248-.595.05.05 0 0 1-.005-.083c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.05.05 0 0 1-.004.083 8.175 8.175 0 0 1-1.249.594.05.05 0 0 0-.03.07c.24.454.5.88.757 1.18a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-white">Discord Command Bot</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Management dashboard</p>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-7 w-7 rounded-full ring-2 ring-white/10"
              />
            )}
            <span className="hidden text-xs font-medium text-slate-400 sm:block">
              {user?.username}
            </span>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4.5 6h6m-2-2l2 2-2 2M7.5 3V2a1 1 0 0 0-1-1h-5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Page body */}
      <div className="relative z-10 mx-auto max-w-6xl space-y-5 px-6 py-8">

        {/* Server selector */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="border-b border-white/8 px-6 py-5">
            <h2 className="text-sm font-semibold tracking-tight text-white">Discord Server</h2>
            <p className="mt-0.5 text-xs text-slate-500">Select the server you want to manage.</p>
          </div>

          <div className="px-6 py-5">
            {loadingServers ? (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/10 border-t-slate-400" />
                Loading servers…
              </div>
            ) : serverError ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <svg className="mt-px h-3.5 w-3.5 shrink-0 text-red-400" viewBox="0 0 12 12" fill="none">
                  <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                <p className="text-xs text-red-400">{serverError}</p>
              </div>
            ) : servers.length === 0 ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                <svg className="mt-px h-3.5 w-3.5 shrink-0 text-amber-400" viewBox="0 0 12 12" fill="none">
                  <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                <p className="text-xs text-amber-400">No Discord servers are available.</p>
              </div>
            ) : (
              <select
                value={selectedServerId}
                onChange={(e) => setSelectedServerId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 backdrop-blur-sm outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 md:max-w-xs"
              >
                {servers.map((server) => (
                  <option key={server.id} value={server.id} className="bg-slate-900 text-white">
                    {server.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Config panel */}
        {selectedServerId && <ConfigurationPanel serverId={selectedServerId} />}

        {/* Interaction error */}
        {interactionError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 backdrop-blur-sm">
            <svg className="mt-px h-3.5 w-3.5 shrink-0 text-red-400" viewBox="0 0 12 12" fill="none">
              <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            <p className="text-xs text-red-400">{interactionError}</p>
          </div>
        )}

        {/* Activity table */}
        <InteractionTable interactions={interactions} loading={loadingInteractions} />

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      </div>
    </main>
  );
}