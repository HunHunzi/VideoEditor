import React from "react";
import { List, Typography } from "antd";

interface VideoInfo {
  duration: string;
  frameRate: string;
  bitRate: string;
  type: string;
}

const InfoCard: React.FC<{ data: VideoInfo }> = ({ data }) => {
  const videoInfo = [
    { title: "视频时长", value: data?.duration },
    { title: "视频帧率", value: data?.frameRate },
    { title: "视频码率", value: data?.bitRate },
    { title: "视频类型", value: data?.type },
    { title: "视频类型", value: data?.type },
    { title: "视频类型", value: data?.type },
  ];

  return (
    <div style={{ overflow: "auto", marginTop: "-10px" }}>
      <List
        dataSource={videoInfo}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text strong>{item.title}：</Typography.Text>{" "}
            {item.value}
          </List.Item>
        )}
      />
    </div>
  );
};

export default InfoCard;
