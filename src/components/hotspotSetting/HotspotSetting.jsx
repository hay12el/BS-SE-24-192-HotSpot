import React, { useState, useRef } from "react";
import { ChromePicker } from "react-color";
import "./HotspotSetting.css";
import { useAuth } from "../../context/AuthContext";
import { db, storage } from "../../firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";

function HotspotSetting({
  capturedImage,
  canvasRef,
  handleCaptureImage,
  setCapturedImage,
  setHotspot,
  pausedTime,
  totalTime,
  setVerticalLines,
  verticalLines,
}) {
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [name, setName] = useState("");
  const [hotspotColor, setHotspotColor] = useState("red");
  const recordedChunks = useRef([]);
  const [squares, setSquares] = useState([]);
  const { currentUser } = useAuth();
  const params = useParams();

  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    setHotspotColor(color.hex);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      // Implement your logic to handle the submitted data (color and name)
      if (name == "") {
        alert("הכנס את שם הנקודה");
      } else {
        var userID = currentUser.uid;
        const { photoid, studentid } = params;
        console.log(photoid, studentid);
        const newUUID = uuidv4();
        await setDoc(
          doc(
            db,
            `/users/${userID}/students/${studentid}/videos/${photoid}/hotspots`,
            newUUID
          ),
          {
            // audioUri: it.audioUri, //
            color: selectedColor,
            // offsetX: it.offsetX, //
            // offsetY: it.offsetY, //
            itemClickCount: 0,
            points: recordedChunks, //
            timestamp: pausedTime,
            title: name,
            id: newUUID,
          }
        );
        // collection(
        //   db,
        //   `/users/${userID}/students/${studentid}/videos/${photoid}/hotspots`
        // ),
        // {
        //   // audioUri: it.audioUri, //
        //   color: selectedColor,
        //   // offsetX: it.offsetX, //
        //   // offsetY: it.offsetY, //
        //   itemClickCount: 0,
        //   points: recordedChunks, //
        //   timestamp: pausedTime,
        //   title: name,
        // }
        // );
        alert("הנקודה החמה נוספה בהצלחה");

        handleClose();
      }
    } catch (error) {
      console.log(error);
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
    setVerticalLines([...verticalLines, (pausedTime / totalTime) * 610]);
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

    recordedChunks.current.push({ x: x, y: y });

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
