"use client";

import { applyMask } from "@/lib/validators";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mask?: string;
  error?: string;
  type?: string;
  readOnly?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

/** Underline input. Masked fields always show their label and an underscore template, like the reference UI. */
export function TextField({ label, value, onChange, mask, error, type = "text", readOnly, inputMode }: TextFieldProps) {
  const showLabel = !!mask || value.length > 0;
  return (
    <div>
      <span className={`u-label ${showLabel ? "" : "invisible"}`}>{label}</span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        inputMode={mask ? "numeric" : inputMode}
        aria-label={label}
        placeholder={mask ? mask.replace(/#/g, "_") : label}
        onChange={(e) => onChange(mask ? applyMask(e.target.value, mask) : e.target.value)}
        className="u-field"
      />
      {error && <p className="mt-1 text-[13px] text-danger">{error}</p>}
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  disabled?: boolean;
};

export function SelectField({ label, placeholder, value, onChange, options, error, disabled }: SelectFieldProps) {
  return (
    <div>
      <span className="u-label">{label}</span>
      <select value={value} disabled={disabled} aria-label={label} onChange={(e) => onChange(e.target.value)} className="u-field">
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-[13px] text-danger">{error}</p>}
    </div>
  );
}
