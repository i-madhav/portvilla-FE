interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      className="flex items-start justify-between gap-3 rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300"
      role="alert"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-red-400 hover:text-red-200"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  )
}
