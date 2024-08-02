import React, { useState, useRef, useEffect } from "react";
import HotspotSetting from "../hotspotSetting/HotspotSetting";
import "./VideoComponent.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

const VideoComponent = ({ videoUrl, videoObject, hotspots }) => {
  // const [videoUrl, setVideoUrl] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [hotspot, setHotspot] = useState(false);
  const [HotSpots, setHotspots] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [pausedTime, setPausedTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [verticalLines, setVerticalLines] = useState([]);
  const lineCanvasRef = useRef(null);
  const navigate = useNavigate();
  const params = useParams();
  const { currentUser } = useAuth();

  useEffect(() => {
    setTotalTime(videoRef.current.duration);
    const lines = hotspots.map((h) => (h.timestamp / totalTime) * 610);
    drawVerticalLines(lines);
    setHotspots(hotspots);
  }, [hotspots]);

  function customRound(num) {
    // Ensure the input is a number
    if (typeof num !== "number" || isNaN(num)) {
      throw new Error("Input must be a valid number");
    }

    // Extract the integer and decimal parts
    const integerPart = Math.floor(num);
    const decimalPart = num - integerPart;

    if (decimalPart < 0.3) {
      return integerPart + 0.0;
    } else if (decimalPart >= 0.7) {
      return integerPart + 1.0;
    } else {
      return integerPart + 0.5;
    }
  }

  const handleCaptureImage = () => {
    try {
      const videoElement = videoRef.current;
      videoElement.pause();
      setTotalTime(videoElement.duration);
      setPausedTime(videoElement.currentTime);
      const canvasElement = canvasRef.current;
      setHotspot(true);

      canvasElement.width = 640;
      canvasElement.height = 360;

      console.log(videoRef.current.currentTime);
      console.log(customRound(videoRef.current.currentTime));
      videoElement.currentTime = customRound(videoRef.current.currentTime);

      const context = canvasElement.getContext("2d");
      context.drawImage(
        videoElement,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // const imageBlob = canvasElement.toDataURL("image/png");
    } catch (error) {
      console.log(error);
    }
  };

  const drawVerticalLines = (lines) => {
    const lineCanvasElement = lineCanvasRef.current;
    if (lineCanvasElement != null) {
      const context = lineCanvasElement.getContext("2d");

      console.log(lines);

      context.clearRect(
        0,
        0,
        lineCanvasElement.width,
        lineCanvasElement.height
      );

      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 2;

      lines.forEach((x) => {
        context.moveTo(x, 0);
        context.lineTo(x, lineCanvasRef.current.height);
      });

      context.stroke();
      context.closePath();
    }
  };

  const deleteHotspot = async (elementId) => {
    try {
      if (window.confirm("האם למחוק את הנקודה החמה הזו?")) {
        var userID = currentUser.uid;
        const studentID = params.studentid;
        const photoId = params.photoid;
        const HotspotDocRef = doc(
          db,
          `users/${userID}/students/${studentID}/videos/${photoId}/hotspots/${elementId}`
        );

        await deleteDoc(HotspotDocRef);

        const HotspotsDocRef = query(
          collection(
            db,
            `users/${userID}/students/${studentID}/videos/${photoId}/hotspots`
          )
        );

        // get video's hotspots
        const HotSpotsDocs = await getDocs(HotspotsDocRef);
        const Hotspots = HotSpotsDocs.docs.map((h) => h.data());
        setHotspots(Hotspots);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="videoContainer">
      <div id="search-form">
        <div id="header">
          <h1>עריכת נקודות חמות</h1>
        </div>
        <div id="header">
          <h3>בחר סרטון והוסף נקודות חמות</h3>
        </div>
      </div>

      <div className="backB">
        <button id="button" onClick={() => navigate(-1)}>
          <span className="glyphicon glyphicon-arrow-left" /> חזרה לגלריה
        </button>
      </div>

      {videoUrl && (
        <div className="videoContainer">
          <div
            className="videoContainer"
            style={{ display: hotspot ? "none" : "flex" }}
          >
            <video
              id="videoPlayer"
              ref={videoRef}
              width="640"
              height="360"
              controls
              onLoadedData={() => console.log("Video loaded")}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <canvas
              ref={lineCanvasRef}
              width="610"
              height="20"
              style={lineCanvasStyle}
            ></canvas>{" "}
            {/* Added line */}
            <div className="buttons">
              <button id="button" onClick={handleCaptureImage}>
                לכידת תמונה
              </button>
            </div>
          </div>
          <div style={{ display: !hotspot ? "none" : "flex" }}>
            <HotspotSetting
              capturedImage={capturedImage}
              canvasRef={canvasRef}
              handleCaptureImage={handleCaptureImage}
              setCapturedImage={setCapturedImage}
              setHotspot={setHotspot}
              pausedTime={pausedTime}
              totalTime={totalTime}
              setVerticalLines={setVerticalLines}
              verticalLines={verticalLines}
            />
          </div>
        </div>
      )}
      {HotSpots && (
        <table style={{ width: "90%", height: "min-content" }}>
          <tr>
            <th style={headerStyle}>זמן הצגת הנקודות</th>
            <th style={headerStyle}>נקודות</th>
            <th style={headerStyle}>מחיקת הנקודות החמות</th>
          </tr>
          {HotSpots.map((h, key) => {
            return (
              <tr>
                <td style={{ cursor: "default" }}>
                  <h4>{h.timestamp.toFixed(2)}</h4>
                </td>
                <td
                  style={{
                    direction: "rtl",
                    textAlign: "start",
                    cursor: "default",
                  }}
                >
                  {h.hotspots.map((hot) => {
                    return <h4>&#x2022; {hot.title}</h4>;
                  })}
                </td>
                <td style={{ cursor: "default" }}>
                  <span
                    class="glyphicon glyphicon-trash"
                    onClick={() => deleteHotspot(h.id)}
                    style={{
                      color: "red",
                      cursor: "pointer",
                    }}
                  ></span>
                </td>
              </tr>
            );
          })}
        </table>
      )}
    </div>
  );
};

const lineCanvasStyle = {
  border: "1px solid #cccccc",
  marginTop: "10px",
};

const headerStyle = {
  textAlign: "center",
  direction: "rtl",
};
export default VideoComponent;
