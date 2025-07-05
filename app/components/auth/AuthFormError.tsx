interface AuthFormErrorProps {
  message: string
}

export default function AuthFormError({ message }: AuthFormErrorProps) {
  return (
    <div className="rounded-md bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 text-sm">
      {message}
    </div>
  )
} 