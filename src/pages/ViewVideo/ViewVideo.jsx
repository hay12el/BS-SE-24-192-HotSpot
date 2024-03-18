import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import "../gallery/Gallery.css";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import HotSpotPic from "../../components/hotspotPic/HotSpotPic";
import './ViewVideo.css'

function ViewVideo() {
  const params = useParams();
  const navigate = useNavigate()
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

  useEffect(() => {
    fetchData();
  }, []);

  //   useEffect(() => {
  //     console.log(verticalLines);
  //     drawVerticalLines();
  //   }, [verticalLines]);

  useEffect(() => {
    if (videoRef.current && hotspots !== null) {
      const totalTime = videoRef.current.duration; // Assuming 'duration' is a property in your video document
      const lines = hotspots.map((h) => (h.timestamp / totalTime) * 610);
      drawVerticalLines(lines);
      const hotspotTime = hotspots.map((h) => Math.floor(h.timestamp));
      const handleTimeUpdate = () => {
        if (hotspotTime.includes(Math.floor(videoRef.current.currentTime))) {
          try {
            const videoElement = videoRef.current;
            const canvasElement = canvasRef.current;

            canvasElement.width = 640;
            canvasElement.height = 360;

            const context = canvasElement.getContext("2d");
            context.drawImage(
              videoElement,
              0,
              0,
              canvasElement.width,
              canvasElement.height
            );

            canvasElement.toDataURL("image/png");
            //   setCapturedImage(imageBlob);
          } catch (error) {
            console.log(error);
          }

          setHotspotDetails({
            hotspot: hotspots.filter(
              (h) =>
                Math.floor(h.timestamp) ==
                Math.floor(videoRef.current.currentTime)
            )[0],
          });
          // Pause the video
          videoRef.current.pause();
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
      //FINE!

      // fetch and set hotspots
      const hotSpots = HotSpots.docs.map((d) => d.data());
      setHotspots(hotSpots);

      //   const totalTime = videoRef.current.duration; // Assuming 'duration' is a property in your video document
      //   const lines = hotSpots.map((h) => (h.timestamp / totalTime) * 610);
      //   console.log(lines);
      //   drawVerticalLines(lines);

      //   console.log(lines);
      //   setVerticalLines(lines);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePlayPause = () => {
    const videoElement = videoRef.current;
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
      setPausedTime(videoElement.currentTime);
    }
  };

  const handleStop = () => {
    const videoElement = videoRef.current;
    videoElement.pause();
    videoElement.currentTime = 0;
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
        <span className="glyphicon glyphicon-arrow-left"/> חזרה לגלריה
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
              onLoadedData={() => setIsMounted(true)}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <canvas
              ref={lineCanvasRef}
              width="610"
              height="20"
              style={lineCanvasStyle}
            ></canvas>
          </div>
        </div>
      )}

      <div style={{ visibility: hotspot ? "visible" : "hidden" }}>
        <HotSpotPic
          hotspot={hotspotDetails.hotspot}
          canvasRef={canvasRef}
          setHotspot={setHotspot}
          videoRef={videoRef}
          hotspotIndicator={hotspot}
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
