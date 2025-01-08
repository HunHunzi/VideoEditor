import React, { useEffect, useRef, useState } from "react";
import flvjs from "flv.js";

interface FlvPlayerProps {
  videoUrl: string; // 用于传入 FLV 视频流 URL
}

const FlvPlayer: React.FC<FlvPlayerProps> = ({ videoUrl }) => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null); // 引用 video 元素
  const [player, setPlayer] = useState<flvjs.Player | null>(null); // 管理 FLV 播放器实例

  useEffect(() => {
    // 检查浏览器是否支持 flv.js
    if (flvjs.isSupported() && videoElementRef.current) {
      // 创建 flv.js 播放器实例
      const newPlayer = flvjs.createPlayer({
        type: "flv",
        url: videoUrl, // 使用传入的 FLV 视频 URL
      });

      // 将播放器与 video 元素绑定
      newPlayer.attachMediaElement(videoElementRef.current);
      newPlayer.load(); // 加载视频流
      newPlayer.play(); // 播放视频

      // 更新 player 状态
      setPlayer(newPlayer);

      // 清理资源
      return () => {
        newPlayer.destroy(); // 销毁播放器实例
        setPlayer(null); // 重置 player 状态
      };
    }
  }, [videoUrl]); // 依赖于 videoUrl 变化，重新加载和播放视频

  return (
    <div>
      <video ref={videoElementRef} controls width="640" height="360" />
    </div>
  );
};

export default FlvPlayer;
