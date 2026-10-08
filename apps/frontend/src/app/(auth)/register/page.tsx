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
import { register as userRegister } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { ApiError } from "@/lib/api";
import { type RegisterRequest } from "@slotbook/shared";
import { registerValidationSchema, type RegisterValidation } from "@/app/(auth)/_lib/types";
import { getSafeNext } from "@/app/(auth)/_lib/redirect";

function registerErrorMessage(err: unknown) {
  if (err instanceof ApiError && err.status === 409) {
    return "An account with this email already exists. Log in instead.";
  }
  if (err instanceof ApiError && err.status === 400) {
    return "Some details look wrong. Check the fields and try again.";
  }
  return "We couldn't create your account right now. Check your connection and try again.";
}

const FIELDS = [
  {
    name: "name",
    label: "Name",
    type: "text",
    autoComplete: "name",
    placeholder: "Your name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "you@example.com",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "At least 8 characters",
  },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Repeat your password",
  },
] as const;

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [next, setNext] = useState("/");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValidation>({
    resolver: zodResolver(registerValidationSchema),
  });
  const { user } = useAuth();

  useEffect(() => {
    setNext(getSafeNext());
  }, []);

  useEffect(() => {
    if (user) router.push("/");
  }, [user]);

  const onSubmit = async (values: RegisterRequest) => {
    setServerError(null);
    try {
      await userRegister(values);
      // Registration does not start a session, so continue to login and keep the return path.
      const params = new URLSearchParams({ registered: "1" });
      if (next !== "/") params.set("next", next);
      router.push(`/login?${params}`);
    } catch (err) {
      setServerError(registerErrorMessage(err));
    }
  };

  const loginHref = next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground">
          Book free times at local venues and keep all your appointments in one place.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          {FIELDS.map((field) => {
            const error = errors[field.name];
            return (
              <div key={field.name} className="grid gap-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${field.name}-error` : undefined}
                  className="h-11"
                  {...register(field.name)}
                />
                {error && (
                  <p id={`${field.name}-error`} className="text-sm text-destructive">
                    {error.message}
                  </p>
                )}
              </div>
            );
          })}

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
                <Spinner /> Creating account…
              </>
            ) : (
              <>
                Create account <ArrowRight aria-hidden />
              </>
            )}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={loginHref as "/login"}
          className="font-medium text-brand-ink underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
