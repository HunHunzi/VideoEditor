import React from "react";
import { Card } from "antd";
import IndexPage from "./pages/IndexPage";
import "./App.css";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100Vh",
        width: "100vw",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IndexPage />
    </div>
  );
}

export default App;
