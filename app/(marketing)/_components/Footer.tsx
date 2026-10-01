import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const appName = "Taskier";

const Footer = () => {
  return (
    <div className="fixed bottom-0 w-full py-4 bg-slate-100">
      <div className="md:max-w-(--breakpoint-xl) mx-auto flex flex-wrap items-center w-full justify-between">
        <Logo />
        <div className="md:block md:w-auto flex items-center justify-between w-full">
          <Button size="sm" variant="link" className="text-xs sm:text-sm">
            Privacy policy
          </Button>
          <Button size="sm" variant="link" className="text-xs sm:text-sm">
            Terms of services
          </Button>
          <Button size="sm" variant="link" className="text-xs sm:text-sm">
            <Link href="https://bit.ly/kayange" target="_blank">
              Meet the developer
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
