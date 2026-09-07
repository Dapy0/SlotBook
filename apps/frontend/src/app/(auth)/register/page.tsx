'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUpSchema, type RegisterFormValues } from '@/lib/validations/auth';
import { register as userRegister } from '@/services/auth/auth';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(signUpSchema),
  });
  const { user, refetch } = useAuth();
  useEffect(() => {
    if (user) router.push('/');
  }, [user]);
  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await userRegister(values);
      // await refetch();
      setTimeout(() => {}, 1000);
      router.push('/');
    } catch (err) {
      setServerError('' + err);
    }
  };
  return (
    <Card className="w-full max-w-90">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Register so u can add your facility and access over 250.000+ people!
        </CardDescription>
        <CardAction>
          <Button variant="link">
            <Link href={'/login'}>Sign In</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form id="register-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            {isSubmitSuccessful && (
              <div className="rounded-md border border/30 bg-green-400/10 px-3 py-2 text-sm text-green-600">
                Successfully Registered
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </form>
        {serverError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          form="register-form"
          aria-label="Submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        <Button variant="outline" disabled={true} className="w-full">
          Register with Google
        </Button>
      </CardFooter>
    </Card>
  );
}
