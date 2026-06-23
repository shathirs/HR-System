"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/departments", label: "Departments" },
  { href: "/positions", label: "Positions" },
  { href: "/employees", label: "Employees" },
  { href: "/payroll", label: "Payroll" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-secondary/20 bg-white">
      <div className="border-b border-secondary/20 px-6 py-5">
        <p className="text-subheading font-semibold text-primary">HR System</p>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-body font-medium transition ${
                isActive
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-surface"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
