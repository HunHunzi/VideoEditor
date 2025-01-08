import React, { useState, useMemo, useEffect } from "react";
import {
  Segmented,
  List,
  Empty,
  Button,
  Input,
  message,
  Popconfirm,
  Popover,
} from "antd";

import {
  QuestionCircleOutlined,
  VerticalAlignBottomOutlined,
} from "@ant-design/icons";
import BarragesList from "./BarragesList";
import DetailCard from "./DetailCard";
import moment from "moment";

interface SegmentedComponentProps {
  isSimplified?: boolean; // 是否是分享页
  bussinessType: string; // 业务类型
  anchorUid: string | undefined; // 主播UID
  setProgressIsVisible: (visible: boolean) => void; // 设置进度条是否显示
  dottingInfo: () => void; // 打点信息
  videoData: any[] | undefined; // 视频数据
  selectedId: string | undefined; // 选择的任务ID

  // 弹幕组件Barraage相关
  playerCurrentTime: number | undefined; // 播放器当前时间
  handleScrollToTime: (time: number) => void; // 滚动到对应的时间
  isScrolling: boolean; // 是否滚动
  setIsScrolling: (isScrolling: boolean) => void; // 设置弹幕是否滚动
  highlightData: any[] | undefined; // 打点需要高亮的数据时间段

  // 是否需要分段请求弹幕
  allBarraages: any[] | undefined; // 所有弹幕
  // 父组件触发seek
  seekTime: number | undefined;
  filterRadios: any;
  // 切换视频切片
  handleSwitchVideo: (direction: string) => void;

  // 回传打点信息
  onStartListPointChange: (point: any) => void;
  onEndListPointChange: (point: any) => void;
}
// 获取打点类型描述和颜色
const getPointTypeDescriptionAndColor = (pointType) => {
  switch (pointType) {
    case 1:
      return { description: "游戏事件打点", color: "#ff4d4f" };
    case 2:
      return { description: "口播事件打点", color: "#1677ff" };
    case 3:
      return { description: " 自定义打点", color: "#389e0d" };
    default:
      return { description: "其他", color: "#9254de" };
  }
};

