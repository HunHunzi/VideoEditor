import React, { useEffect, useRef } from "react";
import { useVideoContext } from "../../store/videoContext";
import CommonPlayer from "../CommonPlayer";

const VideoArea: React.FC = () => {
  const videoList = [];

  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      style={{
        width: 1200,
        height: 715,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CommonPlayer ref={videoRef} />
    </div>
  );
};

export default VideoArea;
