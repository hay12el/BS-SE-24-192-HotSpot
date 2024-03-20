import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import HotspotSetting from "../../components/hotspotSetting/HotspotSetting";

function EditPhoto() {
  const [image, SetImage] = useState(null);
  const params = useParams();
  const { currentUser } = useAuth();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      var userID = currentUser.uid;
      const studentID = params.studentid;
      const photoId = params.photoid;
      //getVideos
      const photoQuery = query(
        collection(db, `users/${userID}/students/${studentID}/photos`),
        where("id", "==", photoId)
      );
      const photo = await getDocs(photoQuery);
      SetImage(photo.docs[0].data());
      console.log(image);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        paddingTop: "100px",
        direction: "rtl",
        paddingRight: "30px",
        paddingLeft: "30px",
      }}
    >
      {image && (
        <div className="videoContainer">
          <div
            className="videoContainer"
            //  style={{ display: hotspot ? "none" : "flex" }}
            style={{ display: "flex" }}
          >
            <img src={image.fileUri} alt="" style={{ width: "80%" }} />
            {/* Added line */}
            <div className="buttons">
              {/* <button id="button" onClick={handlePlayPause}>
             Play/Pause
           </button>
           <button id="button" onClick={handleStop}>
             Stop
           </button> */}
              <button id="button">הופסת נקודה חמה</button>
            </div>
          </div>
          {/* <div style={{ display: !hotspot ? "none" : "flex" }}>
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
       </div> */}
        </div>
      )}
      {/* <div className="settingsContainer">
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
      </div> */}
    </div>
  );
}

export default EditPhoto;
