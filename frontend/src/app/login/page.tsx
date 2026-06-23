"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Toast from "@/components/ui/Toast";
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
    <>
      {success && (
        <Toast
          message={success}
          variant="success"
          duration={2000}
          onClose={() => setSuccess("")}
        />
      )}

      <AuthLayout
        title="Welcome back"
        subtitle="Sign in to manage employees, payroll, and more"
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Create account
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email address"
            type="email"
            name="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="bg-surface/50 py-2.5"
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="bg-surface/50 py-2.5"
            required
          />

          {error && (
            <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-body text-danger">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full py-2.5">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </AuthLayout>
    </>
  );
}
