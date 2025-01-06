import React, { forwardRef, useContext } from "react";
import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useImperativeHandle,
} from "react";
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Form,
  Input,
  Popover,
  Switch,
  message,
  Select,
} from "antd";

import {
  PauseCircleOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  UpOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";
import moment from "moment";
import SegmentedComponent from "../SegmentedComponent";
import MarkForm from "./MarkForm";
import PcuChart from "./PcuChart";
import style from "./index.module.css";

interface CommonPlayerProps {
  videoData: any[];
  anchorUid?: string;
  videoType?: string; //HLS or MP4
  isSimplified?: boolean;
  businessType: string;
  switchVideo?: (direction: string) => void; // 切换视频
}

const CommonPlayer = forwardRef((props: CommonPlayerProps, ref) => {
  const [player, setPlayer] = useState<any>(null);
  const [isHovering, setIsHovering] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [playIng, setPlayIng] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [videoStartTime, setVideoStartTime] = useState<number>(0); // 视频开始时间

  const [selectedId, setSelectedId] = useState("");
  const [seekTime, setSeekTime] = useState(0);
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isVideoEnd, setIsVideoEnd] = useState(false);
  const [liveState, setLiveState] = useState(0);
  const [markSource, setMarkSource] = useState("npc_gx"); // 标记来源
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [bufferedTime, setBufferedTime] = useState(0);

  const [popoverVisible, setPopoverVisible] = useState(false);
  const [outsideFormVisible, setOutsideFormVisible] = useState(false); // 外站数字人打点表单是否显示

  const [targetTime, setTargetTime] = useState(0);
  const isOutsideDigitalHuman = props.businessType == "outsideDigitalHuman";
  const isNpcBarrage = props.businessType == "npcBarrage";

  // 获取打点类型描述和颜色
  const getPointTypeDescriptionAndColor = (pointType, eventTimePoint) => {
    if (eventTimePoint == targetTime) {
      return { description: "targetTime", color: "#ff4d4f" };
    }

    switch (pointType) {
      case 1:
        return { description: "游戏事件打点", color: "#ff4d4f" };
      case 2:
        return { description: "口播事件打点", color: "#1677ff" };
      case 3:
        return { description: " 用户标记", color: "#389e0d" };
      default:
        return { description: "其他", color: "#9254de" };
    }
  };

  // 获取直播汇总数据
  const getLiveStat = async () => {};

  // ================================================== 播放器相关 ===============================

  // =====================================视频播放器 =====================================

  const speedOptions = [
    { label: "0.5x", value: 0.5 },
    { label: "0.6x", value: 0.6 },
    { label: "0.7x", value: 0.7 },
    { label: "0.8x", value: 0.8 },
    { label: "0.9x", value: 0.9 },
    { label: "1x", value: 1 },
    { label: "1.5x", value: 1.5 },
    { label: "2x", value: 2 },
  ];

  const [playbackRate, setPlaybackRate] = useState(1);
  // 设置播放速度
  const handleSpeedChange = (value: number) => {
    localStorage.setItem("playbackRate", value.toString());
    setPlaybackRate(value);
    if (player) {
      player?.setPlaybackRate(value);
    }
  };

  const videoRef = useRef<any>(null);

  /**
   * 初始化播放器
   * @returns
   */

  const initVodPlayer = async () => {
    if (player) {
      return;
    }
    const initParams = {
      appId: 66,
      ua: `webh5&${window.VodSdkPlayer.VERSION}&huya`,
      source: "huya_wiki",
      uid: 0,
      anchorUid: 0,
      isCloseVodPcdn: 1,
    };
    const videoVod = new window.VodSdkPlayer(initParams);
    console.log("初始化播放器", videoVod);
    setPlayer(videoVod);
  };

  const createVideo = (videoVod: any, isStop: boolean = false) => {
    const videoElement = document.querySelector("video");
    const videoDescElement = document.querySelector("#video_desc");

    if (videoElement && videoRef.current?.contains(videoElement)) {
      videoRef.current.removeChild(videoElement);
    }
    if (videoDescElement && videoRef.current?.contains(videoDescElement)) {
      videoRef.current.removeChild(videoDescElement);
    }

    const newVideo: HTMLVideoElement = videoVod?.playerMgr?.videoElement;

    if (newVideo) {
      newVideo.setAttribute("preload", "auto");
      newVideo.style.width = "100%";
      newVideo.style.height = "100%";
      videoRef.current?.appendChild(newVideo);

      if (isStop) {
        videoVod.pause(); // 否则暂停
      } else {
        videoVod.play(); // 自动播放
      }

      let volTmp = localStorage.getItem("playVolume");
      if (
        volTmp &&
        isFinite(Number(volTmp)) &&
        Number(volTmp) >= 0 &&
        Number(volTmp) <= 1
      ) {
        setVolume(parseFloat(volTmp));
        player?.setVolume(volTmp);
      } else {
        setVolume(1);
        player?.setVolume(1);
      }

      newVideo.addEventListener("volumechange", onVolumeChange);
    }
  };

  const onVolumeChange = (e: any) => {
    setVolume(e.target.volume);
    localStorage.setItem("playVolume", e.target.volume);
  };

  /*
   * 播放视频
   */
  const playVod = (item: any, isStop?: boolean) => {
    if (!player || !item) {
      return;
    }

    player?.stop();

    setVideoStartTime(item?.beginTime);
    let videoType = window.VodSdkPlayer?.MP4;
    let streamType = window.VodSdkPlayer?.StreamType.MP4;

    const startParams = {
      url: item.videoUrl || "",
      type: videoType || window.VodSdkPlayer?.MP4,
      vid: 0,
      h5Root: "",
      curBitrate: "",
      streamType: streamType || window.VodSdkPlayer?.StreamType.MP4,
      liveType: 0,
      lineType: 0,
      presenterUid: 0,
    };
    createVideo(player, isStop);

    player?.on("VIDEO_PLAY", () => {
      createVideo(player, isStop);
    });
    player?.start(startParams);
    if (player) {
      setSelectedId(item.id); //设置
      setPlayerCurrentTime(0);
      let playbackRate = localStorage.getItem("playbackRate");
      if (playbackRate) {
        setPlaybackRate(parseFloat(playbackRate));
        player?.setPlaybackRate(parseFloat(playbackRate));
      } else {
        setPlaybackRate(1);
        player?.setPlaybackRate(1);
      }
    }
  };

  const handlePlay = () => {
    setPlayIng(true);
    setIsVideoEnd(false);
    // 播放
    player?.play();
    console.log("播放", player);
  };

  const handlePause = () => {
    setPlayIng(false);
    // 暂停
    player?.pause();
  };

  // 切换视频切片
  const handleSwitchVideo = (direction: string) => {
    const url = new URL(window.location.href);
    const path = url.hash.includes("npcDetail");
    if (path) {
    } else {
      message.info("当前切片没有更多NPC弹幕");
    }
  };

  // 快捷键监听
  // 上次按键时间
  let lastKeyTime = 0;

  const handleKeyDown = (e) => {
    const currentTime = new Date().getTime();

    if (e.keyCode === 32) {
      e.preventDefault();
      e.stopPropagation();
      // 按空格键暂停/播放
      if (playIng) {
        handlePause();
      } else {
        handlePlay();
      }
    } else if (e.keyCode === 37) {
      // 按左键快退
      if (currentTime - lastKeyTime < 500) {
        player?.seek(player?.getCurrentTime() - 5);
      } else {
        player?.seek(player?.getCurrentTime() - 0.5);
      }
      lastKeyTime = currentTime; // 更新上次按键时间
    } else if (e.keyCode === 39) {
      // 按右键快进
      if (currentTime - lastKeyTime < 500) {
        player?.seek(player?.getCurrentTime() + 5);
      } else {
        player?.seek(player?.getCurrentTime() + 0.5);
      }
      lastKeyTime = currentTime; // 更新上次按键时间
    } else if (e.ctrlKey && e.key === "a") {
      e.preventDefault();
      e.stopPropagation();
      handleMarkSubmit();
    }
  };

  useEffect(() => {
    initVodPlayer(); //初始化播放器
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    //  添加快捷键监听

    return () => {
      player?.stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange
      );
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    //  添加快捷键监听
    document.addEventListener("keydown", handleKeyDown);
  }, [playIng]);

  useEffect(() => {
    dottingInfo();
  }, [selectedId]);

  //=============================================== 进度条点击事件 ===============================================
  // 获取直播数据
  const [liveGraphData, setLiveGraphData] = useState<any>();
  const [isShowLiveGraph, setIsShowLiveGraph] = useState(false);

  const [tooltip, setTooltip] = useState({ visible: false, time: "", x: 0 });
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event) => {
    const progressBar = progressBarRef.current;
    const divRect = progressBar?.getBoundingClientRect();
    // const divRect = event.target.getBoundingClientRect();
    const relativeX = event.clientX - divRect.left;
    const clientWidth = videoRef.current.clientWidth;
    const percent = relativeX / clientWidth;
    const time = percent * totalTime;

    // 转换成时间 例如 1：22：31
    const timeTip = moment((time + videoStartTime) * 1000).format(
      "MM-DD HH:mm:ss"
    );

    // 设置工具提示位置和时间
    setTooltip({
      visible: true,
      time: timeTip,
      x: isFullScreen ? event.clientX : event.clientX,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  // 播放跳转
  const handleScrollToTime = (timePara: number) => {
    let time = timePara - videoStartTime;

    let messageText =
      Math.floor(time / 60) > 0
        ? "已跳转至" +
          Math.floor(time / 60) +
          "分钟" +
          (time % 60).toFixed(0) +
          "秒播放"
        : "已跳转至" + (time % 60).toFixed(0) + "秒播放";
    // 处理成秒
    if (player) {
      player?.seek(time);
      // 如果没有播放，播放
      if (player.getCurrentTime() === 0) {
        player?.play();
      }
    }
    if (time < 0) {
      return;
    }
    message.success(messageText);
    setPlayerCurrentTime(time);
    setSeekTime(time);
  };
  // 全屏切换函数
  const handleFullScreen = () => {
    const videoContainer = videoRef.current;
    enterFullScreen();
    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.mozRequestFullScreen) {
        // Firefox
        videoContainer.mozRequestFullScreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        // Chrome, Safari and Opera
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        // IE/Edge
        videoContainer.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        // Chrome, Safari and Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        // IE/Edge
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // 定时器引用

  const resetHideTimer = () => {
    // 清除已有定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置新的定时器，3秒后隐藏控制栏
    timeoutRef.current = setTimeout(() => {
      setIsHovering(false);
    }, 2000);
  };

  const handleMouseMoveFullScreen = (e) => {
    if (!isFullScreen) return;
    setIsHovering(true); // 显示控制栏
    resetHideTimer(); // 重置隐藏定时器

    if (!dragging) return;

    const rect = videoRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    setEndPoint({ x: offsetX, y: offsetY });
  };

  // =============================================== 打点相关 ===============================================
  const [highlightData, setHighlightData] = useState<any[]>([]); // 打点数据
  const [startListPoint, setStartListPoint] = useState<any>(null); // 开始时间点
  const [endListPoint, setEndListPoint] = useState<any>(null); // 结束时间点
  const [submitVisible, setSubmitVisible] = useState(false); // 提交弹窗
  const [progressIsVisible, setProgressIsVisible] = useState(false); // 进度条是否显示
  const [currentPointTime, setCurrentPointTime] = useState(0); // 当前打点时间

  // 快捷标记
  const handleMarkSubmit = () => {
    player?.pause();
    setCurrentPointTime(playerCurrentTime);
    if (markSource == "outside_digit") {
      setOutsideFormVisible(!outsideFormVisible);
    } else {
      setSubmitVisible(!submitVisible);
    }
  };

  // 打点信息弹窗内容
  const dottingInfoPopoverContent = (event) => {
    const { color, description } = getPointTypeDescriptionAndColor(
      event.pointType
    );

    return (
      <div>
        <span style={{ color }}>类型：{description}</span>
        <br />
        <div style={{ wordWrap: "break-word", maxWidth: "200px" }}>
          描述：{event.pointDesc}
        </div>
      </div>
    );
  };

  // 外部数字人打点信息弹窗内容
  const outsideDottingInfoPopoverContent = (event) => {
    const { color, description } = getPointTypeDescriptionAndColor(
      event.pointType
    );

    return (
      <div>
        <span style={{ color }}>类型：{description}</span>
        <br />
        <div style={{ wordWrap: "break-word", maxWidth: "200px" }}>
          描述：{event.pointDesc}
        </div>
      </div>
    );
  };

  const [clickTimeout, setClickTimeout] = useState(null);
  const handleStartListPointChange = (startListPoint) => {
    setStartListPoint(startListPoint);
  };

  const handleEndListPointChange = (endListPoint) => {
    setEndListPoint(endListPoint);
  };

  // 打点条点击事件处理
  const handleClick = (event) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    // 单击事件处理逻辑
    const timeout = setTimeout(() => {
      const progressBar = progressBarRef.current;
      const divRect = progressBar?.getBoundingClientRect();

      const relativeX = event.clientX - divRect?.left;
      const relativeY = event.clientY - divRect?.top;

      const clientWidth = videoRef.current.clientWidth;
      const percent = relativeX / clientWidth;
      setPlayerCurrentTime(percent * totalTime);

      player?.seek(percent * totalTime);

      //loadDanmu();
    }, 100); // 延迟300毫秒以区分单击和双击
    setClickTimeout(timeout); // 设置延迟
  };

  const handleDoubleClick = (event) => {
    if (props.isSimplified) {
      if (!isOutsideDigitalHuman) {
        return;
      }
    }

    if (clickTimeout) {
      const divRect = event.target.getBoundingClientRect();

      const relativeX = event.clientX - divRect.left;
      const clientWidth = videoRef.current.clientWidth;
      const percent = relativeX / clientWidth;
      let currentTime = percent * totalTime;
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      setCurrentPointTime(currentTime);

      if (isOutsideDigitalHuman) {
        setOutsideFormVisible(true);
      } else {
        setSubmitVisible(true);
      }

      player?.pause();
    }

    // 双击事件处理逻辑
  };

  // 打点信息查询
  const dottingInfo = () => {
    if (!props.videoData?.length) {
      return;
    }
    if (props.isSimplified) {
      if (!isOutsideDigitalHuman) {
        return;
      }
    }
  };

  useEffect(() => {
    if (!startListPoint && !endListPoint) {
      setProgressIsVisible(false);
    }
  }, [startListPoint, endListPoint]);

  // 视频放大和缩小
  const [scale, setScale] = useState(1); // 放大比例
  const [origin, setOrigin] = useState("50% 50%"); // 放大锚点

  const enterFullScreen = () => {
    const container = videoRef.current.parentElement;
    if (container.requestFullscreen) {
      container.requestFullscreen().then(() => {
        // 监听全屏状态变化
        document.addEventListener("fullscreenchange", handleFullScreenChange);
      });
    }
  };

  const handleFullScreenChange = () => {
    const container = videoRef.current.parentElement;

    if (document.fullscreenElement === container) {
      // 进入全屏时，应用放大效果
      container.style.transform = `scale(${scale})`;
      container.style.transformOrigin = origin;
    } else {
      // 退出全屏时，重置样式
      container.style.transform = "";
      container.style.transformOrigin = "";
    }
  };

  const [startPoint, setStartPoint] = useState(null); // 记录拖动起始点
  const [endPoint, setEndPoint] = useState(null); // 记录拖动结束点
  const [dragging, setDragging] = useState(false); // 标记是否正在拖动

  const handleZoomMouseDown = (event) => {
    if (event.button !== 2) return; // 只响应右键
    event.preventDefault();

    const rect = videoRef.current.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / scale; // 考虑缩放比例
    const offsetY = (event.clientY - rect.top) / scale;

    setStartPoint({ x: offsetX, y: offsetY });
    setDragging(true);
  };

  const handleZommMouseMove = (event) => {
    handleMouseMoveFullScreen(event); //全屏下的鼠标移动事件（ 进度条）
    if (!dragging) return;

    const rect = videoRef.current.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / scale; // 考虑缩放比例
    const offsetY = (event.clientY - rect.top) / scale;

    setEndPoint({ x: offsetX, y: offsetY });
  };

  const handleZoomMouseUp = () => {
    if (!dragging || !startPoint || !endPoint) return;

    const rect = videoRef.current.getBoundingClientRect();
    const width = Math.abs(endPoint.x - startPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);

    if (width < 10 || height < 10) {
      setDragging(false);
      return;
    }

    // 计算缩放比例和锚点
    const scaleX = rect.width / width;
    const scaleY = rect.height / height;
    const newScale = Math.min(scaleX, scaleY, 3);

    // 计算选中区域的中心点
    const centerX = (startPoint.x + endPoint.x) / 2;
    const centerY = (startPoint.y + endPoint.y) / 2;

    // 计算锚点, 锚点位置是选中区域的中心（相对于视频容器）
    const originX = (centerX / rect.width) * 100 + "%";
    const originY = (centerY / rect.height) * 100 + "%";

    setScale(newScale);
    setOrigin(`${originX} ${originY}`);
    setDragging(false);
    setStartPoint(null);
    setEndPoint(null);
  };

  const handleContextMenu = (event) => {
    event.preventDefault(); // 禁止右键菜单弹出
  };

  // 绑定事件
  useEffect(() => {
    document.addEventListener("mouseup", handleZoomMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleZoomMouseUp);
    };
  }, [dragging, startPoint, endPoint]);

  // 在组件销毁时清理事件监听
  useEffect(() => {
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, [scale, origin]);

  // ==================================初始化以及监听====================================
  useImperativeHandle(ref, () => ({
    playVod,
    pauseVod: () => {
      player?.pause();
    },
    seekTo(time: number) {
      let messageText =
        Math.floor(time / 60) > 0
          ? "已跳转至" +
            Math.floor(time / 60) +
            "分钟" +
            (time % 60).toFixed(0) +
            "秒播放"
          : "已跳转至" + (time % 60).toFixed(0) + "秒播放";
      // handleScrollToTime(time);
      setPlayerCurrentTime(time);
      player?.seek(time);
      message.success(messageText);
    },
  }));

  useEffect(() => {
    if (player) {
      player.on("VIDEO_PLAYING", () => {
        //console.log('总时长', player?.getDuration());
        setPlayIng(true);
        console.log("总时长", player?.getDuration());
        setTotalTime(player?.getDuration());
        setBufferedTime(0);
      });
      player.on("VIDEO_PAUSE", () => {
        setPlayIng(false);
      });

      const handleTimeUpdate = (obj: object, data: any) => {
        console.log("当前时间", data.currentTime, data.currentTime % 60);
        setPlayerCurrentTime(data.currentTime);
        // //console.log('当前时间', data.currentTime, data.currentTime % 60);
        const buffered = player?.getBuffered();
        if (buffered && buffered.length > 0) {
          const newBufferedTime = buffered.end(buffered.length - 1);
          setBufferedTime((prevBufferedTime) => {
            // 仅在新值大于当前值时更新 bufferedTime
            return newBufferedTime > prevBufferedTime
              ? newBufferedTime
              : prevBufferedTime;
          });
        }
      };
      // 暂停时取消监听
      player.on("VIDEO_PAUSE", () => {
        player.off("VIDEO_TIMEUPDATE", handleTimeUpdate);
      });
      // 结束时取消监听
      player.on("VIDEO_END", () => {
        player.off("VIDEO_TIMEUPDATE", handleTimeUpdate);
        setPlayIng(false);
      });
      // 暂停重新播放时重新监听
      player.on("VIDEO_PLAYING", () => {
        player.off("VIDEO_TIMEUPDATE", handleTimeUpdate); // 移除旧的监听
        player.on("VIDEO_TIMEUPDATE", handleTimeUpdate); // 添加新的监听
      });
      // seek后重新监听
      player.on("VIDEO_SEEK", () => {
        // seek后立即请求弹幕
        setSeekTime(player?.getCurrentTime());
        player.off("VIDEO_TIMEUPDATE", handleTimeUpdate); // 移除旧的监听
        player.on("VIDEO_TIMEUPDATE", handleTimeUpdate); // 添加新的监听
      });

      // 如果播放器存在
      playVod({
        videoUrl:
          "https://adsmind.gdtimg.com/ads_svp_video__0b53tybfcaacbyacnsrpnntrrhqekgpaeuka.f140010.mp4?dis_k=1ea4b8fe93958932d34a8e532a9c6eaa&dis_t=1731033093&sha256=de93fc7013b94c1dab07da994eb4cfcbb2049e62eb4a4d7c4d3533c71e422517&m=03bf8bb1242b681424c19d4df2363920&stdfrom=25&&u=1200714702920&t=100&sv=2501060401&sdk_sid=1736158328751&a_block=0",
      });
    }
    return () => {
      player?.stop();
    };
  }, [player]);

  const progressWrapArea = () => {
    return (
      <div className={style.progressAreaWrap}>
        {scale !== 1 && (
          <div
            style={{
              position: "absolute",
              transform: "translate(-20%, -150%)",
              color: "#fff",
              fontSize: "18px",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(8, 4, 4, 0.69)",
                borderRadius: "5px",
                padding: "5px",
              }}
            >
              放大比例：{Math.round(scale * 100)}%
            </div>
            <div
              style={{
                backgroundColor: "rgba(8, 4, 4, 0.69)",
                borderRadius: "5px",
                padding: "5px",
                marginLeft: "10px",
                cursor: "pointer",
              }}
              onClick={() => {
                setScale(1);
              }}
            >
              恢复
            </div>
          </div>
        )}
        <div
          className={style.progressBar}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          ref={progressBarRef}
        >
          <div
            className={style.progressBarFill}
            style={{
              width: `${
                isVideoEnd ? 100 : (playerCurrentTime / totalTime) * 100
              }%`,
            }}
          ></div>
          <div
            className={style.bufferedBarFill}
            style={{
              left: `${bufferedTime ? (bufferedTime / totalTime) * 100 : 0}%`,
              width: `${
                totalTime
                  ? ((bufferedTime - playerCurrentTime) / totalTime) * 100
                  : 0
              }%`,
            }}
          ></div>
          {highlightData?.map((event, index) => {
            let leftPosition;
            let rightPosition;
            if (startListPoint && endListPoint) {
              // 开始时间点
              leftPosition =
                ((startListPoint.timePoint - videoStartTime) / totalTime) * 100;
              // 结束时间点
              rightPosition =
                ((endListPoint.timePoint - videoStartTime) / totalTime) * 100;
            }
            return (
              <>
                <Popover
                  content={
                    isOutsideDigitalHuman
                      ? outsideDottingInfoPopoverContent(event)
                      : dottingInfoPopoverContent(event)
                  }
                  key={index}
                  onVisibleChange={(visible) => setPopoverVisible(visible)}
                >
                  <div
                    key={index}
                    className={style.timeMarker}
                    style={{
                      left: `${
                        ((event.timePoint - videoStartTime) / totalTime) * 100
                      }%`,
                      backgroundColor: getPointTypeDescriptionAndColor(
                        event.pointType,
                        event.timePoint
                      ).color,
                    }}
                  ></div>
                </Popover>
                {startListPoint && endListPoint && (
                  <div
                    className={style.highlightRegion}
                    style={{
                      position: "absolute",
                      left: `calc(${leftPosition}% + 8px)`,
                      width: `calc(${rightPosition - leftPosition}% - 8px)`,
                      height: "100%",
                      backgroundColor: "#ffe58f",
                    }}
                  ></div>
                )}
              </>
            );
          })}
          {tooltip.visible && !popoverVisible && (
            <>
              {props.isSimplified && !isOutsideDigitalHuman ? null : (
                <div
                  className={style.tooltip}
                  style={{
                    position: "absolute",
                    left: tooltip.x,
                    bottom: "20px", // 根据需求调整位置
                    backgroundColor: "#000",
                    color: "#fff",
                    padding: "5px",
                    borderRadius: "3px",
                    transform: "translateX(-50%)",
                    textAlign: "center",
                  }}
                >
                  双击打点
                  <br></br> {tooltip.time}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: "-5px",
                      width: "0",
                      height: "0",
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "5px solid #000",
                      transform: "translateX(-50%)",
                    }}
                  ></div>
                </div>
              )}
            </>
          )}
          {/*  打点条 */}
        </div>
        {/* 下层按钮区域 */}
        <div className={style.progressAreaWrapBottom}>
          {/* 播放按钮 */}
          <div>
            {playIng ? (
              <Button
                type="text"
                shape="circle"
                icon={
                  <PauseCircleOutlined
                    style={{ fontSize: "40px", color: "#eeee" }}
                  />
                }
                className={style.extraLargeButton}
                onClick={handlePause}
              ></Button>
            ) : (
              <Button
                type="text"
                icon={
                  <PlayCircleOutlined
                    style={{ fontSize: "40px", color: "#eeee" }}
                  />
                }
                onClick={handlePlay}
                className={style.extraLargeButton}
              ></Button>
            )}
          </div>
          {/* 时间 */}
          <div className={style.timeDisplay}>
            {playerCurrentTime ? (
              <span>
                {moment((videoStartTime + playerCurrentTime) * 1000).format(
                  "MM-DD HH:mm:ss"
                )}
              </span>
            ) : (
              <span>0:00</span>
            )}
            /
            {totalTime ? (
              <span>
                {videoStartTime + totalTime
                  ? moment((videoStartTime + totalTime) * 1000).format(
                      "MM-DD HH:mm"
                    )
                  : ""}
              </span>
            ) : (
              <span>0:00</span>
            )}
            {videoStartTime ? (
              <span style={{ marginLeft: "5px" }}>
                总时长
                {Math.floor(totalTime / 3600)}:
                {Math.floor((totalTime % 3600) / 60) < 10
                  ? "0" + Math.floor((totalTime % 3600) / 60)
                  : Math.floor((totalTime % 3600) / 60)}
                :
                {Math.floor(totalTime % 60) < 10
                  ? "0" + Math.floor(totalTime % 60)
                  : Math.floor(totalTime % 60)}
              </span>
            ) : null}
          </div>

          {/* 直播数据是否展示 */}
          <div
            style={{
              color: "#fff",
              marginLeft: "auto",
              marginRight: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {props.isSimplified && !isOutsideDigitalHuman ? null : (
              <Button
                style={{ marginRight: "10px" }}
                type="primary"
                onClick={() => {
                  handleMarkSubmit();
                }}
              >
                标记
              </Button>
            )}
            <div style={{ marginRight: "20px" }}>
              {/* <label htmlFor="speed-select">倍速选择:</label> */}
              <span>倍速：</span>
              <Select
                id="speed-select"
                placement={"topLeft"}
                onChange={(value) => {
                  handleSpeedChange(value);
                }}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                size="small"
                defaultValue={1}
                value={playbackRate}
                suffixIcon={<UpOutlined style={{ pointerEvents: "none" }} />}
              >
                {speedOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            {!props.isSimplified && (
              <>
                <span style={{ marginRight: "10px" }}>数据:</span>
                <Switch
                  style={{
                    backgroundColor: isShowLiveGraph
                      ? "#1890ff"
                      : "rgb(240, 240, 240)",
                  }}
                  checked={isShowLiveGraph}
                  onChange={() => setIsShowLiveGraph((bool) => !bool)}
                />
              </>
            )}
          </div>
          {/* 音量调节 */}
          <div className={style.volumeBar} style={{ marginLeft: -10 }}>
            <Button
              color="white"
              type="text"
              shape="circle"
              icon={
                <SoundOutlined style={{ fontSize: "20px", color: "#eeee" }} />
              }
              className={style.extraLargeButton}
              onClick={() => {
                if (volume > 0) {
                  setVolume(0);
                  player?.setVolume(0);
                } else {
                  setVolume(0.5);
                  player?.setVolume(0.5);
                }
              }}
            ></Button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              className={style.volumeRange}
              onChange={(e) => {
                setVolume(parseInt(e.target.value) / 100);
                player?.setVolume(parseInt(e.target.value) / 100);
              }}
            />
          </div>
          {isFullScreen && (
            <FullscreenExitOutlined
              className={style.fullScreen}
              onClick={() => {
                handleFullScreen();
              }}
            />
          )}
          {!isFullScreen && (
            <FullscreenOutlined
              className={style.fullScreen}
              onClick={() => {
                handleFullScreen();
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        backgroundColor: "white",
        width: "100%",
      }}
    >
      <div style={{ flex: 3 }}>
        <div
          style={{
            background: "rgb(22, 22, 22)",
            minHeight: 715,
            height: 715,
            overflow: "hidden", // 限制溢出
          }}
        >
          <div
            className={style.videoContainer}
            ref={videoRef}
            style={{
              width: "100%",
              height: isFullScreen ? "100% " : "calc(100% - 105px)",
              display: "block",
              position: "relative",
              borderRadius: "4px",
              overflow: "hidden",
              cursor: "pointer",
              transform: `scale(${scale})`,
              transformOrigin: origin,
              transition: "transform 0.3s ease",
              zIndex: 0,
            }}
            onClick={(e) => {
              // handleZoom(e);
              if (player) {
                if (playIng) {
                  handlePause();
                } else {
                  handlePlay();
                }
              }
            }}
            onMouseMove={(e) => {
              handleZommMouseMove(e);
            }}
            onMouseDown={(e) => {
              handleZoomMouseDown(e);
            }}
            onContextMenu={handleContextMenu}
          >
            {/* 渲染选中框 */}
            {dragging && startPoint && endPoint && (
              <div
                style={{
                  position: "absolute",
                  left: Math.min(startPoint.x, endPoint.x),
                  top: Math.min(startPoint.y, endPoint.y),
                  width: Math.abs(endPoint.x - startPoint.x),
                  height: Math.abs(endPoint.y - startPoint.y),
                  border: "2px dashed #fff",
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  pointerEvents: "none",
                }}
              ></div>
            )}
            <PlayCircleOutlined
              onClick={() => {
                if (playIng) {
                  handlePause();
                } else {
                  handlePlay();
                }
              }}
              style={{
                display: playIng ? "none" : "block",
                fontSize: "70px",
                color: "#eeee",
                zIndex: 1,
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            {submitVisible && (
              <MarkForm
                videoStartTime={videoStartTime}
                currentPointTime={currentPointTime}
                anchorUid={props.anchorUid}
                markSource={markSource}
                handleVisible={() => {
                  setSubmitVisible(!submitVisible);
                }}
                handleDottingInfo={dottingInfo}
              ></MarkForm>
            )}

            {isShowLiveGraph && isHovering && (
              <PcuChart
                {...liveGraphData}
                liveState={liveState}
                isFullScreen={isFullScreen}
              />
            )}
          </div>

          {!isFullScreen && (
            <div
              className={style.progressArea}
              style={{
                height: isNpcBarrage ? "85px" : "105px",
                cursor: "default",
                backgroundColor: "rgb(22, 22, 22)",
                zIndex: 100, // 确保进度条在视频上方
              }}
            >
              {progressWrapArea()}
            </div>
          )}
          {isFullScreen && (
            <div
              className={style.fullProgressArea}
              style={{
                height: "60px",
                display: isHovering && isFullScreen ? "block" : "none",
              }}
            >
              {progressWrapArea()}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          border: "1px solid #eeee",
          borderRadius: "4px",
          backgroundColor: "#fff",
          maxWidth: "500px",
        }}
      >
        <SegmentedComponent
          bussinessType={props.businessType}
          isSimplified={props.isSimplified}
          setProgressIsVisible={setProgressIsVisible}
          dottingInfo={dottingInfo}
          videoData={props.videoData}
          selectedId={selectedId}
          playerCurrentTime={videoStartTime + playerCurrentTime}
          handleScrollToTime={handleScrollToTime}
          isScrolling={isScrolling}
          setIsScrolling={setIsScrolling}
          highlightData={highlightData}
          anchorUid={props.anchorUid}
          seekTime={videoStartTime + seekTime}
          onStartListPointChange={handleStartListPointChange}
          onEndListPointChange={handleEndListPointChange}
          handleSwitchVideo={handleSwitchVideo}
        />
      </div>
    </div>
  );
});

export default CommonPlayer;
