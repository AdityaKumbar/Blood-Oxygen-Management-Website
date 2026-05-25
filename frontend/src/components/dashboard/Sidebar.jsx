import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { sidebarItems } from "../../data/dashboardData";
import { ROLES } from "../../utils/roles";

const Sidebar = ({ mobile = false, onNavigate }) => {
  const Container = mobile ? "div" : "aside";
  const user = useSelector((state) => state.auth.user);
  const isHospital = user?.role === ROLES.HOSPITAL;

  const hospitalItems = [
    { id: "hospital-dashboard", label: "Hospital Dashboard", path: "/hospital/dashboard" },
    { id: "hospital-profile", label: "Hospital Profile", path: "/hospital/profile" },
  ];

  const navItems = isHospital ? hospitalItems : sidebarItems;

  return (
    <Container className={mobile ? "h-full bg-white p-6" : "hidden w-72 shrink-0 border-r border-slate-200 bg-white xl:block"}>
      <div className={mobile ? "h-full" : "sticky top-0 h-screen p-6"}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">{isHospital ? "Hospital Portal" : "Emergency Admin"}</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">{isHospital ? "Care Access" : "Health Command"}</h2>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path || "/admin/dashboard"}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? "bg-rose-50 text-rose-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </Container>
  );
};

export default Sidebar;
