import Logo from "@/components/Logo";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-4 py-12">
      <Logo />
      {children}
    </div>
  );
};

export default AuthLayout;
