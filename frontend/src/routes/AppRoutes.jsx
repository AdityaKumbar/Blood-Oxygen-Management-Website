import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HospitalLoginPage from "../pages/HospitalLoginPage";
import HospitalSignupPage from "../pages/HospitalSignupPage";
import DashboardPage from "../pages/DashboardPage";
import UsersPage from "../pages/UsersPage";
import HospitalsPage from "../pages/HospitalsPage";
import HospitalDashboardPage from "../pages/HospitalDashboardPage";
import HospitalProfilePage from "../pages/HospitalProfilePage";
import InventoryPage from "../pages/InventoryPage";
import OxygenInventoryPage from "../pages/OxygenInventoryPage";
import EmergencyRequestsPage from "../pages/EmergencyRequestsPage";
import AdminApprovalsPage from "../pages/AdminApprovalsPage";
import NotFoundPage from "../pages/NotFoundPage";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "../utils/roles";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/admin" element={<LoginPage />} />
      <Route path="/hospital/login" element={<HospitalLoginPage />} />
      <Route path="/hospital/signup" element={<HospitalSignupPage />} />
      <Route
        path="/hospital/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.HOSPITAL]} loginPath="/hospital/login">
            <DashboardLayout>
              <HospitalDashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital/profile"
        element={
          <ProtectedRoute allowedRoles={[ROLES.HOSPITAL]} loginPath="/hospital/login">
            <DashboardLayout>
              <HospitalProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.BLOOD_BANK, ROLES.OXYGEN_SUPPLIER]}><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><UsersPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/hospitals" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><HospitalsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.BLOOD_BANK]}><DashboardLayout><InventoryPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/oxygen" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OXYGEN_SUPPLIER]}><DashboardLayout><OxygenInventoryPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.BLOOD_BANK]}><DashboardLayout><EmergencyRequestsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/approvals" element={<ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}><DashboardLayout><AdminApprovalsPage /></DashboardLayout></ProtectedRoute>} />

      <Route path="/login" element={<Navigate to="/admin" replace />} />
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
