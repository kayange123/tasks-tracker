import Sidebar from "../_components/Sidebar";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-full pt-14">
      <aside className="fixed top-14 bottom-0 left-0 hidden w-[260px] overflow-y-auto border-r bg-card md:block">
        <Sidebar />
      </aside>
      <main className="md:pl-[260px]">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-10 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default OrganizationLayout;
