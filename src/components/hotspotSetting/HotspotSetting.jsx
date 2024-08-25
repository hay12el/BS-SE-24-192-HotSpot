import React, { useState, useRef, useEffect } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import PENCIL from "../../assets/images/pencil.png";
import { ObjectDetector } from "../objectDetector/index";

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
  HotSpots,
  setHotSpotsParent,
  title,
}) {
  const [selectedColor, setSelectedColor] = useState("red");
  const [name, setName] = useState("");
  const recordedChunks = useRef([]);
  const [squareWidth, setSquareWidth] = useState(3);
  const { currentUser } = useAuth();
  const params = useParams();
  const [O_DETECTION, setO_DETECTION] = useState(false);
  const [pred, setPred] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const isDrawing = useRef(false);
  const pointsRef = useRef([]);
  const [addToPhotos, setAddToPhotos] = useState(false);
  const colors = ["red", "blue", "green", "yellow", "orange", "purple"];
  let startX = 0;
  let startY = 0;

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleHotAdd = () => {
    try {
      // Implement your logic to handle the submitted data (color and name)
      const canvasElement = canvasRef.current;

      // normalize the points, the values will be in range 0-100
      const pointsForSub = pointsRef.current.map((p) => ({
        x: (p.x / canvasElement.width) * 100,
        y: (p.y / canvasElement.height) * 100,
      }));

      if (name == "") {
        alert("הכנס את שם הנקודה");
      } else {
        const newUUID = uuidv4();
        const newPoint = {
          color: selectedColor,
          itemClickCount: 0,
          success: 0,
          points: pointsForSub,
          lineWidth: squareWidth,
          title: name,
          id: newUUID,
        };
        setHotspots([...hotspots, newPoint]);
        setName("");
        setTimeout(() => {
          recordedChunks.current = [];
        }, 500);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = (afterAdding = false) => {
    if (afterAdding) {
      recordedChunks.current = [];
      setName("");
      setHotspot(false);
      setCapturedImage(null);
      setVerticalLines([...verticalLines, (pausedTime / totalTime) * 610]);
      setSquareWidth(3);
      setSelectedColor("red");
      isDrawing.current = false;
      setHotspots([]);
    } else {
      if (window.confirm("האם לצאת ללא שמירת שמירת הנקודות החמות?") == true) {
        recordedChunks.current = [];
        setName("");
        setHotspot(false);
        setCapturedImage(null);
        setVerticalLines([...verticalLines, (pausedTime / totalTime) * 610]);
        setSquareWidth(3);
        isDrawing.current = false;
        setSelectedColor("red");
        setHotspots([]);
      }
    }
  };

  const hci = () => {
    const canvasElement = canvasRef.current;

    setCapturedImage(canvasElement.toDataURL());
    // const imageBlob = canvasElement.toDataURL("image/png");
    setO_DETECTION(true);
  };

  const handlePredictClick = (pred) => {
    alert("האם תרצה/י לשמור את האוביקט כנקודה חמה?");
  };

  const hundleAddHotspots = async () => {
    try {
      if (hotspots.length === 0) {
        alert("לא נוספו נקודות חמות");
      } else {
        var userID = currentUser.uid;
        const { photoid, studentid } = params;
        const newUUID = uuidv4();
        await setDoc(
          doc(
            db,
            `/users/${userID}/students/${studentid}/videos/${photoid}/hotspots`,
            newUUID
          ),
          {
            timestamp: pausedTime,
            id: newUUID,
            hotspots: hotspots,
          }
        );
        setHotSpotsParent([
          ...HotSpots,
          {
            timestamp: pausedTime,
            id: newUUID,
            hotspots: hotspots,
          },
        ]);

        if (addToPhotos) {
          uploadCapturedImage();
        }

        alert("הנקודה החמה נוספה בהצלחה");
        handleClose(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const uploadCapturedImage = async () => {
    try {
      var userID = currentUser.uid;
      const { studentid } = params;
      const canvasElement = canvasRef.current;
      const context = canvasElement.getContext("2d");
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      handleCaptureImage(capturedImage);

      const dataURL = canvasElement.toDataURL("image/png");

      const blob = await fetch(dataURL).then((res) => res.blob());

      // Create a reference to the storage location
      const imageRef = ref(storage, `images/${title} .png`);

      // Upload the Blob
      const snapshot = await uploadBytes(imageRef, blob);

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      const newUUID = uuidv4();
      await setDoc(
        doc(db, `/users/${userID}/students/${studentid}/photos`, newUUID),
        {
          fileUri: downloadURL,
          title: title,
          allClickCount: 0,
          outsideClickCount: 0,
          id: newUUID,
        }
      );

      // add hotspots

      const batch = [];

      // Reference to the collection
      const collectionRef = collection(
        db,
        `/users/${userID}/students/${studentid}/photos/${newUUID}/hotspots`
      );

      for (const docData of hotspots) {
        // Create a promise for each document addition
        const docRef = doc(collectionRef, docData.id);

        // Create a promise for each document addition
        const promise = setDoc(docRef, docData);
        batch.push(promise);
      }

      // Wait for all documents to be added
      await Promise.all(batch);
      alert("התמונה נוספה בהצלחה");
    } catch (error) {
      alert("error while uploading the omage: ", error);
    }
  };

  const startDrawing = ({ nativeEvent }) => {
    nativeEvent.preventDefault();
    pointsRef.current = [];
    const canvasElement = canvasRef.current;
    const context = canvasElement.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    handleCaptureImage(capturedImage);

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
    if (x1 == 0 && y1 == 0) {
      context.moveTo(x2, y2);
    } else {
      context.moveTo(x1, y1);
    }
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

    const context = canvasRef.current.getContext("2d");
    // Connect the last point to the first
    const firstPoint = pointsRef.current[0];
    drawLine(context, startX, startY, firstPoint.x, firstPoint.y);
    isDrawing.current = false;
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
    <div className="bg-white pt-16 rounded-xl relative">
      <span
        onClick={() => handleClose(false)}
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
          capturedImage={capturedImage}
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
          alignItems: "center",
        }}
      >
        <div className="flex flex-col items-center h-full content-around gap-4">
          <div className="pointsName">
            {hotspots.map((h) => {
              return <div className="hname">{h.title}</div>;
            })}
          </div>
          <canvas
            ref={canvasRef}
            style={canvasStyle}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={autoComplete}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={autoComplete}
          ></canvas>
          <button id="button" onClick={hundleAddHotspots}>
            הוסף נקודות חמות
          </button>
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
            <div className="flex content-start flex-wrap">
              {colors.map((color, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: color,
                    border:
                      selectedColor === color ? "2px solid black" : "none",
                  }}
                  className="m-3 h-16 w-16 cursor-pointer rounded-full"
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
              onClick={handleHotAdd}
            >
              הוסף נקודה לרשימה
            </button>
            <button
              id="button"
              style={{ color: "#0a7cae", fontWeight: "600" }}
              onClick={hci}
            >
              זיהוי אוביקטים
            </button>
            <div className="flex justify-center">
              <label className="text-md text-sky-600" htmlFor="addToPhotos">
                הוסף לתמונות הסטטיות
              </label>
              <input
                type="checkbox"
                name="AddToPhotos"
                id="AddToPhotos"
                defaultChecked={addToPhotos}
                onChange={() => setAddToPhotos(!addToPhotos)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotspotSetting;

const canvasStyle = {
  border: "1px solid #cccccc",
  marginTop: "10px",
  cursor: "pointer",
};
