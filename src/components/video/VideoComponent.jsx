import React, { useState, useRef, useEffect } from "react";
import HotspotSetting from "../hotspotSetting/HotspotSetting";
import "./VideoComponent.css";

const VideoComponent = ({ videoUrl }) => {
  // const [videoUrl, setVideoUrl] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [hotspot, setHotspot] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [pausedTime, setPausedTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [verticalLines, setVerticalLines] = useState([]);
  const lineCanvasRef = useRef(null);

  useEffect(() => {
    drawVerticalLines();
  }, [verticalLines]);

  // const onDrop = (acceptedFiles) => {
  //   const file = acceptedFiles[0];
  //   const videoObjectUrl = URL.createObjectURL(file);
  //   setVideoUrl(videoObjectUrl);
  // };

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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

      const context = canvasElement.getContext("2d");
      context.drawImage(
        videoElement,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      const imageBlob = canvasElement.toDataURL("image/png");
      setCapturedImage(imageBlob);
    } catch (error) {
      console.log(error);
    }
  };

  const drawVerticalLines = () => {
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

      verticalLines.forEach((x) => {
        context.moveTo(x, 0);
        context.lineTo(x, lineCanvasRef.current.height);
      });

      context.stroke();
      context.closePath();
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
              <button id="button" onClick={handlePlayPause}>
                Play/Pause
              </button>
              <button id="button" onClick={handleStop}>
                Stop
              </button>
              <button id="button" onClick={handleCaptureImage}>
                Capture Image
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
    </div>
  );
};

const dropzoneStyle = {
  border: "2px dashed #cccccc",
  borderRadius: "4px",
  padding: "20px",
  textAlign: "center",
  cursor: "pointer",
};

const lineCanvasStyle = {
  border: "1px solid #cccccc",
  marginTop: "10px",
};

export default VideoComponent;
