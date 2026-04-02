"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Brain, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupFormData } from "@/lib/validations";
import { cn } from "@/lib/utils";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[a-zA-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const label = score <= 1 ? "Weak" : score <= 2 ? "Fair" : score <= 3 ? "Good" : "Strong";
  const color = score <= 1 ? "bg-red-400" : score <= 2 ? "bg-yellow-400" : score <= 3 ? "bg-blue-400" : "bg-green-500";

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i <= score ? color : "bg-[#e5e2da]")} />
        ))}
      </div>
      <p className="text-xs text-[#404847]">Strength: <span className="font-medium">{label}</span></p>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch("password", "");

  const onSubmit = async (data: SignupFormData) => {
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    if (authData.session) {
      toast.success("Account created successfully!");
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.success("Account created! Please check your email to verify your account.");
      router.push("/login");
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #f9bc60 0%, transparent 60%)" }} />

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-[#f9bc60] rounded-xl flex items-center justify-center">
            <Brain className="h-6 w-6 text-[#002e2c]" />
          </div>
          <span className="text-xl font-bold text-white">Blazion Forms</span>
        </Link>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[rgba(249,188,96,0.15)] border border-[rgba(249,188,96,0.3)] text-[#f9bc60] px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8">
            <Sparkles className="h-3 w-3" /> Free Forever
          </div>
          <h1 className="font-heading font-black text-4xl text-white leading-tight mb-4">
            Join 10,000+ Indian<br />
            <span className="text-[#f9bc60]">form builders.</span>
          </h1>
          <p className="text-[#98d1cc] leading-relaxed text-sm max-w-xs">
            No credit card required. Start building professional forms with AI assistance in under 60 seconds.
          </p>
        </div>

        <p className="text-[#404847] text-xs relative z-10">Made in India 🇮🇳 · DPDP Act 2023 Compliant</p>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 lg:hidden mb-8">
              <div className="w-8 h-8 bg-[#002e2c] rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-[#f9bc60]" />
              </div>
              <span className="font-bold text-[#002e2c]">Blazion Forms</span>
            </Link>
            <h2 className="font-heading font-black text-3xl text-[#1c1c17] mb-2">Create your account</h2>
            <p className="text-[#404847]">Free forever. No credit card needed.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1c1c17] mb-1.5">Full Name</label>
              <input
                {...register("full_name")}
                type="text"
                id="signup-name"
                placeholder="Priya Sharma"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border bg-white text-[#1c1c17] placeholder:text-[#bfc8c7] transition-all outline-none",
                  "focus:ring-2 focus:ring-[#002e2c] focus:border-[#002e2c]",
                  errors.full_name ? "border-red-400" : "border-[rgba(191,200,199,0.5)]"
                )}
              />
              {errors.full_name && <p className="mt-1.5 text-xs text-red-500">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c1c17] mb-1.5">Email address</label>
              <input
                {...register("email")}
                type="email"
                id="signup-email"
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
              <label className="block text-sm font-medium text-[#1c1c17] mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  id="signup-password"
                  placeholder="Min. 8 characters"
                  className={cn(
                    "w-full px-4 py-3 pr-11 rounded-xl border bg-white text-[#1c1c17] placeholder:text-[#bfc8c7] transition-all outline-none",
                    "focus:ring-2 focus:ring-[#002e2c] focus:border-[#002e2c]",
                    errors.password ? "border-red-400" : "border-[rgba(191,200,199,0.5)]"
                  )}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#404847]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c1c17] mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  {...register("confirm_password")}
                  type={showConfirm ? "text" : "password"}
                  id="signup-confirm"
                  placeholder="Repeat password"
                  className={cn(
                    "w-full px-4 py-3 pr-11 rounded-xl border bg-white text-[#1c1c17] placeholder:text-[#bfc8c7] transition-all outline-none",
                    "focus:ring-2 focus:ring-[#002e2c] focus:border-[#002e2c]",
                    errors.confirm_password ? "border-red-400" : "border-[rgba(191,200,199,0.5)]"
                  )}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#404847]">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm_password && <p className="mt-1.5 text-xs text-red-500">{errors.confirm_password.message}</p>}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input {...register("terms")} type="checkbox" id="terms" className="mt-0.5 rounded border-gray-300 text-[#002e2c]" />
              <label htmlFor="terms" className="text-sm text-[#404847] leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-[#002e2c] font-medium hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#002e2c] font-medium hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

            <button
              type="submit"
              id="signup-submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#002e2c] text-white font-bold text-sm transition-all hover:bg-[#004643] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Creating account..." : "Create Account — Free"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[rgba(191,200,199,0.4)]" />
            <span className="text-xs text-[#404847]">or sign up with</span>
            <div className="flex-1 h-px bg-[rgba(191,200,199,0.4)]" />
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            className="w-full py-3.5 rounded-xl border border-[rgba(191,200,199,0.5)] bg-white text-[#1c1c17] font-medium text-sm hover:bg-[#f6f3eb] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          <p className="text-center mt-6 text-sm text-[#404847]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#002e2c] font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
