import React from "react";
import VideoArea from "../components/VideoArea";
import ControllerArea from "../components/ControllerArea";
import TrackArea from "../components/TracksArea";
import { VideoProvider } from "../store/videoContext";

const IndexPage = () => {
  return (
    <VideoProvider>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          justifyContent: "center",
          width: "100%",
          height: "90%",
          marginLeft: "60px",
        }}
      >
        <h2>智能多媒体视频播放器</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flex: 2,
          }}
        >
          <div
            style={{
              flex: 1,
              border: "1px solid #e8e1e1",
              margin: "10px",
              borderRadius: "6px",
              height: "450px",
            }}
          >
            <VideoArea />
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: "6px",
              margin: "10px",
              height: "450px",
            }}
          >
            <ControllerArea />
          </div>
        </div>
        <div
          style={{
            flex: 1,

            border: "1px solid #e8e1e1",
            margin: "10px",
          }}
        >
          <TrackArea />
        </div>
      </div>
    </VideoProvider>
  );
};

export default IndexPage;
