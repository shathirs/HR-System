"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { LOGOUT_MESSAGE_KEY, login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(LOGOUT_MESSAGE_KEY) === "true") {
      sessionStorage.removeItem(LOGOUT_MESSAGE_KEY);
      setSuccess("Logged out successfully");
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card title="Login" className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {success && (
            <p className="rounded-md bg-success/10 px-3 py-2 text-body text-success">
              {success}
            </p>
          )}
          {error && <p className="text-body text-danger">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-body text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}
