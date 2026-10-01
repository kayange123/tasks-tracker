import Sidebar from "../_components/Sidebar";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="pt-20 md:pt-22 px-4 max-w-7xl 2xl:max-w-(--breakpoint-xl) mx-auto">
      <div className="flex gap-x-6">
        <div className="w-64 shrink-0 hidden md:block">
          <Sidebar />
        </div>
        {children}
      </div>
    </div>
  );
};

export default OrganizationLayout;
