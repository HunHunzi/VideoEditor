import React, { useState, useRef, useEffect } from "react";
import { Button, Card, Input, message } from "antd";
import InfoCard from "./InfoCard";
import {
  PlayCircleFilled,
  UploadOutlined,
  PlayCircleTwoTone,
} from "@ant-design/icons";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useVideoContext } from "../../store/videoContext";

const ControllerArea = ({ playVod }) => {
  const { context, setContext } = useVideoContext();
  const fileInputRef = useRef(null);
  const [fileUrl, setFileUrl] = useState(null);

  // 处理文件变化
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const filePath = URL.createObjectURL(file);
      setFileUrl(filePath); // 更新文件路径
      handleAddVideoList(filePath); // 更新视频列表
      handleAddVideoUrl(filePath); // 传递到播放器上下文
      message.success(`文件 ${file.name} 已成功上传`);
    }
  };

  const handleButtonClick = () => {
    // 模拟点击文件选择器
    fileInputRef.current.click();
  };

  const handleAddVideoUrl = (url: string) => {
    setContext("videoUrl", url);
  };

  const handleAddVideoList = (url: string) => {
    const videoList = context.videoList;
    const newVideoList = [...videoList, url];
    setContext("videoUrl", newVideoList);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Card
        title="📝视频信息"
        style={{ width: "100%", height: "50%", border: "1px solid #e8e1e1" }}
        bodyStyle={{ padding: "10px", overflow: "auto", height: "155px" }}
      >
        <InfoCard />
      </Card>
      <Card
        title="📦工具箱"
        style={{ width: "100%", height: "45%", border: "1px solid #e8e1e1" }}
        bodyStyle={{ padding: "10px" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontFamily: "Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji",
          }}
        >
          <div
            style={{
              height: "50%",
              marginBottom: "30px",
              display: "flex",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <Input
              placeholder="请输入在线播放链接"
              size="large"
              style={{ width: "70%" }}
              onChange={(e) => {
                handleAddVideoUrl(e.target.value);
              }}
            />
            <a>or</a>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button
              size="large"
              style={{ marginLeft: "10px" }}
              icon={<UploadOutlined />}
              onClick={handleButtonClick}
            >
              上传文件
            </Button>

            <PlayCircleTwoTone
              style={{
                fontSize: 24,
                marginLeft: 10,
                marginRight: 5,
                cursor: "pointer",
              }}
              onClick={() => {
                playVod();
              }}
            />
          </div>
          <div style={{ height: "50%" }}>
            <Button size="large" style={{ marginRight: "10px" }}>
              视频信息
            </Button>
            <Button size="large" style={{ marginRight: "10px" }}>
              打点标记
            </Button>
            <Button size="large" style={{ marginRight: "10px" }}>
              流量监控
            </Button>
            <Button size="large" style={{ marginRight: "10px" }}>
              添加弹幕
            </Button>
            <Button type="primary" size="large" style={{ marginRight: "10px" }}>
              导出视频
            </Button>
            <Button type="primary" size="large" style={{ marginRight: "10px" }}>
              下载视频
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ControllerArea;
