import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const appName = "Taskier";
const Navbar = () => {
  return (
    <div className="fixed top-0 w-full h-14 px-4 shadow-xs flex items-center border-b bg-white">
      <div className="md:max-w-(--breakpoint-xl) mx-auto flex items-center w-full justify-between">
        <Logo />
        <div className="space-x-4 md:block md:w-auto flex items-center justify-between w-full">
          <Button variant="outline" size="sm" asChild>
            <Link href="/sign-in">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Get {appName} for free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
