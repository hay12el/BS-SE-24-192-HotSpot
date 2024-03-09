import { useNavigate } from "react-router-dom";
import LOGO from "../../assets/images/logo-removebg-preview.png";
import { useAuth } from "../../context/AuthContext";

import "./navbar.css";
import { CheckAuth } from "../../hooks/hooks";

const NavBar = () => {
  const navigate = useNavigate();
  const isLogIn = CheckAuth();
  const { logout } = useAuth();

  const handleClick = (e) => {
    navigate(`/${e.target.id}`);
  };

  return (
    <div className="container">
      <div className="navContainer">
        <img
          className="logo"
          src={LOGO}
          alt="logo"
          onClick={() => navigate("/")}
        />
        <div className="buttons">
          {isLogIn ? (
            <>
              <button className="btn" onClick={logout}>
                התנתקות
              </button>
            </>
          ) : (
            <>
              <button className="btn" id="signin" onClick={handleClick}>
                הרשמה
              </button>
              <button className="btn" id="login" onClick={handleClick}>
                התחברות
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
