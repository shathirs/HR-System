"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({ name, email, password });
      router.push("/dashboard");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card title="Register" className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            type="text"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
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
          {error && <p className="text-body text-danger">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-body text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-medium underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
