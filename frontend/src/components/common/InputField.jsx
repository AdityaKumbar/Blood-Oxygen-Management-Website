import { useId } from "react";

const InputField = ({ label, type = "text", value, onChange, placeholder, name }) => {
  const id = useId();

  return (
    <div className="space-y-2.5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
        required
      />
    </div>
  );
};

export default InputField;
