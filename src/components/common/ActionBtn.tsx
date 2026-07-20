export function ActionBtn({ onClick, title, icon }: { onClick: () => void; title: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="text-[var(--app-muted)] hover:text-[var(--app-text)] transition-colors cursor-pointer"
    >
      {icon}
    </button>
  );
}
