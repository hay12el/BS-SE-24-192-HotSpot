import React, { useEffect, useRef, useState } from "react";
import success1 from "../../assets/audio/success.mp3";
import error1 from "../../assets/audio/error.mp3";
import "./HotSpotPic.css";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";

function HotSpotPic({
  hotspot,
  canvasRef,
  setHotspot,
  videoRef,
  hotspotIndicator,
}) {
  const success = new Audio(success1);
  const error = new Audio(error1);
  const [clicks, setClicks] = useState(hotspot.itemClickCount);
  const [successes, setSuccesses] = useState(hotspot.success);
  const { currentUser } = useAuth();
  const params = useParams();
  const [selectedOption, setSelectedOption] = useState(-1);
  const [selectedHotSpot, setSelectedHotSpot] = useState(null);
  const [hotspots, setHotspots] = useState(null);

  useEffect(() => {
    console.log(hotspot);
    setClicks(hotspot.itemClickCount);
    setSuccesses(hotspot.success);
  }, [hotspotIndicator]);

  const handleCanvasTouch = (event) => {
    const canvasElement = canvasRef.current;
    const rect = canvasElement.getBoundingClientRect();
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);

    const hotspot = selectedHotSpot;

    if (hotspot) {
      let factor = 30;
      const res = hotspot.points.filter((point) => {
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
    }
  };

  const drawRect = (hotspots) => {
    const canvasElement = canvasRef.current;
    const ctx = canvasElement.getContext("2d");

    for (const hotspot of hotspots) {
      const Xleft = hotspot.points.reduce(
        (max, obj) => (obj.x < max ? obj.x : max),
        hotspot.points[0].x
      );
      const Xright = hotspot.points.reduce(
        (max, obj) => (obj.x > max ? obj.x : max),
        hotspot.points[0].x
      );
      const Yup = hotspot.points.reduce(
        (max, obj) => (obj.y < max ? obj.y : max),
        hotspot.points[0].y
      );
      const Ydown = hotspot.points.reduce(
        (max, obj) => (obj.y > max ? obj.y : max),
        hotspot.points[0].y
      );
      const w = hotspot.points[0].width;
      ctx.beginPath();
      ctx.rect(Xleft - w / 2, Yup, Xright - Xleft + w / 2, Ydown - Yup + w / 2);
      ctx.lineWidth = "4";
      ctx.strokeStyle = hotspot.color;
      ctx.stroke();
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

  const handleClose = async () => {
    try {
      const docRef = doc(
        db,
        `users/${currentUser.uid}/students/${params.studentid}/videos/${params.videoid}/hotspots/`,
        hotspot.id
      );
      await updateDoc(docRef, { success: successes, itemClickCount: clicks });
      setHotspot(false);
      if (videoRef) {
        videoRef.current.currentTime = Math.floor(hotspot.timestamp) + 1.5;
        videoRef.current.play();
      }
    } catch (error) {
      console.log(error);
      setHotspot(false);
      if (videoRef) {
        videoRef.current.currentTime = Math.floor(hotspot.timestamp) + 1.5;
        videoRef.current.play();
      }
    }
  };

  return (
    <div className="canvaspicker">
      <span
        onClick={handleClose}
        style={{
          position: "absolute",
          left: 20,
          top: 20,
          color: "#0a7cae",
          cursor: "pointer",
        }}
        className="glyphicon glyphicon-remove"
      ></span>
      <div className="counters">
        <div className="rightCanv">
          <canvas
            ref={canvasRef}
            style={canvasStyle}
            onMouseDown={handleCanvasTouch}
          ></canvas>
          <button id="button" onClick={() => drawRect(hotspot.hotspots)}>
            הצג סימונים
          </button>
        </div>
        {hotspot && (
          <div className="videoContainercc" style={{ direction: "rtl" }}>
            {hotspot.hotspots.map((h, key) => {
              return (
                <label
                  key={key}
                  htmlFor={key}
                  style={{ padding: 0 }}
                  className={selectedOption === key ? "selected" : "hotspotCo"}
                >
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
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default HotSpotPic;

const canvasStyle = {
  border: "1px solid #cccccc",
  marginTop: "10px",
};


