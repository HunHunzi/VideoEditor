import React from "react";
import VideoArea from "../components/VideoArea";
import ControllerArea from "../components/ControllerArea";
import TrackArea from "../components/TracksArea";
import { VideoProvider } from "../store/videoContext";
import CommonPlayer from "../components/CommonPlayer";
import FlvPlayer from "../components/FlvPlayer";

const IndexPage = () => {
  const videoRef = React.useRef(null);
  const handlePlayVod = () => {
    console.log("handlePlayVod");
    if (videoRef.current) {
      videoRef.current.playVod();
    }
  };
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
          }}
        >
          <div
            style={{
              border: "1px solid #e8e1e1",
              margin: "10px",
              borderRadius: "6px",
              height: "815px",
              width: "1200px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
            }}
          >
            <CommonPlayer ref={videoRef} />
            {/* <FlvPlayer videoUrl="http://txdirect.flv.huya.com/huyalive/1199561177177-1199561177177-5434428961511702528-2399122477810-10057-A-0-1.flv?wsSecret=0deec32f08129ec46abf079a11678ae5&wsTime=677e3f68&fm=RFdxOEJjSjNoNkRKdDZUWV8kMF8kMV8kMl8kMw%3D%3D&fs=bgct&ctype=test" /> */}
          </div>
          <div
            style={{
              borderRadius: "6px",
              margin: "10px",
              height: "450px",
            }}
          >
            <ControllerArea playVod={handlePlayVod} />
          </div>
        </div>
      </div>
    </VideoProvider>
  );
};

export default IndexPage;
