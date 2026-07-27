export function ActionBtn({
  onClick,
  title,
  icon,
  disabled,
}: {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="text-[var(--app-muted)] hover:text-[var(--app-text)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {icon}
    </button>
  );
}
