import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import HotspotSettingPhotos from "../../components/hotspotSettingPhotos/HotspotSettingPhotos";

function EditPhoto() {
  const [image, SetImage] = useState(null);
  const params = useParams();
  const { currentUser } = useAuth();
  const canvasRef = useRef();
  const imgRef = useRef();
  const [hotspot, setHotspot] = useState(false);
  const navigate = useNavigate()

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
    } catch (error) {
      console.log(error);
    }
  };
  const handleCaptureImage = () => {
    try {
      const canvasElement = canvasRef.current;
      // setHotspot(true);
      canvasElement.width = imgRef.current.width;
      canvasElement.height = imgRef.current.height;

      const context = canvasElement.getContext("2d");
      context.drawImage(
        imgRef.current,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );
      setHotspot(true);
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
        position: "relative"
      }}
    >
      <div className="backB">
        <button id="button" onClick={() => navigate(-1)}>
        <span className="glyphicon glyphicon-arrow-left"/> חזרה לגלריה
        </button>
      </div>
      {image && (
        <div className="videoContainer">
          <div
            className="videoContainer"
             style={{ display: hotspot ? "none" : "flex" }}
            // style={{ display: "flex" }}
          >
            <img
              src={image.fileUri}
              alt=""
              ref={imgRef}
              style={{ width: "80%" }}
            />
            {/* Added line */}
            <div className="buttons">
              {/* <button id="button" onClick={handlePlayPause}>
             Play/Pause
           </button>
           <button id="button" onClick={handleStop}>
             Stop
           </button> */}
              <button id="button" onClick={handleCaptureImage}>
                הופסת נקודה חמה
              </button>
            </div>
          </div>
          <div style={{ display: !hotspot ? "none" : "flex" }}>
            {/* <div> */}
            <HotspotSettingPhotos
              capturedImage={image.fileUri}
              canvasRef={canvasRef}
              setHotspot={setHotspot}
            />
          </div>
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
