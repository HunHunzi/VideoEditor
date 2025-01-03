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
          width: "95%",
          height: "100%",
        }}
      >
        <h2>智能多媒体视频播放器</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flex: 3,
          }}
        >
          <div
            style={{
              flex: 1,
              border: "1px solid #e8e1e1",
              margin: "10px",
              borderRadius: "6px",
            }}
          >
            <VideoArea />
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: "6px",
              margin: "10px",
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
