import { memo, type ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
  /** Shorter label in mobile key–value rows (defaults to string `header`, else `key`). */
  mobileLabel?: ReactNode;
  /** This column is the bold title in the mobile card header (only one should use this). */
  mobileCardTitle?: boolean;
  /** Checkbox / bulk controls: shown at the start of the mobile card header. */
  mobileHeaderStart?: boolean;
  /** Actions (icons, buttons): shown at the end of the mobile card header. */
  mobileHeaderEnd?: boolean;
  /** Omit from the mobile card entirely. */
  mobileHide?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  className?: string;
  /** When false, only the horizontal table is shown (all breakpoints). */
  mobileCards?: boolean;
}

function cellContent<T>(row: T, col: Column<T>): ReactNode {
  return col.render
    ? col.render(row)
    : ((row as Record<string, unknown>)[col.key] as ReactNode);
}

function isHeaderEndColumn<T>(col: Column<T>): boolean {
  return Boolean(
    col.mobileHeaderEnd ||
      col.key === "actions" ||
      col.key === "pdf",
  );
}

function isHeaderStartColumn<T>(col: Column<T>): boolean {
  return Boolean(col.mobileHeaderStart);
}

function columnLabel<T>(col: Column<T>): ReactNode {
  if (col.mobileLabel !== undefined) return col.mobileLabel;
  if (typeof col.header === "string" && col.header.trim()) return col.header;
  return col.key;
}

function pickTitleColumn<T>(columns: Column<T>[]): Column<T> {
  const titled = columns.find((c) => c.mobileCardTitle && !c.mobileHide);
  if (titled) return titled;
  const fallback = columns.find(
    (c) =>
      !c.mobileHide &&
      !isHeaderStartColumn(c) &&
      !isHeaderEndColumn(c),
  );
  return fallback ?? columns[0];
}

function TableComponent<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data",
  className = "",
  mobileCards = true,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        className={
          "rounded-[var(--radius-2xl)] border border-border bg-surface py-10 text-center text-xs text-text-muted shadow-[var(--shadow-card)] md:py-14 md:text-sm " +
          className
        }
      >
        {emptyMessage}
      </div>
    );
  }

  const titleColumn = pickTitleColumn(columns);
  const headerStartColumns = columns.filter(
    (c) => !c.mobileHide && isHeaderStartColumn(c),
  );
  const headerEndColumns = columns.filter(
    (c) => !c.mobileHide && isHeaderEndColumn(c),
  );
  const bodyColumns = columns.filter((c) => {
    if (c.mobileHide) return false;
    if (isHeaderStartColumn(c)) return false;
    if (isHeaderEndColumn(c)) return false;
    if (c.key === titleColumn.key) return false;
    return true;
  });

  const desktopTable = (
    <div
      className={
        mobileCards
          ? "hidden md:block overflow-x-auto overscroll-x-contain rounded-[var(--radius-2xl)] border border-border bg-surface shadow-[var(--shadow-card)] [-webkit-overflow-scrolling:touch]"
          : "overflow-x-auto overscroll-x-contain rounded-[var(--radius-2xl)] border border-border bg-surface shadow-[var(--shadow-card)] [-webkit-overflow-scrolling:touch]"
      }
    >
      <table className="w-full min-w-[600px] text-left text-xs md:text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-alt">
            {columns.map((col) => (
              <th
                key={col.key}
                className={
                  "whitespace-nowrap px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted first:pl-3 last:pr-3 sm:px-4 sm:py-3 sm:text-xs md:px-4 " +
                  (col.className ?? "")
                }
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="transition-colors hover:bg-surface-alt/60"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={
                    "px-2 py-2 align-middle text-text first:pl-3 last:pr-3 sm:px-4 sm:py-3 " +
                    (col.className ?? "")
                  }
                >
                  {cellContent(row, col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!mobileCards) {
    return <div className={className}>{desktopTable}</div>;
  }

  return (
    <div className={className}>
      <div className="md:hidden space-y-3 pb-1">
        {data.map((row) => (
          <article
            key={keyExtractor(row)}
            className="overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface shadow-[var(--shadow-card-lg)] [touch-action:manipulation]"
          >
            <div className="flex items-center gap-1.5 border-b border-border bg-surface px-2.5 py-2 sm:gap-2 sm:px-3 sm:py-2.5">
              {headerStartColumns.length > 0 ? (
                <div className="flex shrink-0 items-center gap-1">
                  {headerStartColumns.map((col) => (
                    <div key={col.key} className="flex items-center">
                      {cellContent(row, col)}
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="min-w-0 flex-1 text-sm font-semibold leading-snug text-text-heading sm:text-base">
                {cellContent(row, titleColumn)}
              </div>
              {headerEndColumns.length > 0 ? (
                <div className="flex shrink-0 items-center gap-0.5">
                  {headerEndColumns.map((col) => (
                    <div
                      key={col.key}
                      className="flex items-center [&_button]:min-h-[40px] [&_button]:min-w-[40px] [&_button]:items-center [&_button]:justify-center"
                    >
                      {cellContent(row, col)}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <dl className="divide-y divide-border">
              {bodyColumns.map((col) => (
                <div
                  key={col.key}
                  className="flex gap-2 px-2.5 py-2 text-xs leading-snug sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm"
                >
                  <dt className="w-[40%] shrink-0 text-[10px] font-medium uppercase tracking-wide text-text-muted sm:w-[38%] sm:text-xs">
                    {columnLabel(col)}
                  </dt>
                  <dd className="min-w-0 flex-1 text-right text-xs font-medium text-text-heading [word-break:break-word] sm:text-sm">
                    {cellContent(row, col)}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      {desktopTable}
    </div>
  );
}

export const Table = memo(TableComponent) as typeof TableComponent;
