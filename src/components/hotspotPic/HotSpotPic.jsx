import React, { useEffect, useRef, useState } from "react";
import success1 from "../../assets/audio/success.mp3";
import error1 from "../../assets/audio/error.mp3";

function HotSpotPic({ hotspot, canvasRef, setHotspot, videoRef }) {
  const success = new Audio(success1);
  const error = new Audio(error1);

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

    if (res.length != 0) {
      success.play();
    } else {
      error.play();
    }

    console.log(res.length != 0);
  };

  const handleClose = () => {
    setHotspot(false);
    if (videoRef) {
      videoRef.current.currentTime = Math.floor(hotspot.timestamp) + 1.5;
      videoRef.current.play();
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
      </div>
    </div>
  );
}

export default HotSpotPic;

const canvasStyle = {
  border: "1px solid #cccccc",
  marginTop: "10px",
};
