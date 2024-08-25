import React, { useEffect } from "react";
import "./home.css";
import { useNavigate } from "react-router-dom";
import { CheckAuth } from "../../hooks/hooks";

function Home() {
  const navigate = useNavigate();
  const isLogIn = CheckAuth();

  useEffect(() => {
    if (!isLogIn) {
      navigate("/login");
    }
  }, []);

  return (
    <>
      <div className="HomeContainer">
        <div id="search-form">
          <div id="header">
            <h1>ברוכים הבאים לאפליקצית HotSpot</h1>
          </div>
        </div>
        <div className="buttons">
          <button id="button" onClick={() => navigate("/myStudents")}>
            בחר סטודנט
          </button>
        </div>
      </div>
    </>
  );
}

export default Home;
