import logo from "./logo.svg";
import "./App.css";
import styled from "styled-components";
import { ObjectDetector } from "./components/objectDetector";
import Login from "./pages/login/Login";
import MainRouter from "./router/mainRouter";
import NavBar from "./components/navBar/NavBar";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #1c2127;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
`;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <MainRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
