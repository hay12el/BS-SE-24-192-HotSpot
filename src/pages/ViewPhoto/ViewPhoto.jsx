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
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from "body-scroll-lock";

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
  const [showLines, setShowLines] = useState(false);
  const [flickering, setFlickering] = useState(false);

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

      const screenWidth = window.screen.width;
      var w = window.screen.width;
      var h = window.screen.height;
      var DPR = window.devicePixelRatio;
      w = Math.round(DPR * w);
      h = Math.round(DPR * h);

      if (screenWidth > 600) {
        console.log("62");
        canvasElement.width = screenWidth * (3 / 4);
        canvasElement.height = canvasElement.width * (img.height / img.width);
      } else {
        canvasElement.width = screenWidth - 20;
        canvasElement.height = canvasElement.width * (img.height / img.width);
      }
      const context = canvasElement.getContext("2d");
      context.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
    }
    return () => {};
  }, [photo]);

  const removeLines = () => {
    if (photo) {
      const img = new Image();
      img.src = photo.fileUri;
      img.ref = imageRef;
      const canvasElement = canvasRef.current;
      const context = canvasElement.getContext("2d");
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      context.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
    }
  };

  const changeShowLine = () => {
    setShowLines(!showLines);
  };

  const changeFlickering = () => {
    setFlickering(!flickering);
  };

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
      const ctx = canvasElement.getContext("2d");

      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);

      // ctx.beginPath();
      var path = new Path2D();

      // Define the path based on the points of the hotspot
      path.moveTo(
        (selectedHotSpot.points[0].x / 100) * canvasElement.width,
        (selectedHotSpot.points[0].y / 100) * canvasElement.height
      );
      for (let i = 1; i < selectedHotSpot.points.length; i++) {
        path.lineTo(
          (selectedHotSpot.points[i].x / 100) * canvasElement.width,
          (selectedHotSpot.points[i].y / 100) * canvasElement.height
        );
      }
      path.closePath(); // Close the path
      // Check if the clicked point is inside the drawn shape
      setClicks(clicks + 1);
      if (ctx.isPointInPath(path, x, y, "evenodd")) {
        setSuccesses(successes + 1);
        success.play();
        // return; // Exit the loop since we found the matching shape
      } else {
        error.play();
      }
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
      console.log(
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

  const redrawLines = () => {
    const canvasElement = canvasRef.current;
    const context = canvasElement.getContext("2d");

    for (const hotspot of hotspots) {
      context.strokeStyle = hotspot.color;
      context.lineWidth = hotspot.lineWidth;
      for (let i = 1; i < hotspot.points.length; i++) {
        const startX = (hotspot.points[i - 1].x / 100) * canvasElement.width;
        const startY = (hotspot.points[i - 1].y / 100) * canvasElement.height;
        const endX = (hotspot.points[i].x / 100) * canvasElement.width;
        const endY = (hotspot.points[i].y / 100) * canvasElement.height;

        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
      }
    }
  };

  useEffect(() => {
    let flickerInterval = 1;
    if (flickering) {
      flickerInterval = setInterval(() => {
        removeLines();
        setTimeout(() => {
          redrawLines();
        }, 500); // Adjust the flickering speed as per your preference
      }, 1000); // Adjust the duration of flickering as per your preference
    } else {
      removeLines();
      clearInterval(flickerInterval);
    }

    return () => clearInterval(flickerInterval);
  }, [flickering]);

  return (
    <div className="photoContainerPage" style={{ position: "relative" }}>
      <div className="backB" style={{ top: 100 }}>
        <button id="button" onClick={() => navigate(-1)}>
          <span className="glyphicon glyphicon-arrow-left" /> חזרה לגלריה
        </button>
      </div>
      <div className="hotandphoto">
        {photo && (
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{ cursor: "pointer" }}
              onMouseDown={(e) => handleTouch(e)}
            />
          </div>
        )}
        {hotspots && (
          <div
            className="videoContainercc"
            style={{ alignItems: "flex-start", direction: "rtl" }}
          >
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
            <button
              id="button"
              style={{ width: "120px" }}
              onClick={
                !showLines
                  ? () => {
                      changeShowLine();
                      redrawLines();
                    }
                  : () => {
                      changeShowLine();
                      removeLines();
                    }
              }
            >
              {!showLines ? "הצג סימונים" : "הסתר סימנים"}
            </button>
            <button
              id="button"
              onClick={changeFlickering}
              style={{ width: "120px" }}
            >
              {!flickering ? "סימנים מהבהבים" : "הפסק היבהוב"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewPhoto;
