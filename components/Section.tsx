export function Section({
  title,
  children,
  description
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-funktion-line bg-white p-5 shadow-calm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-funktion-blue">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-black/70">{description}</p> : null}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}
