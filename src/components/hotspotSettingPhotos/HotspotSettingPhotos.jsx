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

function HotspotSettingPhotos({ capturedImage, canvasRef, setHotspot }) {
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [name, setName] = useState("");
  const [hotspotColor, setHotspotColor] = useState("red");
  const recordedChunks = useRef([]);
  const [squares, setSquares] = useState([]);
  const [squareWidth, setSquareWidth] = useState(30);
  const { currentUser } = useAuth();
  const [dataUri, setDataUri] = useState(null);
  const params = useParams();
  const [O_DETECTION, setO_DETECTION] = useState(false);
  const [pred, setPred] = useState(null);

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
            `/users/${userID}/students/${studentid}/photos/${photoid}/hotspots`,
            newUUID
          ),
          {
            color: selectedColor,
            itemClickCount: 0,
            success: 0,
            points: recordedChunks.current,
            title: name,
            id: newUUID,
          }
        );
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
    // setCapturedImage(null);
    // setVerticalLines([...verticalLines, (pausedTime / totalTime) * 610]);
    setSquareWidth(30);
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

  const redrawSquares = (context) => {
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // handleCaptureImage(capturedImage);
    context.globalAlpha = 0.3;
    context.fillStyle = hotspotColor;

    recordedChunks.current.forEach((square) => {
      context.fillRect(square.x - 15, square.y - 15, squareWidth, squareWidth);
    });
  };

  const handlePredictClick = (pred) => {
    alert("האם תרצה/י לשמור את האוביקט כנקודה חמה?")
  }

  const handleCanvasDraw = (event) => {
    const canvasElement = canvasRef.current;
    const context = canvasElement.getContext("2d");
    const rect = canvasElement.getBoundingClientRect();

    const x = Math.floor(
      ((event.clientX - rect.left) / canvasElement.width) * 100
    );
    const y = Math.floor(
      ((event.clientY - rect.top) / canvasElement.height) * 100
    );
    console.log("x: ", x, " y: ", y);

    recordedChunks.current.push({ x: x, y: y, width: squareWidth });

    console.log((x * canvasElement.width) / 100);
    console.log((y * canvasElement.height) / 100);

    // // Draw the square on the canvas
    context.globalAlpha = 0.3;
    context.fillStyle = hotspotColor;

    // squares.forEach((square) => {
    //   context.fillRect(square.x, square.y, squareWidth, squareWidth);
    // });

    context.fillRect(
      (x * canvasElement.width) / 100 - squareWidth / 2,
      (y * canvasElement.height) / 100 - squareWidth / 2,
      squareWidth,
      squareWidth
    );
  };
  return (
    <div className="HotspotSettingContaner">
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
          <label>
            <h4>עובי הריבוע:</h4>
            <input
              type="range"
              min="5"
              max="70"
              defaultValue={squareWidth}
              onChange={(e) => setSquareWidth(e.target.value)}
            />
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
};
