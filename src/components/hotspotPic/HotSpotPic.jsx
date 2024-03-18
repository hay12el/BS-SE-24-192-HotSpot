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

    let factor = 30;
    const res = hotspot.points.current.filter((point) => {
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
      <div>
        <h1 style={{ textAlign: "right" }}>{hotspot.title}</h1>
        <canvas
          ref={canvasRef}
          style={canvasStyle}
          onMouseDown={handleCanvasTouch}
        ></canvas>
        <div className="counters">
          <div className="score">
            <h2>הצלחות</h2>
            <h3>{successes}</h3>
          </div>

          <div className="score">
            <h2>לחיצות</h2>
            <h3>{clicks}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotSpotPic;

const canvasStyle = {
  border: "1px solid #cccccc",
  marginTop: "10px",
};
