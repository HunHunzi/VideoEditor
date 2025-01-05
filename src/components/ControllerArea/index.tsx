import React, { useState, useRef, useEffect } from "react";
import { Button, Card, Input, message } from "antd";
import InfoCard from "./InfoCard";
import { UploadOutlined } from "@ant-design/icons";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useVideoContext } from "../../store/videoContext";

const ControllerArea = () => {
  const { context, setContext } = useVideoContext();
  const fileInputRef = useRef(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [ffmpeg, setFfmpeg] = useState(null); // FFmpeg实例
  const [loading, setLoading] = useState(false); // 加载状态

  // 初始化ffmpeg
  useEffect(() => {
    const initFFmpeg = async () => {
      const ffmpegInstance = createFFmpeg({ log: true });
      await ffmpegInstance.load();
      setFfmpeg(ffmpegInstance); // 设置FFmpeg实例
    };
    initFFmpeg();
  }, []);

  const urlGetData = async (fileUrl: string, type = "video/mp4") => {
    if (!ffmpeg) {
      message.error("FFmpeg尚未准备好");
      return;
    }
    const tmp = "tmpFile";
    ffmpeg.FS("writeFile", tmp, await fetchFile(fileUrl));
    const outputData = ffmpeg.FS("readFile", tmp);
    return new Blob([outputData.buffer], { type });
  };

  // 分析视频数据
  // ...existing code...

  const analyzeVideo = async () => {
    if (!fileUrl) {
      message.error("视频文件尚未准备好");
      return;
    }

    setLoading(true);
    try {
      console.log("开始分析视频信息", fileUrl);

      // 创建一个视频元素
      const videoElement = document.createElement("video");

      // 加载视频文件
      videoElement.src = fileUrl;

      // 等待视频元数据加载完成
      await new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = () => {
          resolve();
        };
        videoElement.onerror = (error) => {
          reject("视频加载失败");
        };
      });

      // 获取视频基本信息
      const duration = videoElement.duration; // 视频时长（秒）
      const width = videoElement.videoWidth; // 视频宽度
      const height = videoElement.videoHeight; // 视频高度
      const frameRate =
        videoElement.getVideoPlaybackQuality?.().totalFrameCount / duration; // 如果支持帧率获取
      // 也可以使用 videoElement.videoWidth 和 videoElement.videoHeight 来计算时长等

      console.log(`视频时长: ${duration} 秒`);
      console.log(`视频分辨率: ${width}x${height}`);
      if (frameRate) {
        console.log(`视频帧率: ${frameRate}`);
      }

      // 返回视频信息
      return {
        duration,
        width,
        height,
        frameRate,
      };
    } catch (error) {
      message.error("分析视频失败");
      console.error("分析失败", error);
    } finally {
      setLoading(false);
    }
  };

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
    setContext("videoList", newVideoList);
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
            <Button
              size="large"
              style={{ marginRight: "10px" }}
              onClick={analyzeVideo}
              loading={loading} // 显示加载状态
            >
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
