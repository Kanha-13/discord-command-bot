import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">
          Discord Command Bot
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Sign in with Discord to manage your bot.
        </p>

        <button
          type="button"
          onClick={login}
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-700"
        >
          Continue with Discord
        </button>
      </div>
    </main>
  );
}