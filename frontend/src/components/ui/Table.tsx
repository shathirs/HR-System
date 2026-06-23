import type { ReactNode } from "react";

interface TableProps {
  columns: string[];
  children: ReactNode;
}

export default function Table({ columns, children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-secondary/20">
      <table className="min-w-full divide-y divide-secondary/20 text-body">
        <thead className="bg-surface">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-3 text-left text-body font-medium text-secondary"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary/20 bg-white">
          {children}
        </tbody>
      </table>
    </div>
  );
}
