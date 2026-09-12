"use client";

import { useActionState, useState } from "react";

import { login, signup, type AuthFormState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState<AuthFormState, FormData>(
    login,
    undefined
  );
  const [signupState, signupAction, signupPending] = useActionState<AuthFormState, FormData>(
    signup,
    undefined
  );

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary font-heading text-lg font-semibold text-primary-foreground">
            FA
          </div>
          <h1 className="text-lg font-semibold">Furqan&apos;s Desk</h1>
          <p className="text-sm text-muted-foreground">Nothing falls through the cracks.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your desk, or create your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form action={loginAction} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  {loginState && "error" in loginState && (
                    <p className="text-sm text-destructive">{loginState.error}</p>
                  )}
                  <Button type="submit" disabled={loginPending} className="mt-1">
                    {loginPending ? "Signing in..." : "Log in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form action={signupAction} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="signup-name">Your name</Label>
                    <Input id="signup-name" name="fullName" required placeholder="e.g. Furqan" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                  {signupState && "error" in signupState && (
                    <p className="text-sm text-destructive">{signupState.error}</p>
                  )}
                  {signupState && "message" in signupState && (
                    <p className="text-sm text-success">{signupState.message}</p>
                  )}
                  <Button type="submit" disabled={signupPending} className="mt-1">
                    {signupPending ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
