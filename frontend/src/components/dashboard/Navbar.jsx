import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logout } from "../../redux/authSlice";
import { toggleSidebar } from "../../redux/uiSlice";
import NotificationDropdown from "./NotificationDropdown";
import { ROLES } from "../../utils/roles";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isHospital = user?.role === ROLES.HOSPITAL;

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 xl:hidden"
            onClick={() => dispatch(toggleSidebar())}
          >
            Menu
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{isHospital ? "Hospital Dashboard" : "Admin Dashboard"}</h1>
            <p className="text-xs text-slate-500">
              {isHospital ? "View availability and create emergency requests" : "Realtime healthcare emergency operations"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.name || "Admin User"}</p>
            <p className="text-xs font-medium text-rose-600">{user?.role || "SUPER_ADMIN"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
