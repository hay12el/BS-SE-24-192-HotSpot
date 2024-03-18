import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "../pages/Home/Home";
import Login from "../pages/login/Login";
import Singin from "../pages/SignIn/Signin";
import { AuthProvider } from "../context/AuthContext";
import { CheckAuth } from "../hooks/hooks";
import Gallery from "../pages/gallery/Gallery";
import AddPhoto from "../pages/AddPhoto/AddPhoto";
import MyStudents from "../pages/MyStudents/MyStudents";
import Error from "../pages/error/Error";
import EditPhoto from "../pages/EditPhoto/EditPhoto";
import EditVideo from "../pages/EditVideo/EditVideo";
import NewStudent from "../pages/newStudent/NewStudent";
import ViewVideo from "../pages/ViewVideo/ViewVideo";
import { ObjectDetector } from "../components/objectDetector";

function MainRouter() {
  return (
    <Routes>
      <Route exact path="/login" element={<Login />} />
      <Route path="/signin" element={<Singin />} />
      {/* <PrivateRouter /> */}
      <Route path="/" element={<Home />} />
      <Route path="/myGallery/:id" element={<Gallery />} />
      <Route path="addphoto/:studentid" element={<AddPhoto />} />
      <Route path="myStudents" element={<MyStudents />} />
      <Route path="editphoto/:photoid/:studentid" element={<EditPhoto />} />
      <Route path="editvideo/:photoid/:studentid" element={<EditVideo />} />
      <Route path="newstudent" element={<NewStudent />} />
      <Route path="viewvideo/:videoid/:studentid" element={<ViewVideo />} />
      <Route path="objectDetection" element={<ObjectDetector />} />
      <Route path="*" element={<Error />} />
    </Routes>
  );
}

export default MainRouter;
