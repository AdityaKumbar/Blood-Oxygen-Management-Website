import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clearAuthError, loginThunk, logout } from "../redux/authSlice";
import InputField from "../components/common/InputField";
import Button from "../components/common/Button";
import { ROLES } from "../utils/roles";

const HospitalLoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?.role === ROLES.HOSPITAL) {
      navigate("/hospital/dashboard", { replace: true });
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
      const loggedInUserRole = result.payload?.user?.role;
      if (loggedInUserRole !== ROLES.HOSPITAL) {
        dispatch(logout());
        toast.error("This login is only for hospital users");
        return;
      }
      toast.success("Hospital login successful");
      navigate("/hospital/dashboard", { replace: true });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10">
      <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-rose-200/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-red-300/50 blur-3xl" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Hospital Portal</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Hospital Sign In</h1>
        <p className="mt-2 text-sm text-slate-600">Access blood and oxygen availability and create emergency requests.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="hospital@care.com"
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Enter your password"
          />
          <Button type="submit" loading={loading}>
            Log In
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          New hospital?{" "}
          <Link to="/hospital/signup" className="font-semibold text-rose-600 hover:text-rose-700">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default HospitalLoginPage;
