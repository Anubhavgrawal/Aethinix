import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav>
      <Link to="/">AETHENIX</Link>

      <div>
        <Link to="/tournaments">Tournaments</Link>
        <Link to="/rankings">Rankings</Link>
        <Link to="/players">Players</Link>
        <Link to="/results">Results</Link>

        {isAuthenticated ? (
          <>
            <Link to="/dashboard">
              {user?.name || "Dashboard"}
            </Link>

            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;