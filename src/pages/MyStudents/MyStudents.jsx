import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckAuth } from "../../hooks/hooks";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import "./MyStudents.css";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

function MyStudents() {
  const navigate = useNavigate();
  const isLogIn = CheckAuth();
  const [students, setStudents] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!isLogIn) {
      navigate("/login");
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    var userID = currentUser.uid;

    //subcollection
    const studentQuery = query(collection(db, `users/${userID}/students`));
    // const students = await getDocs(studentQuery);
    getDocs(studentQuery).then((students) => {
      const theStudents = students.docs.map((student) => student.data());

      setStudents(theStudents);
    });
  };
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        padding: "100px",
        direction: "rtl",
      }}
    >
      <div>
        <h1 style={{ marginBottom: "50px" }}>הסטודנטים שלי</h1>
        <div className="buttons">
          <button id="button" onClick={() => navigate(`/newstudent`)}>
            הוספת סטודנט חדש
          </button>
        </div>
        <div className="students">
          {students.map((s, i) => {
            return (
              <Link to={`/myGallery/${s.id}`} className="student" key={i}>
                <img src={s.avatar} alt="" className="avatar" />
                <h3>{s.name}</h3>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MyStudents;
