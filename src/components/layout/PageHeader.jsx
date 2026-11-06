export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <header className="mb-5 flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        {eyebrow && <span className="text-[13px] font-medium text-muted">{eyebrow}</span>}
        <h1 className="m-0 text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="m-0 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
