export function Field({
  label,
  error,
  children,
  readOnly,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  readOnly?: boolean;
}) {
  //   let child = children;
  //   if (readOnly && isValidElement(children)) {
  //     // Radix Select has no readOnly concept — it must be disabled to block opening
  //     const isSelect = children.type === Select;

  //     child = cloneElement(children as React.ReactElement<any>, {
  //       ...(isSelect ? { disabled: true } : { readOnly: true }),
  //     });
  //   }
  return (
    <div
      className="flex flex-col gap-1.5"
      data-readonly={readOnly || undefined}
      aria-readonly={readOnly}
    >
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
