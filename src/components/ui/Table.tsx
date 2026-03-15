import { memo } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  className?: string;
}

function TableComponent<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data",
  className = "",
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        className={
          "rounded-[var(--radius-md)] border border-border bg-surface py-12 text-center text-text-muted " +
          className
        }
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={
        "overflow-x-auto rounded-[var(--radius-md)] border border-border bg-surface " +
        className
      }
    >
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-alt">
            {columns.map((col) => (
              <th
                key={col.key}
                className={
                  "px-4 py-3 font-medium text-text-heading " + (col.className ?? "")
                }
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={"px-4 py-3 text-text " + (col.className ?? "")}
                >
                  {col.render
                    ? col.render(row)
                    : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const Table = memo(TableComponent) as typeof TableComponent;
