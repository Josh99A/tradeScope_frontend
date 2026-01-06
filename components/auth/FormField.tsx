type FormFieldProps = {
  label: string;
  type: string;
  placeholder?: string;
};

const FormField = ({
  label,
  type,
  placeholder,
}: FormFieldProps) => {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="
          w-full rounded-lg px-4 py-3 text-sm
          bg-ts-bg-main border border-ts-border
          focus:outline-none focus:ring-2 focus:ring-ts-primary
          transition
        "
      />
    </div>
  );
}
export default FormField;