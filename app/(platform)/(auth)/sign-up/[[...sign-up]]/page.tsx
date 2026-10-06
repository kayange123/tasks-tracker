import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <SignUp />
      <p className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
        By signing up, you agree to our{" "}
        <Link
          href="/terms"
          className="font-medium text-primary-text hover:underline"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="font-medium text-primary-text hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}
