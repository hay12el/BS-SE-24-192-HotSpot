import React, { useState, useRef } from "react";
import { ChromePicker } from "react-color";
import "./HotspotSetting.css";

function HotspotSetting({
  capturedImage,
  canvasRef,
  handleCaptureImage,
  setCapturedImage,
  setHotspot,
  pausedTime,
  totalTime,
  setVerticalLines,
  verticalLines
}) {
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [name, setName] = useState("");
  const [hotspotColor, setHotspotColor] = useState("red");
  const recordedChunks = useRef([]);
  const [squares, setSquares] = useState([]);

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    setHotspotColor(color.hex);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = () => {
    // Implement your logic to handle the submitted data (color and name)
    if (name == "") {
      alert("הכנס את שם הנקודה");
    } else {
      alert("הנקודה החמה נוספה בהצלחה");
      handleClose();
    }
  };

  const removeLastSquare = () => {
    if (recordedChunks.current.length >= 0) {
      recordedChunks.current.pop();
      const context = canvasRef.current.getContext("2d");
      redrawSquares(context);
    }
  };

  const handleClose = () => {
    recordedChunks.current = [];
    setName("");
    setHotspot(false);
    setCapturedImage(null);
    setVerticalLines([...verticalLines, (pausedTime / totalTime) * 610])
  };

  const redrawSquares = (context) => {
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    handleCaptureImage(capturedImage);
    context.globalAlpha = 0.3;
    context.fillStyle = hotspotColor;

    recordedChunks.current.forEach((square) => {
      context.fillRect(square.x - 15, square.y - 15, 30, 30);
    });
  };

  const handleCanvasDraw = (event) => {
    const canvasElement = canvasRef.current;
    const context = canvasElement.getContext("2d");
    const rect = canvasElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    recordedChunks.current.push({ x, y });

    // // Draw the square on the canvas
    context.globalAlpha = 0.3;
    context.fillStyle = hotspotColor;

    squares.forEach((square) => {
      context.fillRect(square.x, square.y, 30, 30);
    });

    context.fillRect(x - 15, y - 15, 30, 30);
    console.log(recordedChunks.current);
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
        class="glyphicon glyphicon-remove"
      ></span>

      <div>
        <canvas
          ref={canvasRef}
          style={canvasStyle}
          onMouseDown={handleCanvasDraw}
        ></canvas>
      </div>
      <div className="settingsContainer">
        <label>
          <h4>כותרת:</h4>
          <input type="text" value={name} onChange={handleNameChange} />
        </label>

        <br />
        <label>
          <h4>בחר צבע:</h4>
          <ChromePicker color={selectedColor} onChange={handleColorChange} />
        </label>

        <br />
        <div className="buttons">
          <button id="button" onClick={removeLastSquare}>
            <span class="glyphicon glyphicon-repeat"></span>
          </button>
          <button
            id="button"
            style={{ color: "#0a7cae", fontWeight: "600" }}
            onClick={handleSubmit}
          >
            הוסף נקודה חמה
          </button>
        </div>
      </div>
    </div>
  );
}

export default HotspotSetting;

const canvasStyle = {
  border: "1px solid #cccccc",
  marginTop: "10px",
};
