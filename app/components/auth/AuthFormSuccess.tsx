interface AuthFormSuccessProps {
  message: string
}

export default function AuthFormSuccess({ message }: AuthFormSuccessProps) {
  return (
    <div className="rounded-md bg-green-900/20 border border-green-800 text-green-200 px-4 py-3 text-sm">
      {message}
    </div>
  )
} 