import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-slate-600">
              Welcome, {user?.username}.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Authentication
          </h2>

          <p className="mt-2 text-sm text-green-600">
            ✓ Authenticated successfully
          </p>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              <strong>Discord ID:</strong>{" "}
              {user?.discordId}
            </p>

            <p>
              <strong>Role:</strong> {user?.role}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}