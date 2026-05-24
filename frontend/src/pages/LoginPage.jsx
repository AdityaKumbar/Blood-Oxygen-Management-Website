import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clearAuthError, loginThunk } from "../redux/authSlice";
import InputField from "../components/common/InputField";
import Button from "../components/common/Button";
import { ROLES } from "../utils/roles";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === ROLES.HOSPITAL) {
        navigate("/hospital/dashboard", { replace: true });
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(loginThunk(form));

    if (loginThunk.fulfilled.match(result)) {
      toast.success("Login successful");
      if (result.payload?.user?.role === ROLES.HOSPITAL) {
        navigate("/hospital/dashboard", { replace: true });
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eceff3] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] sm:p-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-rose-600">Emergency Admin</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">Sign In</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Secure access to healthcare emergency command center.</p>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-xl sm:flex">
            +
          </div>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="admin@hospital.com"
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Enter your password"
          />
          <div className="pt-2">
            <Button type="submit" loading={loading}>
              Log In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
