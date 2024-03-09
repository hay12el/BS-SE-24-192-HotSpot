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
      {image && <img src={image.fileUri} alt="" />}
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
