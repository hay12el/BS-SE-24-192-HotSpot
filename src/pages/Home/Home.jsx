import React, { useRef } from "react";
import { useState } from "react";
import "./home.css";
import VideoComponent from "../../components/video/VideoComponent";
import Loader from "../../components/loader/Loader";
import { useNavigate } from "react-router-dom";

function Home() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="HomeContainer">
        <Loader show={show} />
        <div id="search-form">
          <div id="header">
            <h1>ברוכים הבאים לאפליקצית HotSpot</h1>
          </div>
          <div id="header">
            <h3>האפליקציה שעוזרת לבעלי תסמונת ALS לתקשר עם העולם</h3>
          </div>
        </div>
      </div>

      <div className="buttons">
        <button id="button" onClick={() => navigate("/myStudents")}>
          בחר סטודנט
        </button>
      </div>
    </>
  );
}

export default Home;
