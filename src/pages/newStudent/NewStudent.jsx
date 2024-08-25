import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./NewStudent.css";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { db, storage } from "../../firebase";
import { CheckAuth } from "../../hooks/hooks";

function NewStudent() {
  const [details, setDetails] = useState({
    firstName: "",
    lastName: "",
    profilePic: "",
  });
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const isLogIn = CheckAuth();

  useEffect(() => {
    if (!isLogIn) {
      navigate("/login");
    }
  }, []);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };
  const handleNameChange = (e) => {
    setDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async () => {
    var userID = currentUser.uid;
    const newUUID = uuidv4();

    if (file) {
      const storageRef = ref(storage, "images/" + details.firstName);
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
            addDoc(collection(db, `/users/${userID}/students`), {
              name: `${details.firstName} ${details.lastName}`,
              id: newUUID,
              avatar: downloadUrl,
            });
          });
          alert("סטודנט נוסף בהצלחה");
          setTimeout(() => {
            navigate(`/mystudents`);
          }, 1000);
        }
      );
    } else {
      await addDoc(collection(db, `/users/${userID}/students`), {
        name: `${details.firstName} ${details.lastName}`,
        id: newUUID,
        avatar: null,
      });
      alert("סטודנט נוסף בהצלחה");
      setTimeout(() => {
        navigate(`/mystudents`);
      }, 1000);
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
      <ul className="form-style-1">
        <li>
          <label>
            שם מלא <span className="required">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            className="field-divided"
            placeholder="שם פרטי"
            onChange={handleNameChange}
          />{" "}
          <input
            type="text"
            name="lastName"
            className="field-divided"
            placeholder="שם משפחה"
            onChange={handleNameChange}
          />
        </li>
        <li>
          <label>תמונת פרופיל</label>
          <input
            type="file"
            name="field3"
            className="field-long"
            onChange={handleFileUpload}
          />
        </li>
        <li>
          <button id="button" onClick={() => submit()}>
            הוספת סטודנט
          </button>
        </li>
      </ul>
    </div>
  );
}

export default NewStudent;
