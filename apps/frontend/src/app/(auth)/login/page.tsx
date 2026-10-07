"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { login } from "@/services/auth";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useAuth } from "@/lib/authContext";
import { ApiError } from "@/lib/api";
import { loginRequestSchema, type LoginRequest } from "@slotbook/shared";
import { getSafeNext, withNext } from "@/app/(auth)/_lib/redirect";

function loginErrorMessage(err: unknown) {
  if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
    return "That email and password don't match. Check them and try again.";
  }
  return "We couldn't log you in right now. Check your connection and try again.";
}

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [next, setNext] = useState("/");
  const [justRegistered, setJustRegistered] = useState(false);
  const router = useRouter();
  const { user, refetch } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
  });

  useEffect(() => {
    setNext(getSafeNext());
    setJustRegistered(new URLSearchParams(window.location.search).has("registered"));
  }, []);

  useEffect(() => {
    if (user) router.push(getSafeNext() as Route);
  }, [user]);

  const onSubmit = async (values: LoginRequest) => {
    setServerError(null);
    try {
      await login(values);
      await refetch();
      router.push(getSafeNext() as Route);
    } catch (err) {
      setServerError(loginErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Log in</h1>
        <p className="text-muted-foreground">
          {next.includes("/book")
            ? "Log in to confirm your booking. Your chosen time is kept."
            : "Log in to book and manage your appointments."}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
        {justRegistered && (
          <p
            role="status"
            className="mb-5 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
          >
            Account created. Log in to continue.
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="h-11"
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className="h-11"
              {...register("password")}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {serverError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Spinner /> Logging in…
              </>
            ) : (
              <>
                Log in <ArrowRight aria-hidden />
              </>
            )}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to SlotBook?{" "}
        <Link
          href={withNext("/register", next) as "/register"}
          className="font-medium text-brand-ink underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
