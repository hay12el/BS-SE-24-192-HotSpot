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
        canvasElement.width = screenWidth / 2;
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
      // try {
      //   const canvasElement = canvasRef.current;
      //   const rect = canvasElement.getBoundingClientRect();
  
      //   const x = Math.floor(
      //     ((e.clientX - rect.left) / canvasElement.width) * 100
      //   );
      //   const y = Math.floor(
      //     ((e.clientY - rect.top) / canvasElement.height) * 100
      //   );
  
      //   const res = selectedHotSpot.points.filter((point) => {
      //     let factor = point.width / 4;
      //     return (
      //       Math.floor(point.x + factor) > x &&
      //       Math.floor(point.x - factor) < x &&
      //       Math.floor(point.y + factor) > y &&
      //       Math.floor(point.y - factor) < y
      //     );
      //   });
  
      //   setClicks(clicks + 1);
      //   if (res.length != 0) {
      //     setSuccesses(successes + 1);
      //     success.play();
      //   } else {
      //     error.play();
      //   }
      // } catch (error) {
      //   console.log(error);
      // }
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

  const drawRect = () => {
    const canvasElement = canvasRef.current;
    const ctx = canvasElement.getContext("2d");
    const rect = canvasElement.getBoundingClientRect();

    for (const hotspot of hotspots) {
      const Xleft = hotspot.points.reduce(
        (max, obj) => (obj.x < max ? obj.x : max, hotspot.points[0].x)
      );
      const Xright = hotspot.points.reduce(
        (max, obj) => (obj.x > max ? obj.x : max),
        hotspot.points[0].x
      );

      const Yup = hotspot.points.reduce(
        (max, obj) => (obj.y > max ? obj.y : max),
        hotspot.points[0].y
      );
      const Ydown = hotspot.points.reduce(
        (max, obj) => (obj.y < max ? obj.y : max),
        hotspot.points[0].y
      );
      const w = hotspot.points[0].width;
      ctx.beginPath();
      const left = (Xleft / 100) * canvasElement.width,
        right = (Xright / 100) * canvasElement.width,
        down = (Yup / 100) * canvasElement.height,
        up = (Ydown / 100) * canvasElement.height;
      // ctx.rect(295, 30, 100, 100);
      ctx.rect(left - w, up - w / 2, right - left + w * 2, down - up + w * 2);
      // ctx.rect(
      //   left - w / 2,
      //   up - w / 2,
      //   right - left + w / 2,
      //   down - up + w / 2
      // );
      ctx.lineWidth = "4";
      ctx.strokeStyle = hotspot.color;
      ctx.stroke();
    }
  };

  // new!
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

  return (
    <div
      className="photoContainerPage"
      style={{ position: "relative" }}
    >
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
          // <div className="videoContainercc" style={{ alignItems: "center" }}>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* <img src={photo.fileUri} ref={imageRef} alt="" onLoadedData={} /> */}
            <canvas
              ref={canvasRef}
              style={{ cursor: "pointer" }}
              onMouseDown={(e) => handleTouch(e)}
            />
            <button id="button" onClick={() => redrawLines()}>
              הצג סימונים
            </button>
            {/* <button id="button" onClick={() => drawRect()}>
              הצג סימונים
            </button> */}
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
