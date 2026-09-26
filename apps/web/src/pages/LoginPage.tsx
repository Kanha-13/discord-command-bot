import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">

      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-2xl" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgb(255 255 255) 1px, transparent 1px),
                            linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">

        {/* Logo mark */}
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
          <svg className="h-6 w-6 text-white" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019 9.617 9.617 0 0 0 .724-1.18.05.05 0 0 0-.028-.07 8.743 8.743 0 0 1-1.248-.595.05.05 0 0 1-.005-.083c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.05.05 0 0 1-.004.083 8.175 8.175 0 0 1-1.249.594.05.05 0 0 0-.03.07c.24.454.5.88.757 1.18a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Z"/>
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-lg font-semibold tracking-tight text-white">
          Discord Command Bot
        </h1>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
          Sign in with your Discord account to manage servers, configure commands, and monitor activity.
        </p>

        {/* Divider */}
        <div className="my-6 border-t border-white/10" />

        {/* CTA */}
        <button
          type="button"
          onClick={login}
          className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-[0.98]"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019 9.617 9.617 0 0 0 .724-1.18.05.05 0 0 0-.028-.07 8.743 8.743 0 0 1-1.248-.595.05.05 0 0 1-.005-.083c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.05.05 0 0 1-.004.083 8.175 8.175 0 0 1-1.249.594.05.05 0 0 0-.03.07c.24.454.5.88.757 1.18a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Z"/>
          </svg>
          Continue with Discord
        </button>

        {/* Footer note */}
        <p className="mt-5 text-center text-[10px] text-slate-600">
          Only servers where you have admin permissions will be available.
        </p>
      </div>
    </main>
  );
}