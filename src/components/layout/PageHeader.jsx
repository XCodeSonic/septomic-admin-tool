export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 pb-5 pt-6 sm:px-6 sm:pt-8 md:px-8">
      <div>
        <h1 className="font-heading text-[22px] font-semibold tracking-tight text-foreground sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>}
    </div>
  )
}
