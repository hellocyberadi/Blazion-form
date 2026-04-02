export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fcf9f1] flex items-center justify-center">
      {children}
    </div>
  );
}
