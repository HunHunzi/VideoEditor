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
        height: "95Vh",
        width: "95vw",
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <IndexPage />
    </div>
  );
}

export default App;
