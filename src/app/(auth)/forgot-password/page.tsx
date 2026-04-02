"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Brain, ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setSentEmail(data.email);
    setSent(true);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 bg-[#fcf9f1]">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 bg-[#002e2c] rounded-xl flex items-center justify-center">
            <Brain className="h-5 w-5 text-[#f9bc60]" />
          </div>
          <span className="font-heading font-bold text-[#002e2c]">Blazion Forms</span>
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[rgba(191,200,199,0.3)]">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="font-heading font-black text-2xl text-[#1c1c17] mb-3">Check your email</h2>
              <p className="text-[#404847] mb-2">We sent a password reset link to</p>
              <p className="font-semibold text-[#002e2c] mb-6">{sentEmail}</p>
              <p className="text-sm text-[#404847] mb-8">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button onClick={() => setSent(false)} className="text-[#002e2c] font-medium hover:underline">
                  try again
                </button>.
              </p>
              <Link href="/login" className="text-sm text-[#002e2c] font-medium hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 bg-[#002e2c]/10 rounded-xl flex items-center justify-center mb-5">
                  <Mail className="h-6 w-6 text-[#002e2c]" />
                </div>
                <h2 className="font-heading font-black text-2xl text-[#1c1c17] mb-2">Forgot password?</h2>
                <p className="text-[#404847] text-sm">Enter your email address and we&apos;ll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1c1c17] mb-1.5">Email address</label>
                  <input
                    {...register("email")}
                    type="email"
                    id="forgot-email"
                    placeholder="you@example.com"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-white text-[#1c1c17] placeholder:text-[#bfc8c7] transition-all outline-none",
                      "focus:ring-2 focus:ring-[#002e2c] focus:border-[#002e2c]",
                      errors.email ? "border-red-400" : "border-[rgba(191,200,199,0.5)]"
                    )}
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#002e2c] text-white font-bold text-sm hover:bg-[#004643] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <Link href="/login" className="text-sm text-[#404847] hover:text-[#002e2c] flex items-center justify-center gap-1 mt-6 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
