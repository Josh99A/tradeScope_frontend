"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type FormFieldProps = {
  label: string;
  type: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allowToggle?: boolean;
  required?: boolean;
};

const FormField = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  allowToggle = false,
  required = false,
}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password" && allowToggle;
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <label className="block text-sm mb-1">{label}{required && <span className="text-ts-danger"> *</span>}</label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="
            w-full rounded-lg px-4 py-3 text-sm
            bg-ts-bg-main border border-ts-border
            focus:outline-none focus:ring-2 focus:ring-ts-primary
            transition
          "
          style={isPassword ? { paddingRight: "3rem" } : undefined}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ts-text-muted hover:text-ts-text-main"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
export default FormField;