const SegmentedComponent: React.FC<SegmentedComponentProps> = ({
  setProgressIsVisible,
  dottingInfo,
  videoData,
  selectedId,
  playerCurrentTime,
  handleScrollToTime,
  isScrolling,
  setIsScrolling,
  highlightData,
  anchorUid,
  seekTime,
  filterRadios,
  onStartListPointChange,
  onEndListPointChange,
  handleSwitchVideo,
  isSimplified,
  bussinessType,
}) => {
  const [taskName, setTaskName] = useState("未命名"); // 任务名称
  const [segmentedValue, setSegmentedValue] = useState("弹幕区"); // 分段值
  const [startListPoint, setStartListPoint] = useState<any>(null); // 打点开始时间
  const [endListPoint, setEndListPoint] = useState<any>(null); // 打点结束时间

  const [myTaskList, setMyTaskList] = useState<any[]>([]); // 我的任务列表

  const barrageRef = React.useRef(null); // 弹幕列表的Ref
  const barrageListDataRef = React.useRef(null); // 弹幕数据列表的Ref
  const [detailVisible, setDetailVisible] = useState(false); // 弹幕详情是否显示
  const [detailData, setDetailData] = useState<any>(null); // 弹幕详情数据
  const [isBypassBarrage, setIsBypassBarrage] = useState(false); // 是否旁路弹幕

  //================================================= 是否相同切片与打点=================================================
  const isSameSlice = useMemo(() => {
    if (!videoData?.length || !startListPoint || !endListPoint) {
      return false;
    }
    return videoData.some(
      (item) =>
        item.beginTime <= startListPoint.timePoint &&
        item.endTime >= startListPoint.timePoint &&
        item.beginTime <= endListPoint.timePoint &&
        item.endTime >= endListPoint.timePoint
    );
  }, [videoData, startListPoint, endListPoint]);
  //====================================================  弹幕详情 ==================================================================
  const onShowDetail = (barrage: API.DigitalHumanDanmu) => {
    setDetailData(barrage);
    setDetailVisible(true);
  };

  //================================================================高光时刻查询打点相关===============================================
  const makePointExtract = (point: any) => {
    if (!startListPoint) {
      setStartListPoint(point);
    } else if (!endListPoint) {
      if (point.timePoint < startListPoint.timePoint) {
        message.error("结束时间点不能小于开始时间点");
        setStartListPoint(null);
      } else if (point.timePoint === startListPoint.timePoint) {
        // 如果选择了同一个点，取消选择
        setStartListPoint(null);
        setEndListPoint(null);
      } else {
        setEndListPoint(point);
      }
    } else {
      // 如果已经选择了两个点，重置为选择新的开始点
      setStartListPoint(point);
      setEndListPoint(null);
    }
  };

  //高光时刻添加提取视频or弹幕片段任务

  // 通知父组件 startListPoint 变化
  useEffect(() => {
    if (onStartListPointChange) {
      onStartListPointChange(startListPoint);
    }
  }, [startListPoint]);

  // 通知父组件 endListPoint 变化
  useEffect(() => {
    if (onEndListPointChange) {
      onEndListPointChange(endListPoint);
    }
  }, [endListPoint]);

  const [barragesList, setBarragesList] = useState<Array<any>>([]);

  // 弹幕触底触顶事件
  const handleDanmuScroll = (isTop: boolean, isBottom: boolean) => {
    if (anchorUid == "") {
      return;
    }
  };

  useEffect(() => {
    if (selectedId) {
      videoData?.find((item) => {
        if (item.id == selectedId) {
        }
      });
    }
  }, [selectedId]);

  // 如果 Segmented 为我的，则定期轮询任务列表
  useEffect(() => {
    if (segmentedValue === "我的") {
      const interval = setInterval(() => {}, 5000);
      return () => clearInterval(interval);
    }
  }, [segmentedValue]);

  return (
    <div
      style={{
        display: "flex",
        color: "#333",
        justifyContent: "center",
        width: 300,
        flexDirection: "column",
        minHeight: 608,
        position: "relative",
      }}
    >
      {bussinessType != "npcBarrage" && (
        <Segmented
          options={isSimplified ? ["弹幕区"] : ["弹幕区", "功能区", "我的"]}
          style={{ width: "100%" }}
          block
          onChange={(value) => {
            if (value == "我的" || value == "弹幕区") {
              setProgressIsVisible(false);
            } else if (
              (value == "功能区" && startListPoint) ||
              (endListPoint && value == "功能区")
            ) {
              setProgressIsVisible(true);
            } else if (value == "功能区") {
              dottingInfo();
            }
            setSegmentedValue(value);
          }}
        />
      )}

      {segmentedValue == "弹幕区" && (
        <div
          style={{
            // height: !isSimplified
            //   ? document.body.clientHeight - 327
            //   : document.body.clientHeight - 302,
            backgroundColor: "#fff",
            height: 580,
            width: 300,
            position: "relative",
          }}
        >
          {!isSimplified && (
            <div
              style={{
                background: "#e6f7ff",
                justifyContent: "center",
                textAlign: "right",
                padding: "3px 10px 3px 3px",
                fontSize: "12px",
                width: 287,
                zIndex: 9999,
                top: 0,
              }}
            >
              <span
                onClick={() => {
                  if (barrageRef.current) {
                  } else {
                    handleSwitchVideo("prev");
                  }
                }}
                style={{
                  fontSize: "12px",
                  marginTop: "auto",
                  color: "#1677ff",
                  cursor: "pointer",
                }}
              >
                上一条NPC弹幕
              </span>
              <span
                onClick={() => {
                  if (barrageRef.current) {
                    barrageRef.current?.onNextBarrage();
                  } else {
                    handleSwitchVideo("next");
                  }
                }}
                style={{
                  fontSize: "12px",
                  marginTop: "auto",
                  color: "#1677ff",
                  cursor: "pointer",
                  marginLeft: "10px",
                }}
              >
                下一条NPC弹幕
              </span>
            </div>
          )}
          {barragesList.length === 0 ? (
            <Empty
              style={{
                marginTop: "50%",
              }}
              description="没人发弹幕呢~"
            />
          ) : (
            videoData?.map(
              (item: any, index: any) =>
                selectedId == item.id && (
                  <BarragesList
                    key={item.id}
                    ref={barrageRef}
                    isSimplified={isSimplified}
                    barragesList={barrageListDataRef.current || []}
                    playerCurrentTime={playerCurrentTime}
                    onScrollToTime={handleScrollToTime}
                    isScrollingProp={isScrolling}
                    onChangeScroll={(isScrolling: boolean) => {
                      setIsScrolling(isScrolling);
                    }}
                    onShowDetail={(item: any) => {
                      onShowDetail(item);
                    }}
                    setBarrageType={(type: string) => {
                      if (type == "bypass") {
                        setIsBypassBarrage(true);
                      } else {
                        setIsBypassBarrage(false);
                      }
                    }}
                    anchorUid={anchorUid}
                    onScrollHandle={handleDanmuScroll}
                    videoBeginTime={item.beginTime || 0}
                    handleSwitchVideo={handleSwitchVideo}
                    bussinessType={bussinessType}
                  />
                )
            )
          )}
          {isScrolling ? (
            <div
              style={{
                zIndex: 999,
                background: "rgba(255, 166, 0, 0.75)",
                width: "100%",
                height: 30,
                paddingTop: 3,
                textAlign: "center",
                borderRadius: 5,
                cursor: "pointer",
                position: "absolute", // 确保“恢复滚动”的条在父容器内正确定位
                bottom: 0,
              }}
              onClick={() => {
                setIsScrolling(false);
              }}
            >
              点击恢复滚动
            </div>
          ) : null}
        </div>
      )}
      {segmentedValue == "功能区" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: 787,
            width: 300,
          }}
        >
          <Popover
            arrow={false}
            placement="bottomLeft"
            content={
              <div>
                1.
                选择开始打点时间和结束打点时间，可导出该时间段的弹幕与视频切片。
                <br />
                2. 更多自定义的时间点，请在播放器进度条双击添加。
                <br />
                3. 导出任务结果，请到【我的】TAB页查看并下载。
              </div>
            }
          >
            <div
              style={{
                background: "#e6f7ff",
                justifyContent: "center",
                textAlign: "right",
                cursor: "pointer",
                padding: "3px 10px 3px 3px",
                fontSize: "12px",
                color: "#1677ff",
              }}
            >
              功能区使用说明 <QuestionCircleOutlined />
            </div>
          </Popover>
          <div
            style={{ flex: 1, overflowY: "auto" }}
            className="thin-scrollbar"
          >
            <List>
              {highlightData?.map((event, index) => (
                <List.Item
                  key={index}
                  style={{
                    backgroundColor:
                      event?.timePoint == startListPoint?.timePoint ||
                      event?.timePoint == endListPoint?.timePoint ||
                      (startListPoint?.timePoint < event?.timePoint &&
                        endListPoint?.timePoint > event?.timePoint)
                        ? "#fff1b8"
                        : "",
                    border: "none",
                    padding: "3px 10px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    makePointExtract(event);
                    setProgressIsVisible(true);
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: getPointTypeDescriptionAndColor(event.pointType)
                          .color,
                      }}
                    >
                      {
                        getPointTypeDescriptionAndColor(event.pointType)
                          .description
                      }
                    </span>
                    <span style={{ color: "gray" }}>
                      ({moment(event.timePoint * 1000).format("HH:mm:ss")})：
                    </span>
                    {event.pointDesc}
                  </div>
                  <div></div>
                </List.Item>
              )) || <div>暂无打点</div>}
              {highlightData.length == 0 && (
                <Empty
                  style={{
                    marginTop: "50%",
                  }}
                  description="这里空空如也~"
                />
              )}
            </List>
          </div>

          <div
            style={{
              marginTop: "auto",
              width: "100%",
              border: "1px solid #eeee",
              display: "flex",
              justifyContent: "space-around",
              padding: "10px",
              bottom: 0,
              backgroundColor: "white",
            }}
            onClick={() => {
              setIsScrolling(false);
            }}
          ></div>
        </div>
      )}
      {segmentedValue == "我的" && (
        <div style={{ height: 580, width: 300 }} className="thin-scrollbar">
          <List>
            {myTaskList?.map((item: any, index: any) => (
              <List.Item
                style={{
                  padding: "3px 10px",
                }}
              >
                <span style={{ fontWeight: "bold" }}>
                  {item.taskType == 0
                    ? "切片提取任务："
                    : item.taskType == 1
                    ? "弹幕提取任务："
                    : item.taskType == 2
                    ? "字幕提取任务："
                    : "未知任务类型："}
                </span>
                {item.taskName}
                <Button
                  type="text"
                  onClick={() => {
                    if (item.state != 1) {
                      message.error("请等待任务完成");
                    } else {
                      message.success("开始下载");
                      window.open(item.downloadUrl);
                    }
                  }}
                  style={{
                    color:
                      item.state == 1
                        ? "#389e0d"
                        : item.state == 0
                        ? "#faad14"
                        : "grey",
                  }}
                >
                  {item.state == 1 ? "已完成" : "进行中"}
                  {item.state == 1 ? <VerticalAlignBottomOutlined /> : null}
                </Button>
              </List.Item>
            ))}
            {myTaskList.length == 0 && (
              <Empty
                style={{
                  marginTop: "50%",
                }}
                description="任务列表空空如也~"
              />
            )}
          </List>
        </div>
      )}

      {detailVisible && (
        <DetailCard
          detailData={detailData}
          handleCancel={() => {
            setDetailVisible(false);
          }}
          isBypass={isBypassBarrage}
        />
      )}
    </div>
  );
};

export default SegmentedComponent;
