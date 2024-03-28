import React from "react";
import { useEffect } from "react";
import "./loader.css";

function Loader({ show }) {
  return (
    <div className="loaderCont" style={{display: show ? 'flex': 'none'}}>
      {show && (
        <>
          <div className="loader" />
        </>
      )}
    </div>
  );
}

export default Loader;
