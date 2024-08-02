import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckAuth } from "../../hooks/hooks";
import { useAuth } from "../../context/AuthContext";
import { db, storage } from "../../firebase";
import "./Gallery.css";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";

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

  const deleteItem = async (type, itemId, url) => {
    console.log(itemId, url);
    if (window.confirm("האם למחוק את האוביקט המבוקש?")) {
      let path;
      const start = url.indexOf("%2F") + 3;
      const end = url.indexOf("?");
      var userID = currentUser.uid;

      if (start !== -1 && end !== -1 && start < end) {
        path = url.substring(start, end);
        path = decodeURIComponent(path);
        console.log(path);
      }

      try {
        if (type == "videos") {
          const storageRef = ref(storage, type + "/" + path);
          const docRef = doc(
            db,
            `/users/${userID}/students/${studentID}/${type}`,
            itemId
          );
          await deleteObject(storageRef);
          await deleteDoc(docRef);
        } else {
          // Photos
          const storageRef = ref(storage, type + "/" + path);
          const docRef = doc(
            db,
            `/users/${userID}/students/${studentID}/photos`,
            itemId
          );
          await deleteObject(storageRef);
          await deleteDoc(docRef);
        }
        alert("האויביקט נמחק בהצלחה");
        window.location.reload(true);
      } catch (error) {
        window.location.reload(true);
        alert(error.message);
      }
    }
  };

  return (
    <div
      style={{
        width: "100%",
        paddingTop: "100px",
        direction: "rtl",
        paddingRight: "30px",
        paddingLeft: "30px",
      }}
      className="galleryCont"
    >
      <div className="backB">
        <button
          id="button"
          onClick={() => navigate(-1)}
          style={{ direction: "ltr" }}
        >
          <span className="glyphicon glyphicon-arrow-left" /> חזרה לרשימת
          הסטודנטים
        </button>
      </div>
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
              <div className="hh" key={i}>
                <div className="gallery">
                  <video
                    src={v.videoUri}
                    style={{
                      height: "100%",
                      maxHeight: "150px",
                      borderTopLeftRadius: "8px",
                      borderTopRightRadius: "8px",
                    }}
                    controls={false}
                  ></video>
                  <div className="desc" style={{ position: "relative" }}>
                    <span
                      class="glyphicon glyphicon-trash"
                      onClick={() => deleteItem("videos", v.id, v.videoUri)}
                      style={{
                        position: "absolute",
                        top: 15,
                        right: 15,
                        color: "red",
                        cursor: "pointer",
                      }}
                    ></span>
                    {v.title}
                  </div>
                </div>

                <div className="buttons buttons_under">
                  <button
                    id="button"
                    onClick={() => navigate(`/editvideo/${v.id}/${studentID}`)}
                  >
                    ערוך סרטון
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
      <div style={{ paddingBottom: "50px" }}>
        <h1>תמונות</h1>
        <div className="gallaryContainer">
          {photos.map((p, i) => {
            return (
              <div className="hh" key={i}>
                <div className="gallery">
                  <img
                    style={{ borderRadius: "10px" }}
                    src={p.fileUri}
                    alt=""
                  />
                  <div className="desc" style={{ position: "relative" }}>
                    <span
                      class="glyphicon glyphicon-trash"
                      onClick={() => deleteItem("images", p.id, p.fileUri)}
                      style={{
                        position: "absolute",
                        top: 15,
                        right: 15,
                        color: "red",
                        cursor: "pointer",
                      }}
                    ></span>
                    {p.title}
                  </div>
                </div>

                <div className="buttons buttons_under">
                  <button
                    id="button"
                    onClick={() => navigate(`/editphoto/${p.id}/${studentID}`)}
                  >
                    ערוך תמונה
                  </button>
                  <button
                    id="button"
                    onClick={() => navigate(`/ViewPhoto/${p.id}/${studentID}`)}
                  >
                    צפה בתמונה
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Gallery;
