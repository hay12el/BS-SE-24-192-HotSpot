import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import VideoComponent from "../../components/video/VideoComponent";

function EditVideo() {
  const [video, SetVideo] = useState(null);
  const [videos, SetVideos] = useState(null);
  const [videoObject, SetvideoObject] = useState(null);
  const [hotspots, setHotspots] = useState(null);
  const params = useParams();
  const { currentUser } = useAuth();

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (videos != null) {
      console.log("fetch ", videos);
      fetch(videos.videoUri)
        .then((response) => response.blob())
        .then((blob) => {
          const videoObjectURL = URL.createObjectURL(blob);
          console.log(videoObjectURL);
          SetVideo(videoObjectURL);
          console.log("video: ", video);
        })
        .catch((error) => console.log(error));
    }
  }, [videos]);

  const getData = async () => {
    try {
      var userID = currentUser.uid;
      const studentID = params.studentid;
      const photoId = params.photoid;

      // get hotspots
      const HotspotDocRef = query(
        collection(
          db,
          `users/${userID}/students/${params.studentid}/videos/${photoId}/hotspots`
        )
      );

      // get video's hotspots
      const HotSpotsDocs = await getDocs(HotspotDocRef);
      const Hotspots = HotSpotsDocs.docs.map((h) => h.data());
      setHotspots(Hotspots);

      //getVideos
      const photoQuery = query(
        collection(db, `users/${userID}/students/${studentID}/videos`),
        where("id", "==", photoId)
      );
      // const videoRef = ref(db, `users/${userID}/students/${studentID}/videos/${photoId}`)
      const v = await getDocs(photoQuery);
      SetVideos(v.docs[0].data());
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
      {video && (
        <VideoComponent
          videoUrl={video}
          title={videos.title}
          hotspots={hotspots}
        />
      )}
    </div>
  );
}

export default EditVideo;
