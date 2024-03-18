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

      //getVideos
      const photoQuery = query(
        collection(db, `users/${userID}/students/${studentID}/videos`),
        where("id", "==", photoId)
      );
      const v = await getDocs(photoQuery);
      SetVideo(v.docs[0].data());
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
    </div>
  );
}

export default EditVideo;
