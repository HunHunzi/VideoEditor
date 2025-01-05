import React, { useState } from "react";
import { Card, List, Button } from "antd";
import { useVideoContext } from "../../store/videoContext";

const TrackArea = () => {
  const { context } = useVideoContext(); // 从上下文中获取视频列表
  const videoList = context?.videoList || []; // 假设视频列表保存在context.videoList中

  // 点击播放视频
  const handlePlayVideo = (videoUrl) => {
    // 在这里处理视频播放的逻辑，或者将视频URL传递给播放器组件
    console.log("播放视频:", videoUrl);
  };

  console.log("videoList", videoList);

  return (
    <div
      style={{
        padding: "10px",
        fontFamily: "Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingBottom: "20px",
          fontSize: "20px",
        }}
      >
        🎞 视频列表：
      </div>

      {/* 视频列表 */}
      <List
        itemLayout="horizontal"
        dataSource={videoList || []} // 绑定上下文中的视频列表
        renderItem={(videoUrl, index) => (
          <List.Item
            actions={[
              <Button type="link" onClick={() => handlePlayVideo(videoUrl)}>
                播放
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={`视频 ${index + 1}`} // 显示视频名称或其他描述
              description={videoUrl} // 显示视频URL或文件路径
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default TrackArea;
