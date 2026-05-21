interface Props {
  label: string
  placeholder?: string
  name?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  required?: boolean
  rows?: number
  className?: string
}

function FormTextarea({ label, placeholder, name, value, onChange, required, rows = 3, className }: Props) {

  return (
    <div className="flex flex-col gap-1">

      <label className="text-sm text-gray-600">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`border rounded-lg px-3 py-2 min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500 ${className || ""}`}
      />

    </div>
  )

}

export default FormTextarea