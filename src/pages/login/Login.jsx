import React, { useEffect } from "react";
import { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LOGO from '../../assets/images/logo-removebg-preview1.png'

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // // chacks if the user is authenticated, if he is, navigates to homePage.
  useEffect(() => {
    if (localStorage.getItem("token") !== null) {
      navigate("/");
    }
  }, []);

  const [inputs, setInputs] = useState({
    email: undefined,
    password: undefined,
  });

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleClick = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await login(inputs.email, inputs.password);

      console.log(res);

      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="containerBig">
      <div className="vv">
        <img src={LOGO} alt="logo" />
        <div className="inpC">
          <div className="upponLog">
            <p>התחברות</p>
          </div>
          <div className="inputBox">
            <input
              type="email"
              // className="inp"
              id="email"
              onChange={handleChange}
              onKeyDown={handleClick}
            />
            <label>מייל</label>
          </div>
          <div className="inputBox">
            <input
              type="password"
              // className="inp"
              id="password"
              onChange={handleChange}
              onKeyDown={handleClick}
            />
            <label>סיסמא</label>
          </div>
          <button type="submit" className="confirmBtn" onClick={handleSubmit}>
            התחבר
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
