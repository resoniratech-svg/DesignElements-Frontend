interface Props {
  label: string
  placeholder?: string
  type?: string
  name?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  className?: string
  disabled?: boolean
  min?: string
}

function FormInput({ label, placeholder, type = "text", name, value, onChange, required, className, disabled, min }: Props) {

  return (
    <div className="flex flex-col gap-1">

      <label className="text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        className={`border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 transition-shadow ${className || ""}`}
      />

    </div>
  )

}

export default FormInput