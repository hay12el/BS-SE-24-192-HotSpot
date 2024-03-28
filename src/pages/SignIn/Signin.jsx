import React from "react";
import { useState, useEffect } from "react";
import "./signin.css";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import LOGO from '../../assets/images/logo-removebg-preview1.png'
import { addDoc, collection, doc, setDoc } from "firebase/firestore";

const Signin = () => {
  const navigate = useNavigate();
  const usersCollectionRef = collection(db, "users");

  // chacks if the user is authenticated, if he is, navigates to homePage.
  useEffect(() => {
    if (localStorage.getItem("token") !== null) {
      navigate("/");
    }
  }, []);

  const [details, setDetails] = useState({
    userName: undefined,
    email: undefined,
    classname: undefined,
    password: undefined,
    confirmPassword: undefined,
  });

  const [errors, setErrors] = useState({
    userName: null,
    email: null,
    password: null,
    confirmPassword: null,
  });

  const handleCange = (e) => {
    setErrors((prev) => ({
      ...prev,
      [e.target.id]: null,
    }));

    setDetails((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const validationSchema = yup.object().shape({
    userName: yup
      .string()
      .required("הכנס/י שם")
      .min(3, "לא מספיק אותיות בשם!")
      .matches(/(\s)/, "הכנס שם מלא"),
    email: yup.string().email("אימייל לא חוקי").required("Required"),
    // bDate: yup.required("Required"),
    password: yup
      .string()
      .min(6, "סיסמא חייבת להכיל 6 תוים לפחות")
      .required("הכנס סיסמא"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "אימות סיסמא אינו תואם")
      .required("הכנס אימות סיסמא"),
  });

  const handleSubmit = async (e) => {
    setErrors({
      userName: null,
      email: null,
      password: null,
      confirmPassword: null,
    });

    await validationSchema
      .validate(details, { abortEarly: false })
      .then(async () => {
        try {
          const result = await createUserWithEmailAndPassword(
            auth,
            details.email,
            details.password
          );
          console.log(result);

          const res = await setDoc(doc(db, "users", result.user.uid), {
            id: result.user.uid,
            name: details.userName,
            email: details.email,
            className: details.classname,
            avatar: "",
          });

          navigate("/");
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        err.inner.forEach((e) => {
          setErrors((prev) => ({
            ...prev,
            [e.path]: e.message,
          }));
        });
      });
  };

  return (
    <div className="containerBig">
      <div className="vv">
        <img src={LOGO} alt="logo" />
        <div className="inpC">
          <div className="upponLog">
            <p>הרשמה ראשונית</p>
          </div>
          <div className="inputBox">
            <input
              type="text"
              name="name"
              id="userName"
              dir="ltr"
              onChange={handleCange}
            />
            <label>שם מלא</label>
          </div>

          {errors.userName !== null && <p>{errors.userName}</p>}
          <div className="inputBox">
            <input
              type="email"
              name="email"
              id="email"
              onChange={handleCange}
            />
            <label>אימייל</label>
          </div>

          {errors.userName !== null && <p>{errors.userName}</p>}
          <div className="inputBox">
            <input
              type="text"
              name="classname"
              id="classname"
              onChange={handleCange}
            />
            <label>שם הכיתה</label>
          </div>

          <div className="inputBox">
            <input
              type="password"
              name="password"
              id="password"
              dir="ltr"
              onChange={handleCange}
            />
            <label>סיסמא</label>
          </div>

          {errors.password !== null && <p>{errors.password}</p>}
          <div className="inputBox">
            <input
              type="password"
              name="confirmPassword"
              dir="ltr"
              id="confirmPassword"
              onChange={handleCange}
            />
            <label>אישור סיסמא</label>
          </div>
          {errors.confirmPassword !== null && <p>{errors.confirmPassword}</p>}
          <button className="confirmBtn" type="submit" onClick={handleSubmit}>
            הירשם
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signin;
