import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import HotspotSetting from "../../components/hotspotSetting/HotspotSetting";
import VideoComponent from "../../components/video/VideoComponent";

function EditVideo() {
  const [video, SetVideo] = useState(null);
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
      console.log(photoId);
      console.log(studentID);
      //getVideos
      const photoQuery = query(
        collection(db, `users/${userID}/students/${studentID}/videos`),
        where("id", "==", photoId)
      );
      const v = await getDocs(photoQuery);
      SetVideo(v.docs[0].data());
      console.log(video);
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

      {video && <VideoComponent videoUrl={video.videoUri} />}
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

export default EditVideo;
