import React, { useState, useRef } from "react";
import { Button, Card, Input, Upload, message } from "antd";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { UploadOutlined } from "@ant-design/icons";
import { useVideoContext } from "../../store/videoContext";

const ControllerArea = () => {
  const { context, setContext } = useVideoContext();

  const fileInputRef = useRef(null);
  const [fileUrl, setFileUrl] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 创建文件的 Blob URL
      const fileBlobUrl = URL.createObjectURL(file);
      setFileUrl(fileBlobUrl);

      // 释放之前的 URL（避免内存泄漏）
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }

      console.log("Selected file:", file.name);
      console.log("File Blob URL:", fileBlobUrl);
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
    setContext("videoList", (prev: string[]) => [...prev, url]);
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
        style={{ width: "100%", height: "60%", border: "1px solid #e8e1e1" }}
        extra={
          <Upload showUploadList={false}>
            <a>addMore</a>
          </Upload>
        }
      ></Card>
      <Card
        title="📦工具箱"
        style={{ width: "100%", height: "35%", border: "1px solid #e8e1e1" }}
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
            <a
              style={{
                marginLeft: "10px",
                fontSize: "20px",
              }}
            >
              or
            </a>
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
          </div>
          <div style={{ height: "50%" }}>
            <Button size="large" style={{ marginRight: "10px" }}>
              视频信息
            </Button>
            <Button size="large" style={{ marginRight: "10px" }}>
              切片分析
            </Button>
            <Button size="large" style={{ marginRight: "10px" }}>
              添加字幕
            </Button>
            <Button size="large" style={{ marginRight: "10px" }}>
              上传贴图
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
