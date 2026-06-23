"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { getStoredUser, logout } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const user = getStoredUser();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-secondary/20 bg-white px-6">
      <div>
        <h1 className="text-subheading font-semibold">Employee Management</h1>
        {user && (
          <p className="text-caption text-secondary">
            {user.name} · {user.role}
          </p>
        )}
      </div>
      <Button variant="danger" onClick={handleLogout}>
        Logout
      </Button>
    </header>
  );
}
