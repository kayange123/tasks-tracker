import Link from "next/link";
import React from "react";

import { Poppins } from "next/font/google";
import localFont from "next/font/local";

import { Button } from "@/components/ui/button";
import { Medal } from "lucide-react";
import { cn } from "@/lib/utils";

const appName = "Taskier";
const headingFont = localFont({
  src: "../../public/fonts/font.woff2",
});
const bodyFont = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const MarketingPage = () => {
  return (
    <div className="flex items-center justify-center flex-col">
      <div
        className={cn(
          "flex items-center justify-center flex-col",
          headingFont.className
        )}
      >
        <div className="mb-4 flex items-center justify-center border shadow-xs p-4 bg-amber-100 text-amber-700 rounded-xl">
          <Medal className="h-6 w-6 mr-2" />
          <p className="text-lg font-semibold">#1 Task Management!</p>
        </div>
        <h1 className="text-xl md:text-4xl font-bold text-center">{`Organize your team's tasks with us`}</h1>
        <h1 className="mt-4 text-xl md:text-3xl bg-linear-to-r from-fuchsia-600 to-pink-700 text-white px-4 p-2 rounded-md w-fit">
          Move Forward
        </h1>
      </div>
      <h1
        className={cn(
          "text-sm md:text-xl text-neutral-400 mt-4 max-w-xs md:max-w-xl text-center mx-auto",
          bodyFont.className
        )}
      >
        Collaborate, manage projects and reach new productivity peaks. From
        startups to home office, the way your team works is unique - accomplish
        it all with {appName}
      </h1>
      <Button className="mt-6" size="lg" asChild>
        <Link href={"/sign-up"}>{`Get ${appName} for free`}</Link>
      </Button>
    </div>
  );
};

export default MarketingPage;
