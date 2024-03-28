import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  on,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import "./ViewPhoto.css";
import success1 from "../../assets/audio/success.mp3";
import error1 from "../../assets/audio/error.mp3";

function ViewPhoto() {
  const params = useParams();
  const navigate = useNavigate();
  const [hotspots, setHotspots] = useState(null);
  const [photo, setPhoto] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const { currentUser } = useAuth();
  const [selectedOption, setSelectedOption] = useState(-1);
  const [selectedHotSpot, setSelectedHotSpot] = useState(null);
  const success = new Audio(success1);
  const error = new Audio(error1);
  const [clicks, setClicks] = useState(0);
  const [successes, setSuccesses] = useState(0);

  useEffect(() => {
    fetchData();
    return () => {};
  }, []);

  useEffect(() => {
    if (photo) {
      const canvasElement = canvasRef.current;

      const img = new Image();
      img.src = photo.fileUri;
      img.ref = imageRef;

      const screenHeight = window.screen.height;
      const screenWidth = window.screen.width;

      if (screenWidth > 600) {
        canvasElement.width = screenWidth / 2;
        canvasElement.height = canvasElement.width * (img.height / img.width);
      } else {
        canvasElement.width = screenWidth - 20;
        canvasElement.height = canvasElement.width * (img.height / img.width);
      }
      // canvasElement.width = img.width;
      // canvasElement.height = img.height;
      const context = canvasElement.getContext("2d");
      context.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
    }
    return () => {};
  }, [photo]);

  const fetchData = async () => {
    try {
      const userID = currentUser.uid;

      // get video document
      const docRef = doc(
        db,
        `users/${userID}/students/${params.studentid}/photos`,
        params.photoid
      );

      // get hotspots
      const HotspotDocRef = query(
        collection(
          db,
          `users/${userID}/students/${params.studentid}/photos/${params.photoid}/hotspots`
        )
      );

      const [HotSpots, photoFire] = await Promise.all([
        getDocs(HotspotDocRef),
        getDoc(docRef),
      ]);
      setPhoto(photoFire.data());
      //FINE!

      const hotSpots = HotSpots.docs.map((d) => d.data());
      setHotspots(hotSpots);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTouch = (e) => {
    try {
      const canvasElement = canvasRef.current;
      const rect = canvasElement.getBoundingClientRect();

      const x = Math.floor(
        ((e.clientX - rect.left) / canvasElement.width) * 100
      );
      const y = Math.floor(
        ((e.clientY - rect.top) / canvasElement.height) * 100
      );

      const res = selectedHotSpot.points.filter((point) => {
        let factor = point.width / 4;
        return (
          Math.floor(point.x + factor) > x &&
          Math.floor(point.x - factor) < x &&
          Math.floor(point.y + factor) > y &&
          Math.floor(point.y - factor) < y
        );
      });

      setClicks(clicks + 1);
      if (res.length != 0) {
        setSuccesses(successes + 1);
        success.play();
      } else {
        error.play();
      }

      console.log(res.length != 0);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (event, hotspot) => {
    setClicks(hotspot.itemClickCount);
    setSuccesses(hotspot.success);
    setSelectedHotSpot(hotspot);
    setSelectedOption(Number(event.target.id));
  };

  const handleSaveResults = async () => {
    try {
      const docRef = doc(
        db,
        `users/${currentUser.uid}/students/${params.studentid}/photos/${params.photoid}/hotspots/`,
        selectedHotSpot.id
      );
      await updateDoc(docRef, { success: successes, itemClickCount: clicks });

      const newArray = [...hotspots];
      // Find the object you want to update (e.g., based on its ID)
      const index = newArray.findIndex(
        (item) => item.id === selectedHotSpot.id
      );
      if (index !== -1) {
        // Update the property of the object
        newArray[index] = {
          ...newArray[index],
          success: successes,
          itemClickCount: clicks,
        };
        // Update the state with the new array
        setHotspots(newArray);
      }
      alert("תוצאות נשמרו בהצלחה!");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="photoContainerPage" style={{ position: "relative" }}>
      <div id="search-form">
        <div id="header">
          <h1>נקודות חמות</h1>
        </div>
      </div>

      <div className="backB" style={{ top: 60 }}>
        <button id="button" onClick={() => navigate(-1)}>
          <span className="glyphicon glyphicon-arrow-left" /> חזרה לגלריה
        </button>
      </div>
      <div className="hotandphoto">
        {photo && (
          <div
            className="videoContainercc"
            // style={{ width: "50%", background: "transparent", display: "flex" }}
          >
            {/* <img src={photo.fileUri} ref={imageRef} alt="" onLoadedData={} /> */}
            <canvas
              ref={canvasRef}
              style={{ cursor: "pointer" }}
              onMouseDown={(e) => handleTouch(e)}
            />
          </div>
        )}
        {hotspots && (
          <div className="videoContainercc">
            {hotspots.map((h, key) => {
              return (
                <label
                  key={key}
                  htmlFor={key}
                  style={{ padding: 0 }}
                  className={selectedOption === key ? "selected" : "hotspotCo"}
                >
                  {/* <div className="tobutton"> */}
                  <div
                    className="hotspotCo"
                    style={{
                      background:
                        selectedOption === key ? "#edca87" : "#f7e5c4",
                      boxShadow:
                        selectedOption === key
                          ? ""
                          : "0 0 0.3em 0.2em rgba(0, 0, 0, 0.082);",
                    }}
                  >
                    <input
                      type="radio"
                      name="hotspotR"
                      id={key}
                      onChange={(e) => handleChange(e, h)}
                      style={{
                        position: "fixed",
                        opacity: 0,
                        pointerEvents: "none",
                      }}
                    />
                    <h2>{h.title}</h2>
                    <div className="touches">
                      <div className="touch">
                        <h3>הצלחות</h3>
                        <h3>
                          {selectedOption !== key ? h.success : successes}
                        </h3>
                      </div>
                      <div className="touch">
                        <h3>סך לחיצות</h3>
                        <h3>
                          {selectedOption !== key ? h.itemClickCount : clicks}
                        </h3>
                      </div>
                    </div>
                  </div>
                  {selectedOption === key && (
                    <button
                      id="button"
                      style={{ margin: "10px" }}
                      onClick={handleSaveResults}
                    >
                      שמור תוצאות
                    </button>
                  )}
                  {/* </div> */}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewPhoto;
