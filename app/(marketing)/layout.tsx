import React from "react";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default MarketingLayout;
