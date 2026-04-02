"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Brain, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { cn } from "@/lib/utils";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push(redirect);
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}` },
    });
    if (error) {
      toast.error(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#002e2c] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #f9bc60 0%, transparent 60%)" }} />

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-[#f9bc60] rounded-xl flex items-center justify-center">
            <Brain className="h-6 w-6 text-[#002e2c]" />
          </div>
          <span className="text-xl font-bold text-white">Blazion Forms</span>
        </Link>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[rgba(249,188,96,0.15)] border border-[rgba(249,188,96,0.3)] text-[#f9bc60] px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8">
            <Sparkles className="h-3 w-3" /> AI-Powered
          </div>
          <h1 className="font-heading font-black text-4xl text-white leading-tight mb-6">
            Build forms that<br />
            <span className="text-[#f9bc60]">work for India.</span>
          </h1>
          <div className="space-y-4">
            {[
              "AI generates complete forms in seconds",
              "Native Aadhaar, PAN, UPI field support",
              "WhatsApp sharing & response notifications",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-[#98d1cc]">
                <div className="w-5 h-5 rounded-full bg-[rgba(152,209,204,0.2)] flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#98d1cc]" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#404847] text-xs relative z-10">Made in India 🇮🇳</p>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Link href="/" className="flex items-center gap-2 lg:hidden mb-8">
              <div className="w-8 h-8 bg-[#002e2c] rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-[#f9bc60]" />
              </div>
              <span className="font-bold text-[#002e2c]">Blazion Forms</span>
            </Link>
            <h2 className="font-heading font-black text-3xl text-[#1c1c17] mb-2">Welcome back</h2>
            <p className="text-[#404847]">Sign in to continue building.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1c1c17] mb-1.5">Email address</label>
              <input
                {...register("email")}
                type="email"
                id="login-email"
                placeholder="you@example.com"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border bg-white text-[#1c1c17] placeholder:text-[#bfc8c7] transition-all outline-none",
                  "focus:ring-2 focus:ring-[#002e2c] focus:border-[#002e2c]",
                  errors.email ? "border-red-400" : "border-[rgba(191,200,199,0.5)]"
                )}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-[#1c1c17]">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#002e2c] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full px-4 py-3 pr-11 rounded-xl border bg-white text-[#1c1c17] placeholder:text-[#bfc8c7] transition-all outline-none",
                    "focus:ring-2 focus:ring-[#002e2c] focus:border-[#002e2c]",
                    errors.password ? "border-red-400" : "border-[rgba(191,200,199,0.5)]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#404847] hover:text-[#002e2c] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input {...register("remember")} type="checkbox" id="remember" className="rounded border-gray-300 text-[#002e2c]" />
              <label htmlFor="remember" className="text-sm text-[#404847]">Remember me</label>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#002e2c] text-white font-bold text-sm transition-all hover:bg-[#004643] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[rgba(191,200,199,0.4)]" />
            <span className="text-xs text-[#404847]">or continue with</span>
            <div className="flex-1 h-px bg-[rgba(191,200,199,0.4)]" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3.5 rounded-xl border border-[rgba(191,200,199,0.5)] bg-white text-[#1c1c17] font-medium text-sm hover:bg-[#f6f3eb] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          <p className="text-center mt-8 text-sm text-[#404847]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#002e2c] font-bold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
