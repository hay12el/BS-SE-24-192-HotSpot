import React, { useEffect, useRef, useState } from "react";
import success1 from "../../assets/audio/success.mp3";
import error1 from "../../assets/audio/error.mp3";
import "./HotSpotPic.css";
import { doc, getDoc, query, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";

function HotSpotPic({
  hotspot,
  canvasRef,
  setHotspot,
  videoRef,
  hotspotIndicator,
}) {
  const success = new Audio(success1);
  const error = new Audio(error1);
  const [clicks, setClicks] = useState(hotspot.itemClickCount);
  const [successes, setSuccesses] = useState(hotspot.success);
  const { currentUser } = useAuth();
  const params = useParams();
  const [selectedOption, setSelectedOption] = useState(-1);
  const [selectedHotSpot, setSelectedHotSpot] = useState(null);
  const [hotspots, setHotspots] = useState(null);
  const [showLines, setShowLines] = useState(false);

  useEffect(() => {
    setClicks(hotspot.itemClickCount);
    setSuccesses(hotspot.success);
  }, [hotspotIndicator]);

  const handleCanvasTouch = (event) => {
    const canvasElement = canvasRef.current;
    const rect = canvasElement.getBoundingClientRect();
    const ctx = canvasElement.getContext("2d");

    if (selectedHotSpot != null) {
      const x = Math.floor(event.clientX - rect.left);
      const y = Math.floor(event.clientY - rect.top);

      var path = new Path2D();

      // Define the path based on the points of the hotspot
      path.moveTo(
        (selectedHotSpot.points[0].x / 100) * canvasElement.width,
        (selectedHotSpot.points[0].y / 100) * canvasElement.height
      );
      for (let i = 1; i < selectedHotSpot.points.length; i++) {
        path.lineTo(
          (selectedHotSpot.points[i].x / 100) * canvasElement.width,
          (selectedHotSpot.points[i].y / 100) * canvasElement.height
        );
      }
      path.closePath(); // Close the path

      setClicks(clicks + 1);
      if (ctx.isPointInPath(path, x, y, "evenodd")) {
        setSuccesses(successes + 1);
        success.play();
      } else {
        error.play();
      }
    } else {
      alert("נא לבחור נקודה חמה");
    }
  };

  const handleChange = (event, hotspot) => {
    setClicks(hotspot.itemClickCount);
    setSuccesses(hotspot.success);
    setSelectedHotSpot(hotspot);
    setSelectedOption(Number(event.target.id));
  };

  const handleSaveResults = async () => {
    try {
      const docRef = doc(
        db,
        `users/${currentUser.uid}/students/${params.studentid}/videos/${params.videoid}/hotspots/${hotspot.id}`
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        let data = docSnap.data();
        let hotspotArray = data.hotspots; // Get the array

        const indexToUpdate = hotspotArray.findIndex(
          (item) => item.id === selectedHotSpot.id
        );

        // Check if index is within bounds
        if (indexToUpdate >= 0 && indexToUpdate < hotspotArray.length) {
          // Update the specific element in the array
          hotspotArray[indexToUpdate] = {
            ...hotspotArray[indexToUpdate],
            success: successes,
            itemClickCount: clicks,
          };

          console.log(hotspotArray);

          // Update the document with the modified array
          await updateDoc(docRef, {
            ['hotspots']: hotspotArray,
          });

          console.log("Document successfully updated!");
        } else {
          console.log("Index out of range!");
        }
      } else {
        console.log("No such document!");
      }

      // selectedHotSpot.id

      // await updateDoc(docRef, { success: successes, itemClickCount: clicks });

      // const newArray = [...hotspots];
      // // Find the object you want to update (e.g., based on its ID)
      // const index = newArray.findIndex(
      //   (item) => item.id === selectedHotSpot.id
      // );
      // if (index !== -1) {
      //   // Update the property of the object
      //   newArray[index] = {
      //     ...newArray[index],
      //     success: successes,
      //     itemClickCount: clicks,
      //   };
      //   // Update the state with the new array
      //   setHotspots(newArray);
      // }
      alert("תוצאות נשמרו בהצלחה!");
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = async () => {
    try {
      setHotspot(false);
      if (videoRef) {
        videoRef.current.currentTime = Math.floor(hotspot.timestamp) + 1.5;
        videoRef.current.play();
      }
    } catch (error) {
      console.log(error);
      setHotspot(false);
      if (videoRef) {
        videoRef.current.currentTime = Math.floor(hotspot.timestamp) + 1.5;
        videoRef.current.play();
      }
    }
  };

  const changeShowLine = () => {
    setShowLines(!showLines);
  };

  const removeLines = () => {
    console.log("remove");
    try {
      const videoElement = videoRef.current;
      const canvasElement = canvasRef.current;

      canvasElement.width = 640;
      canvasElement.height = 360;

      // console.log("videoElement.currentTime: ", videoElement.currentTime);
      // videoElement.currentTime = Math.floor(videoElement.currentTime);

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
    // const img = new Image();
    // img.src = photo.fileUri;
    // img.ref = imageRef;
    // const canvasElement = canvasRef.current;
    // const context = canvasElement.getContext("2d");
    // context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    // context.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
  };

  const redrawLines = () => {
    const canvasElement = canvasRef.current;
    const context = canvasElement.getContext("2d");

    for (const hot of hotspot.hotspots) {
      context.strokeStyle = hot.color;
      context.lineWidth = hot.lineWidth;
      for (let i = 1; i < hot.points.length; i++) {
        const startX = (hot.points[i - 1].x / 100) * canvasElement.width;
        const startY = (hot.points[i - 1].y / 100) * canvasElement.height;
        const endX = (hot.points[i].x / 100) * canvasElement.width;
        const endY = (hot.points[i].y / 100) * canvasElement.height;

        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
      }
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
      <div className="counters">
        <div className="rightCanv">
          <canvas
            ref={canvasRef}
            style={canvasStyle}
            onMouseDown={handleCanvasTouch}
          ></canvas>
          <button
            id="button"
            onClick={
              !showLines
                ? () => {
                    changeShowLine();
                    redrawLines();
                  }
                : () => {
                    changeShowLine();
                    removeLines();
                  }
            }
          >
            {!showLines ? "הצג סימונים" : "הסתר סימנים"}
          </button>
        </div>
        {hotspot && (
          <div
            className="videoContainercc"
            style={{ direction: "rtl", alignItems: "flex-start" }}
          >
            {hotspot.hotspots.map((h, key) => {
              return (
                <label
                  key={key}
                  htmlFor={key}
                  style={{ padding: 0 }}
                  className={selectedOption === key ? "selected" : "hotspotCo"}
                >
                  <div
                    className="hotspotCo"
                    style={{
                      background:
                        selectedOption === key ? "#edca87" : "#f7e5c4",
                      boxShadow:
                        selectedOption === key
                          ? ""
                          : "0 0 0.3em 0.2em rgba(0, 0, 0, 0.082);",
                    }}
                  >
                    <input
                      type="radio"
                      name="hotspotR"
                      id={key}
                      onChange={(e) => handleChange(e, h)}
                      style={{
                        position: "fixed",
                        opacity: 0,
                        pointerEvents: "none",
                      }}
                    />
                    <h2>{h.title}</h2>
                    {selectedOption === key && (
                      <button
                        id="button"
                        style={{ margin: "10px" }}
                        onClick={handleSaveResults}
                      >
                        שמור תוצאות
                      </button>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default HotSpotPic;

const canvasStyle = {
  border: "1px solid #cccccc",
  marginTop: "10px",
};
