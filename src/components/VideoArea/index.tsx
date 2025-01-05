import React, { useRef } from "react";
import { useVideoContext } from "../../store/videoContext";

const VideoArea: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoList = [];
  const { context, setContext } = useVideoContext();

  const fixedWidth = "800px"; // 固定宽度
  const fixedHeight = "450px"; // 固定高度

  return (
    <div
      style={{
        position: "relative",
        width: fixedWidth,
        height: fixedHeight,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {videoList.length == 0 && !context.videoUrl ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          视频显示区, 待上传视频
        </div>
      ) : (
        <video
          id="video"
          ref={videoRef}
          crossOrigin="anonymous"
          style={{ padding: "5px", width: "100%", height: "100%" }}
          src={context.videoUrl}
          controls
        ></video>
      )}
    </div>
  );
};

export default VideoArea;
