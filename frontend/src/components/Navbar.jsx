import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="navbar">
      <div className="logo" onClick={() => (window.location.href = "/")}>
        BarberApp
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <div className="nav-user">
              <FaUserCircle />
              <span>{user.name}</span>
              <small>{user.role}</small>
            </div>

            <button className="nav-logout" onClick={logout}>
              <FaSignOutAlt />
            </button>
          </>
        ) : (
          <button onClick={() => (window.location.href = "/login")}>
            Login
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;