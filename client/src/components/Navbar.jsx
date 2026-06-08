import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../slices/authSlice";
import { isAdminRole } from "../utils/roles";

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = isAdminRole(userInfo?.role);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={userInfo ? "/dashboard" : "/login"} className="brand">
          <span className="brand-mark">✓</span>
          TaskFlow
        </Link>

        <div className="nav-links">
          {userInfo ? (
            <>
              <NavLink to="/dashboard" className="nav-link">
                Dashboard
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="nav-link">
                  Admin
                </NavLink>
              )}
              <span className="nav-user">
                {userInfo.name}
                <span className="pill pill-role">{userInfo.role}</span>
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Login
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
