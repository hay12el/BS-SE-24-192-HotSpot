import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckAuth } from "../../hooks/hooks";
import { useAuth } from "../../context/AuthContext";
import { useDropzone } from "react-dropzone";
import { db, storage } from "../../firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

function AddPhoto() {
  const navigate = useNavigate();
  const isLogIn = CheckAuth();
  const { currentUser } = useAuth();
  const [videoUrl, setVideoUrl] = useState(null);
  const [file, setFile] = useState(null);
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [name, setName] = useState("");
  const params = useParams();

  const studentid = params.studentid;

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFile(file);
    const videoObjectUrl = URL.createObjectURL(file);
    setVideoUrl(videoObjectUrl);
    console.log(videoObjectUrl);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    if (!isLogIn) {
      navigate("/login");
    }
  }, []);

  const uploadFileFunct = async () => {
    let type = file.type;
    var userID = currentUser.uid;
    const newUUID = uuidv4();

    if (name == "") {
      alert("הכנס שם קובץ!");
      return;
    }
    // VIEDO
    if (type.startsWith("video")) {
      const storageRef = ref(storage, "videos/" + file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            setDoc(
              doc(db, `/users/${userID}/students/${studentid}/videos`, newUUID),
              {
                videoUri: downloadUrl,
                allClickCount: 0,
                title: name,
                outsideClickCount: 0,
                id: newUUID,
              }
            );
            // addDoc(
            //   collection(db, `/users/${userID}/students/${studentid}/videos`),
            //   {
            //     videoUri: downloadUrl,
            //     allClickCount: 0,
            //     title: name,
            //     outsideClickCount: 0,
            //     id: newUUID,
            //   }
            // );
          });
          setTimeout(() => {
            navigate(`/mygallery/${studentid}`);
          }, 1000);
        }
      );
    }
    // IMAGE
    else if (type.startsWith("image")) {
      const storageRef = ref(storage, "images/" + file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("paused");
              break;
            case "running":
              console.log("running");
              break;
            default:
              break;
          }
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            setDoc(
              doc(db, `/users/${userID}/students/${studentid}/photos`, newUUID),
              {
                fileUri: downloadUrl,
                title: name,
                allClickCount: 0,
                outsideClickCount: 0,
                id: newUUID,
              }
            );
          });
          setTimeout(() => {
            navigate(`/mygallery/${studentid}`);
          }, 1000);
        }
      );
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        padding: "100px",
      }}
    >
      <div>
        <h1>העלאת תמונות וסירטונים</h1>
        <div>
          {videoUrl ? (
            file.type.startsWith("video") ? (
              <div className="videoContainer">
                <div className="videoContainer">
                  <video
                    id="videoPlayer"
                    ref={videoRef}
                    width="640"
                    height="360"
                    controls
                    onLoadedData={() => console.log("Video loaded")}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  <button onClick={() => uploadFileFunct()}>upload</button>
                  <input
                    type="text"
                    placeholder="שם הקובץ"
                    style={{ direction: "rtl", margin: "30px" }}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <progress value={progress} max={100}>
                    {progress}%
                  </progress>
                </div>
              </div>
            ) : (
              <div className="videoContainer">
                <div className="videoContainer">
                  <img src={videoUrl} alt="" />

                  <input
                    type="text"
                    placeholder="שם הקובץ"
                    style={{ direction: "rtl", margin: "30px" }}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <button onClick={() => uploadFileFunct()}>upload</button>
                  <progress value={progress} max={100}>
                    {progress}%
                  </progress>
                </div>
              </div>
            )
          ) : (
            <div {...getRootProps()} style={dropzoneStyle}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the video file here...</p>
              ) : (
                <p>Drag 'n' drop a video file here, or click to select one</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const dropzoneStyle = {
  border: "2px dashed #cccccc",
  borderRadius: "4px",
  padding: "20px",
  textAlign: "center",
  cursor: "pointer",
};

export default AddPhoto;
