import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import "../gallery/Gallery.css";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import HotSpotPic from "../../components/hotspotPic/HotSpotPic";
import "./ViewVideo.css";

function ViewVideo() {
  const params = useParams();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState("");
  const [hotspot, setHotspot] = useState(false);
  const [hotspots, setHotspots] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [pausedTime, setPausedTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [verticalLines, setVerticalLines] = useState([]);
  const lineCanvasRef = useRef(null);
  const { currentUser } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [hotspotDetails, setHotspotDetails] = useState({
    hotspot: "",
    capturedImage: "",
  });
  const videoElementWidth = useRef(0);
  const videoElementHeight = useRef(0);

  useEffect(() => {
    fetchData();
    return () => {};
  }, []);

  useEffect(() => {
    if (videoRef.current && hotspots !== null) {
      const videoCont = document.querySelector(".videoContainer#vCont");

      videoElementWidth.current = videoCont.offsetWidth;
      videoElementHeight.current = videoCont.offsetHeight;
      const totalTime = videoRef.current.duration; // Assuming 'duration' is a property in your video document
      const lines = hotspots.map(
        (h) => (h.timestamp / totalTime) * videoElementWidth.current
      );
      drawVerticalLines(lines);
      const canvasElement = canvasRef.current;
      canvasElement.width = videoElementWidth.current - 60;
      canvasElement.height = videoElementHeight.current - 60;
      const hotspotTime = hotspots.map((h) => Math.round(h.timestamp));
      const handleTimeUpdate = () => {
        // console.log(videoRef.current);

        if (
          hotspotTime.includes(Math.round(videoRef.current.currentTime)) &&
          videoRef.current.currentTime != hotspotDetails.hotspot.timestamp
        ) {
          try {
            console.log(
              videoRef.current.currentTime,
              hotspotDetails.hotspot.timestamp
            );
            const videoElement = videoRef.current;
            const canvasElement = canvasRef.current;
            // Pause the video
            videoRef.current.pause();
            setHotspotDetails({
              hotspot: hotspots.filter(
                (h) =>
                  Math.round(h.timestamp) ==
                  Math.round(videoRef.current.currentTime)
              )[0],
            });
            const context = canvasElement.getContext("2d");
            context.drawImage(
              videoElement,
              0,
              0,
              canvasElement.width,
              canvasElement.height
            );

            canvasElement.toDataURL("image/png");
          } catch (error) {
            console.log(error);
          }

          setHotspotDetails({
            hotspot: hotspots.filter(
              (h) =>
                Math.round(h.timestamp) ==
                Math.round(videoRef.current.currentTime)
            )[0],
          });

          setHotspot(true);
        }
      };
      const handleLoadedMetadata = () => {
        videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
      };
      try {
        // Attach the time update event listener after the metadata has been loaded
        videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
        // Attach the loaded metadata event listener
        videoRef.current.addEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      } catch (error) {
        console.log(error);
      }
    }
    return () => {
      // Set isMounted to false when the component is unmounted
    };
  }, [isMounted]);

  useEffect(() => {
    console.log("useeffect: ", hotspotDetails.hotspot);
    if (hotspotDetails.hotspot.timestamp) {
      videoRef.current.currentTime = hotspotDetails.hotspot.timestamp;
    }
  }, [hotspotDetails.hotspot]);

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

  const fetchData = async () => {
    try {
      const userID = currentUser.uid;

      // get video document
      const docRef = doc(
        db,
        `users/${userID}/students/${params.studentid}/videos`,
        params.videoid
      );

      // get hotspots
      const HotspotDocRef = query(
        collection(
          db,
          `users/${userID}/students/${params.studentid}/videos/${params.videoid}/hotspots`
        )
      );

      const [HotSpots, video] = await Promise.all([
        getDocs(HotspotDocRef),
        getDoc(docRef),
      ]);
      setVideoUrl(video.data().videoUri);

      // fetch and set hotspots
      const hotSpots = HotSpots.docs.map((d) => d.data());
      setHotspots(hotSpots);
    } catch (error) {
      console.log(error);
    }
  };

  const drawVerticalLines = (lines) => {
    const lineCanvasElement = lineCanvasRef.current;
    if (lineCanvasElement != null) {
      const context = lineCanvasElement.getContext("2d");

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

  return (
    <div className="videoContainer" style={{ position: "relative" }}>
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
        <div
          className="videoContainer"
          style={{
            aspectRatio: 16 / 9,
            width: "100%",
            display: hotspot ? "none" : "flex",
          }}
        >
          <div
            className="videoContainer"
            id="vCont"
            style={{
              aspectRatio: 16 / 9,
              width: "100%",
            }}
          >
            <video
              id="videoPlayer"
              ref={videoRef}
              width={"100%"}
              controls
              onLoadedData={() => setIsMounted(true)}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <canvas
              ref={lineCanvasRef}
              width={videoElementWidth - 60}
              height="20"
              style={lineCanvasStyle}
            ></canvas>
          </div>
        </div>
      )}

      <div
        style={{ visibility: hotspot ? "visible" : "hidden", width: "100%" }}
      >
        <HotSpotPic
          hotspot={hotspotDetails.hotspot}
          canvasRef={canvasRef}
          setHotspot={setHotspot}
          videoRef={videoRef}
          hotspotIndicator={hotspot}
          videoElementWidth={videoElementWidth}
          videoElementHeight={videoElementHeight}
        />
      </div>
    </div>
  );
}

export default ViewVideo;

const lineCanvasStyle = {
  border: "1px solid #cccccc",
  marginTop: "10px",
};
