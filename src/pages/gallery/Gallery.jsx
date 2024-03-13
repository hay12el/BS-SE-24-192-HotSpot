import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckAuth } from "../../hooks/hooks";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import "./Gallery.css";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

function Gallery() {
  const navigate = useNavigate();
  const isLogIn = CheckAuth();
  const [videos, setVideos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const { currentUser } = useAuth();
  const params = useParams();
  const studentID = params.id;

  useEffect(() => {
    if (!isLogIn) {
      navigate("/login");
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    var userID = currentUser.uid;

    //getVideos
    const studentQuery = query(
      collection(db, `users/${userID}/students/${studentID}/videos`)
    );
    const theVideosDocs = await getDocs(studentQuery);

    const theVideos = theVideosDocs.docs.map((v) => v.data());
    setVideos(theVideos);

    //getPhotos
    const photosQ = query(
      collection(db, `users/${userID}/students/${studentID}/photos`)
    );
    const thePhotosDocs = await getDocs(photosQ);

    const thePhotos = thePhotosDocs.docs.map((p) => p.data());
    setPhotos(thePhotos);
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
      <div className="buttons">
        <button id="button" onClick={() => navigate(`/addphoto/${studentID}`)}>
          הוסף תמונה או סרטון
        </button>
      </div>
      <div>
        <h1>סרטונים</h1>

        <div className="gallaryContainer">
          {videos.map((v, i) => {
            return (
              <div className="vv" key={i}>
                <div className="gallery">
                  <video
                    src={v.videoUri}
                    style={{
                      height: "100%",
                      borderTopLeftRadius: "15px",
                      borderTopRightRadius: "15px",
                    }}
                  ></video>
                  <div className="desc">{v.title}</div>
                </div>

                <div className="buttons buttons_under">
                  <button
                    id="button"
                    onClick={() => navigate(`/editvideo/${v.id}/${studentID}`)}
                  >
                    ערוך נקודות חמות
                  </button>
                  <button
                    id="button"
                    onClick={() => navigate(`/ViewVideo/${v.id}/${studentID}`)}
                  >
                    צפה בסרטון
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ marginBottom: "100px" }}>
        <h1>תמונות</h1>
        <div className="gallaryContainer">
          {photos.map((p, i) => {
            return (
              <Link className="gallery" to={`/editphoto/${p.id}/${studentID}`} key={i}>
                <div className="gallery">
                  <img src={p.fileUri} alt="" />
                  <div className="desc">{p.title}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Gallery;
