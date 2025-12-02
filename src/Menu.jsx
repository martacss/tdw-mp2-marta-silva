import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container d-flex justify-content-between align-items-center">
        <img
          src="/bloomly.svg"
          alt="Logo Bloomly"
        />

        <div className="d-flex gap-5">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
