import { useNavigate } from "react-router-dom";
// import LOGO from "../../assets/images/logo-removebg-preview.png";
import LOGO from "../../../src/assets/images/logo-removebg-preview1.png";
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
              <button className="btn" id="signin" onClick={handleClick}>
                הרשמת משתמש חדש
              </button>
              <button className="btn" onClick={logout}>
                התנתקות
              </button>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
