import React, { useState, useRef, useEffect } from "react";
import { ChromePicker } from "react-color";
import "../hotspotSetting/HotspotSetting.css";
import { useAuth } from "../../context/AuthContext";
import { db, storage } from "../../firebase";
// import ImageDataURI from "image-data-uri";
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
import { useNavigate, useParams } from "react-router-dom";
import { ObjectDetector } from "../objectDetector/index";
import "./HotspotSettingPhoto.css";

function HotspotSettingPhotos({
  capturedImage,
  canvasRef,
  setHotspot,
  imgRef,
  setHotspots,
  Hotspots,
}) {
  const [selectedColor, setSelectedColor] = useState("red");
  const [name, setName] = useState("");
  const recordedChunks = useRef([]);
  const [squareWidth, setSquareWidth] = useState(3);
  const { currentUser } = useAuth();
  const [dataUri, setDataUri] = useState(null);
  const params = useParams();
  const [O_DETECTION, setO_DETECTION] = useState(false);
  const [pred, setPred] = useState(null);
  const colors = ["red", "blue", "green", "yellow", "orange", "purple"];

  // code added!
  const isDrawing = useRef(false);
  const pointsRef = useRef([]);
  let startX = 0;
  let startY = 0;

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  // Function to redraw the lines
  const redrawLines = () => {
    const canvasElement = canvasRef.current;
    const context = canvasElement.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    context.drawImage(
      imgRef.current,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    context.strokeStyle = selectedColor;
    context.lineWidth = squareWidth;

    for (let i = 1; i < pointsRef.current.length; i++) {
      const startX = pointsRef.current[i - 1].x;
      const startY = pointsRef.current[i - 1].y;
      const endX = pointsRef.current[i].x;
      const endY = pointsRef.current[i].y;

      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
    }
  };

  const handleSubmit = async () => {
    try {
      const canvasElement = canvasRef.current;

      // normalize the points, the values will be in range 0-100
      const pointsForSub = pointsRef.current.map((p) => ({
        x: (p.x / canvasElement.width) * 100,
        y: (p.y / canvasElement.height) * 100,
      }));
      console.log(pointsForSub);
      redrawLines();

      // Implement your logic to handle the submitted data (color and name)
      if (name == "") {
        alert("הכנס את שם הנקודה");
      } else {
        var userID = currentUser.uid;
        const { photoid, studentid } = params;
        const newUUID = uuidv4();
        const newHotSpot = await setDoc(
          doc(
            db,
            `/users/${userID}/students/${studentid}/photos/${photoid}/hotspots`,
            newUUID
          ),
          {
            color: selectedColor,
            itemClickCount: 0,
            success: 0,
            points: pointsForSub,
            lineWidth: squareWidth,
            title: name,
            id: newUUID,
          }
        );

        setHotspots([
          ...Hotspots,
          {
            color: selectedColor,
            itemClickCount: 0,
            success: 0,
            points: pointsForSub,
            lineWidth: squareWidth,
            title: name,
            id: newUUID,
          },
        ]);

        alert("הנקודה החמה נוספה בהצלחה");

        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    recordedChunks.current = [];
    setName("");
    setHotspot(false);
    // setCapturedImage(null);
    // setVerticalLines([...verticalLines, (pausedTime / totalTime) * 610]);
    setSquareWidth(3);
  };

  const hci = async () => {
    let blob = await fetch(capturedImage).then((r) => r.blob());
    let dataUrl = await new Promise((resolve) => {
      let reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    setDataUri(dataUrl);
    setO_DETECTION(true);
  };

  const handlePredictClick = (pred) => {
    alert("האם תרצה/י לשמור את האוביקט כנקודה חמה?");
  };

  const startDrawing = ({ nativeEvent }) => {
    pointsRef.current = [];
    const canvasElement = canvasRef.current;
    const context = canvasElement.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    context.drawImage(
      imgRef.current,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    const { offsetX, offsetY } = getCanvasCoordinates(nativeEvent);
    startX = offsetX;
    startY = offsetY;
    pointsRef.current.push({ x: startX, y: startY });
    isDrawing.current = true;
  };

  const drawLine = (context, x1, y1, x2, y2) => {
    context.beginPath();
    context.strokeStyle = selectedColor;
    context.lineWidth = squareWidth;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  };

  const draw = ({ nativeEvent }) => {
    if (isDrawing.current) {
      const { offsetX, offsetY } = getCanvasCoordinates(nativeEvent);
      const context = canvasRef.current.getContext("2d");
      drawLine(context, startX, startY, offsetX, offsetY);
      startX = offsetX;
      startY = offsetY;
      pointsRef.current.push({ x: startX, y: startY });
    }
  };

  const autoComplete = (e) => {
    e.preventDefault(); // Prevent right-click menu
    if (isDrawing.current && pointsRef.current.length > 1) {
      const context = canvasRef.current.getContext("2d");
      // Connect the last point to the first
      const firstPoint = pointsRef.current[0];
      drawLine(context, startX, startY, firstPoint.x, firstPoint.y);
      isDrawing.current = false;
      console.log(pointsRef.current);
    }
  };

  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (event.type.startsWith("touch")) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
  };

  return (
    <div className="bg-white pt-16 rounded-xl relative w-full">
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
      <div
        className="od"
        style={{
          visibility: !O_DETECTION ? "hidden" : "visible",
          display: !O_DETECTION ? "none" : "flex",
        }}
      >
        <ObjectDetector
          setO_DETECTION={setO_DETECTION}
          capturedImage={dataUri}
          setPred={setPred}
        />
        <div className="predicts">
          {pred &&
            pred.map((p) => {
              return (
                <div className="predictCont" onClick={handlePredictClick}>
                  <h3>{p.class}</h3>
                </div>
              );
            })}
        </div>
      </div>

      <div
        className="canvaspicker"
        style={{
          visibility: O_DETECTION ? "hidden" : "visible",
          display: O_DETECTION ? "none" : "flex",
        }}
      >
        <div>
          <canvas
            ref={canvasRef}
            style={canvasStyle}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={autoComplete}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={autoComplete}
            // onMouseDown={handleCanvasDraw}
          ></canvas>
        </div>
        <div className="settingsContainer">
          <label>
            <h4>כותרת:</h4>
            <input
              type="text"
              className="border-black border-2"
              value={name}
              onChange={handleNameChange}
            />
          </label>

          <br />
          <label>
            <h4>בחר צבע:</h4>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                flexWrap: "wrap",
              }}
            >
              {colors.map((color, index) => (
                <div
                  key={index}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    margin: "10px",
                    cursor: "pointer",
                    border:
                      selectedColor === color ? "2px solid black" : "none",
                  }}
                  onClick={() => handleColorClick(color)}
                ></div>
              ))}
            </div>
          </label>

          <br />
          <label>
            <h4>עובי העט:</h4>
            <input
              type="range"
              min="1"
              max="10"
              defaultValue={squareWidth}
              onChange={(e) => setSquareWidth(e.target.value)}
            />
          </label>

          <br />
          <div className="buttons">
            <button
              id="button"
              style={{ color: "#0a7cae", fontWeight: "600" }}
              onClick={handleSubmit}
            >
              הוסף נקודה חמה
            </button>
            <button
              id="button"
              style={{ color: "#0a7cae", fontWeight: "600" }}
              onClick={hci}
            >
              זיהוי אוביקטים
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotspotSettingPhotos;

const canvasStyle = {
  border: "1px solid #cccccc",
  marginTop: "10px",
  cursor: "crosshair",
};
