interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

export default function SelectField({
  label,
  value,
  options,
  disabled = false,
  onChange,
}: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-2 pl-3 pr-8 text-xs font-medium text-slate-300 outline-none backdrop-blur-sm transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:text-slate-600"
        >
          <option value="" disabled className="bg-slate-900 text-slate-400">
            Select a channel…
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-900 text-white">
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
          <svg
            className={`h-3 w-3 transition-colors ${disabled ? "text-slate-600" : "text-slate-500"}`}
            viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
          >
            <path d="M2 3.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </label>
  );
}