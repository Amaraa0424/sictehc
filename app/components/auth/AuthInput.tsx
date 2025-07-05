import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"

interface AuthInputProps {
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export default function AuthInput({ 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  required 
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase()} className="text-zinc-300">
        {label}
      </Label>
      <Input
        id={label.toLowerCase()}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600"
      />
    </div>
  )
} 