import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import HotspotSettingPhotos from "../../components/hotspotSettingPhotos/HotspotSettingPhotos";
import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";

function EditPhoto() {
  const [image, SetImage] = useState(null);
  const params = useParams();
  const { currentUser } = useAuth();
  const canvasRef = useRef();
  const imgRef = useRef();
  const [hotspot, setHotspot] = useState(false);
  const [HotSpots, setHotspots] = useState(null);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const isiPad = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    return /ipad/.test(userAgent);
  };

  useEffect(() => {
    getData();
    disableBodyScroll(containerRef);

    return () => {
      clearAllBodyScrollLocks();
    };
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

      const HotspotDocRef = query(
        collection(
          db,
          `users/${userID}/students/${params.studentid}/photos/${photoId}/hotspots`
        )
      );

      // get video's hotspots
      const HotSpotsDocs = await getDocs(HotspotDocRef);
      const Hotspots = HotSpotsDocs.docs.map((h) => h.data());
      setHotspots(Hotspots);
      const photo = await getDocs(photoQuery);
      SetImage(photo.docs[0].data());
    } catch (error) {
      console.log(error);
    }
  };
  const handleCaptureImage = () => {
    try {
      const canvasElement = canvasRef.current;
      const screenWidth = window.screen.width;

      console.log(screenWidth);

      // setHotspot(true);
      if (screenWidth > 600) {
        canvasElement.width = screenWidth * (9/10);
        canvasElement.height =
          canvasElement.width * (imgRef.current.height / imgRef.current.width);
      } else {
        canvasElement.width = screenWidth - 20;
        canvasElement.height =
          canvasElement.width * (imgRef.current.height / imgRef.current.width);
      }
      // canvasElement.width = imgRef.current.width;
      // canvasElement.height = imgRef.current.height;

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

  const deleteHotspot = async (elementId) => {
    try {
      if (window.confirm("האם למחוק את הנקודה החמה הזו?")) {
        var userID = currentUser.uid;
        const studentID = params.studentid;
        const photoId = params.photoid;

        const HotspotDocRef = doc(
          db,
          `users/${userID}/students/${studentID}/photos/${photoId}/hotspots/${elementId}`
        );

        await deleteDoc(HotspotDocRef);

        const HotspotsDocRef = query(
          collection(
            db,
            `users/${userID}/students/${studentID}/photos/${photoId}/hotspots`
          )
        );

        // get photo's hotspots
        const HotSpotsDocs = await getDocs(HotspotsDocRef);
        const Hotspots = HotSpotsDocs.docs.map((h) => h.data());
        setHotspots(Hotspots);
      }
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div
      ref={containerRef}
      style={{
        height: "100vh",
        width: "100%",
        paddingTop: "100px",
        display: "flex",
        direction: "rtl",
        flexDirection: "row",
        paddingRight: "30px",
        paddingLeft: "30px",
        position: "relative",
        justifyContent: "space-around"
      }}
    >
      <div className="backB" style={{top:70, right: 10}}>
        <button id="button" onClick={() => navigate(-1)}>
          חזרה לגלריה <span className="glyphicon glyphicon-arrow-left" />
        </button>
      </div>
      {image && (
        <div className="videoContainer">
          <div
            className="videoContainer"
            style={{ display: hotspot ? "none" : "flex" }}
          >
            <img
              src={image.fileUri}
              alt=""
              ref={imgRef}
              style={{ maxHeight: "60vh", maxWidth: "80vw", minWidth: "80vh" }}
            />
            <div className="buttons">
              <button id="button" onClick={handleCaptureImage}>
                הוספת נקודה חמה
              </button>
            </div>
          </div>
          <div style={{ display: !hotspot ? "none" : "flex" }}>
            <HotspotSettingPhotos
              capturedImage={image.fileUri}
              canvasRef={canvasRef}
              setHotspot={setHotspot}
              imgRef={imgRef}
            />
          </div>
        </div>
      )}
      {HotSpots && (
        <table style={{height:"min-content"}}>
          <tr>
            <th style={headerStyle}>זמן הצגת הנקודות</th>
            <th style={headerStyle}>מחיקת הנקודות החמות</th>
          </tr>
          {HotSpots.map((h, key) => {
            return (
              <tr>
                <td style={{ cursor: "default" }}>
                  <h4>{h.title}</h4>
                </td>
                <td style={{ cursor: "default" }}>
                  <span
                    class="glyphicon glyphicon-trash"
                    onClick={() => deleteHotspot(h.id)}
                    style={{
                      color: "red",
                      cursor: "pointer",
                    }}
                  ></span>
                </td>
              </tr>
            );
          })}
        </table>
      )}
    </div>
  );
}

export default EditPhoto;

const headerStyle = {
  paddingLeft: "7px",
  paddingRight: "7px",
  textAlign: "center",
  direction: "rtl",
};
