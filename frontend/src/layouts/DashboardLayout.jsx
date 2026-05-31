import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import DashboardAssistantWidget from "../components/dashboard/DashboardAssistantWidget";
import { closeSidebar } from "../redux/uiSlice";

const DashboardLayout = ({ children }) => {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <div className="flex min-h-screen">
        <Sidebar />

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-slate-900/40 xl:hidden" onClick={() => dispatch(closeSidebar())} />
        )}

        <aside
          className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-slate-200 bg-white transition-transform xl:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar mobile onNavigate={() => dispatch(closeSidebar())} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-[28px] border border-white/70 bg-white/35 p-3 sm:p-4">{children}</div>
          </main>
        </div>

        <DashboardAssistantWidget />
      </div>
    </div>
  );
};

export default DashboardLayout;
