interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  options: (string | Option)[];
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}

function FormSelect({ label, options, name, value, onChange, required }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="border border-gray-200 rounded-xl px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm font-medium text-gray-700 shadow-sm"
      >
        <option value="">Select an option</option>
        {options.map((option, index) => {
          const isObject = typeof option !== 'string';
          const val = isObject ? (option as Option).value : (option as string);
          const lbl = isObject ? (option as Option).label : (option as string);
          return (
            <option key={index} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default FormSelect