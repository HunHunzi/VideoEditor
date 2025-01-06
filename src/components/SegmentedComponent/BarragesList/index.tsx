import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import "./index.module.css";
import {
  Avatar,
  message,
  Tag,
  Button,
  Card,
  Form,
  Input,
  Popover,
  Skeleton,
  Select,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";

import Draggable from "react-draggable";

interface Barrages {
  content: string; // 弹幕内容
  createTime: number; // 弹幕创建时间
  id: number; // 弹幕id
  isReplied: number; // 主播是否回应
  type: number; // 0普通弹幕，1送礼物，2大哥进场，3用户订阅
  userInfo: Record<string, unknown>;
  traceId: string; // 弹幕traceId
}

interface BarragesListProps {
  barragesList: Barrages[];
  anchorUid: number; // 主播ID
  isSimplified: boolean; // 是否简化模式
  playerCurrentTime: number | undefined;
  videoBeginTime: number; // 视频开始时间
  isScrollingProp: boolean; // 是否正在滚动
  bussinessType: string; // 业务类型
  onScrollToTime: (time: number) => void; //跳转到对应视频节点的时间
  // 回传是否自动滚动
  onChangeScroll: (isScrolling: boolean) => void;
  // 回传触底和触顶
  onScrollHandle: (isTop: boolean, isBottom: boolean) => void;
  // 显示弹幕详情
  onShowDetail: (barrage: Barrages) => void;
  // 回传弹幕的类型
  setBarrageType: (type: string) => void;
  // 切换视频切片
  handleSwitchVideo: (direction: string) => void;
}

const BarragesList: React.FC<BarragesListProps> = forwardRef((props, ref) => {
  const highlightedRef = useRef(null);

  const [isScrolling, setIsScrolling] = React.useState(false); // 是否正在滚动4
  const [weizhi, setWeizhi] = React.useState(0); // 高亮弹幕的位置
  const [isMouseOver, setIsMouseOver] = React.useState(false); // 鼠标是否在弹幕列表上
  const lastScrollTimeRef = React.useRef(0); // 存储上一次执行滚动操作的时间
  const [submitVisible, setSubmitVisible] = React.useState(false); // 提交标注弹窗是否显示
  const [submitForm] = Form.useForm(); // 提交标注表单
  const [currentBarrage, setCurrentBarrage] = React.useState<Barrages | null>(
    null
  ); // 当前选中的弹幕
  const replyRefs = React.useRef<any[]>([]); // 存储回复的位置

  const [currentReplyIndex, setCurrentReplyIndex] = React.useState(0); // 当前回复的位置
  const [highlightedIndex, setHighlightedIndex] = React.useState(undefined); // 高亮显示的弹幕
  const [byPassVisible, setByPassVisible] = React.useState(false); // 旁路弹幕是否显示
  const [markTypeList, setMarkTypeList] = React.useState([]); // 标记类型列表
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [markSource, setMarkSource] = useState("npc_gx"); // 标记来源

  const [isLoading, setIsLoading] = useState(false); // 控制加载状态

  // 使用useImperativeHandle暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    onPreBarrage,
    onNextBarrage,
    handleBottomReached,
    handleTopReached,
  }));

  // ================================================弹幕标记事件================================================
  // 获取标记类型

  // 提交标注

  /** 显示对应弹幕的详情 */
  const showDetail = (barrage: Barrages) => {
    props.onShowDetail(barrage); //显示弹幕详情
  };

  // 显示旁路弹幕数据
  const showBypass = () => {
    setByPassVisible(!byPassVisible);
  };

  const onPreBarrage = () => {
    // 从当前回复的位置往前找，找到上一条npc回复
    const { barragesList } = props;
    const previousNpcIndex = barragesList
      .slice(0, currentReplyIndex)
      .reverse()
      .findIndex((barrage) => barrage?.bussName === "npc_gx");

    if (previousNpcIndex !== -1) {
      // 找到了上一个npc弹幕，可以在这里进行处理，例如高亮显示
      const actualIndex = currentReplyIndex - previousNpcIndex - 1;
      setCurrentReplyIndex(actualIndex);
      setHighlightedIndex(actualIndex); // 设置高亮显示的弹幕
      // 清除上一个定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 创建新的定时器
      timeoutRef.current = setTimeout(() => {
        setHighlightedIndex(undefined);
      }, 2000);

      const previousBarrage = barragesList[actualIndex];
      scrollToTime(previousBarrage.danmu.createTime); // 跳转到对应视频节点的时间

      const replyElement = replyRefs.current[actualIndex];
      if (replyElement) {
        const parentElement = replyElement.parentElement;
        const distanceToTop = replyElement.offsetTop - parentElement.offsetTop;

        // 滚动到上一条回复的位置
        parentElement.scrollTo({
          top: distanceToTop - 420,
          behavior: "smooth",
        });
      }
      // 暂停滚动
      props.onChangeScroll(true);
    } else {
      if (contextValue.isFirstVideo == "true") {
        message.info("已经是第一个视频切片，请切换主播");
        return;
      }
      contextValue.setSwitchVideoDirection("prev");
      props.handleSwitchVideo("prev");
    }
  };

  // 下一个弹幕
  const onNextBarrage = () => {
    // 从当前回复的位置往后找，找到下一条npc回复
    const { barragesList } = props || [];

    const nextNpcIndex = barragesList
      .slice(currentReplyIndex + 1)
      .findIndex((barrage) => barrage.bussName === "npc_gx");
    if (nextNpcIndex !== -1) {
      // 找到了下一个npc弹幕，可以在这里进行处理，例如高亮显示
      const actualIndex = currentReplyIndex + nextNpcIndex + 1;
      setCurrentReplyIndex(actualIndex);
      setHighlightedIndex(actualIndex); // 设置高亮显示的弹幕
      // 清除上一个定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 创建新的定时器
      timeoutRef.current = setTimeout(() => {
        setHighlightedIndex(undefined);
      }, 2000);

      const nextBarrage = barragesList[actualIndex];
      scrollToTime(nextBarrage.danmu.createTime); // 跳转到对应视频节点的时间

      const replyElement = replyRefs.current[actualIndex];
      if (replyElement) {
        const parentElement = replyElement.parentElement;
        const distanceToTop = replyElement.offsetTop - parentElement.offsetTop;

        // 滚动到下一条回复的位置
        parentElement.scrollTo({
          top: distanceToTop - 420,
          behavior: "smooth",
        });
      }

      props.onChangeScroll(true);
    } else {
      if (contextValue.isLastVideo == "true") {
        message.info("已经是最后一个视频切片，请切换主播");
        return;
      }
      contextValue.setSwitchVideoDirection("next");
      props.handleSwitchVideo("next");
    }
  };

  useEffect(() => {
    const handleSwitchVideo = () => {
      if (!contextValue.switchVideoDirection) return; // 如果数据未加载完成，直接返回

      let currentReplyIndex = -1;

      // 统一处理逻辑
      if (contextValue.switchVideoDirection === "next") {
        currentReplyIndex = props.barragesList.findIndex(
          (barrage) => barrage.bussName === "npc_gx"
        );
      } else if (contextValue.switchVideoDirection === "prev") {
        const reversedIndex = props.barragesList
          .slice()
          .reverse()
          .findIndex((barrage) => barrage.bussName === "npc_gx");
        currentReplyIndex = props.barragesList.length - reversedIndex - 1;
      }

      if (currentReplyIndex < 0) return; // 没有找到匹配项时退出

      const replyElement = replyRefs.current[currentReplyIndex];
      scrollToTime(props.barragesList[currentReplyIndex].danmu.createTime);

      if (replyElement) {
        const parentElement = replyElement.parentElement;
        const distanceToTop = replyElement.offsetTop - parentElement.offsetTop;

        setCurrentReplyIndex(currentReplyIndex);
        setHighlightedIndex(currentReplyIndex);

        // 清除上一个定时器
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // 设置高亮效果定时器
        timeoutRef.current = setTimeout(() => {
          setHighlightedIndex(undefined);
        }, 2000);

        // 滚动到对应位置
        parentElement.scrollTo({
          top: distanceToTop - 420,
          behavior: "smooth",
        });
      }

      props.onChangeScroll(true);
    };

    handleSwitchVideo();
  }, [props.barragesList]); // 等待数据加载完成后再处理

  const handleBottomReached = () => {
    // 滚动条置顶
    const container = document.querySelector(".barrage-container");
    //container?.scrollTo(0, 0);
  };

  const handleTopReached = () => {
    // 处理触顶事件
    const container = document.querySelector(".barrage-container");
    //container?.scrollTo(0, container.scrollHeight);
  };

  const computedOffsetTime = (creatTime: number) => {
    //console.log('计算位移时间', creatTime, creatTime - props.videoBeginTime, props.videoBeginTime);
    if (creatTime < props.videoBeginTime) {
      return 0;
    }
    //return creatTime - props.playerCurrentTime;
    return creatTime;
  };

  // 计算seek时间
  const computedSeekTime = (offsetTime: number) => {
    return offsetTime;
  };

  useEffect(() => {
    const current = highlightedRef.current;
    const now = Date.now();

    if (current && now - lastScrollTimeRef.current >= 200 && !isScrolling) {
      // 寻找最近的弹幕
      lastScrollTimeRef.current = now;
      if (props.playerCurrentTime - props.videoBeginTime === 0) {
        const container = document.querySelector(".barrage-container");
        container?.scrollTo(0, 0);
      } else {
        const closestBarrage = props.barragesList
          .slice()
          .reverse()
          .find(
            (barrage) =>
              computedOffsetTime(barrage.danmu.createTime) <=
              props.playerCurrentTime
          );

        if (closestBarrage) {
          const distanceToTop =
            current.getBoundingClientRect().top -
            current?.parentElement?.getBoundingClientRect().top;

          current?.parentElement.scrollBy({
            top: distanceToTop - 420, //高亮弹幕的位置为80%
            behavior: "smooth",
          });
        }
      }
      setWeizhi(current?.getBoundingClientRect().top); //获取高亮弹幕的位置
    }
  }, [props.playerCurrentTime, highlightedRef.current]);

  // 检测滚动事件
  useEffect(() => {
    setIsLoading(true);
    // setVisibleBarrages(props.barragesList);

    // 从url中获取参数
    let href = window.location.href;
    let hash = href.split("#")[1];
    let pathSegments = hash.split("/");

    // 提取出路径中的第二部分，即 "NPC"
    let extractedValue = pathSegments[1];
    let markSourceTmp = "";
    if (extractedValue === "NPC") {
      markSourceTmp = "npc_gx";
    } else if (extractedValue === "VideoReplay") {
      markSourceTmp = "replay";
    } else if (extractedValue === "DigitalHumans") {
      markSourceTmp = "digit_common";
    }

    setMarkSource(markSourceTmp);

    const container = document.querySelector(".barrage-container");
    //检查滚动条是否在滚动
    const checkScroll = () => {
      if (container) {
        const { clientHeight, scrollHeight } = container; //clientHeight:可视区域高度，scrollHeight:滚动区域高度
        if (scrollHeight <= clientHeight) {
          //如果滚动区域高度小于可视区域高度，没有填满
          setIsScrolling(false);
          props.onChangeScroll(false);
        } else {
          setIsScrolling(true);
          props.onChangeScroll(true);
        }
      }
    };
    // 鼠标点击和滚轮事件，用于处理手动拖动滚动条
    const handleMouseDown = () => {
      checkScroll();
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY !== 0) {
        checkScroll();
      }
    };

    container?.addEventListener("mousedown", handleMouseDown);
    container?.addEventListener("wheel", handleWheel);
    setIsLoading(false);

    return () => {
      container?.removeEventListener("mousedown", handleMouseDown);
      container?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // 监听props.isScrollingProp的变化
  useEffect(() => {
    setIsScrolling(props.isScrollingProp);
  }, [props.isScrollingProp]);

  // 确保弹幕列表是数组
  if (!Array.isArray(props.barragesList)) {
    console.error("barragesList is not an array");
    return null;
  }

  /**跳转到对应视频节点的时间 */
  const scrollToTime = (time: number) => {
    props.onScrollToTime(time); // 需要传入秒
  };

  const formatTime = (
    timestamp: number,
    bussName?: string,
    isTotalTime?: boolean
  ) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    if (isTotalTime) {
      return `(${
        bussName || ""
      } ${year}-${month}-${day} ${hours}:${minutes}:${seconds})`;
    } else {
      return `(${bussName || ""} ${hours}:${minutes}:${seconds})`;
    }
  };

  const BarrageItem = ({ barrage, isClosestBarrage, isTotalTime }) => {
    let timeDisplay;
    let barrageData = barrage?.danmu;

    if (barrageData?.isRobot === 1) {
      timeDisplay = formatTime(barrageData?.createTime, "bot", isTotalTime);
    } else if (barrageData?.isNpc === 1 && barrageData?.type !== 6) {
      timeDisplay = formatTime(barrageData?.createTime, "NPC", isTotalTime);
    } else if (barrageData?.isNpc === 0) {
      timeDisplay = formatTime(barrageData?.createTime, "", isTotalTime);
    } else if (barrageData?.type === 6) {
      timeDisplay = formatTime(barrageData?.createTime, "嗨粉", isTotalTime);
    } else if (barrageData?.type === 11 || barrage.bussName == "npc_gx") {
      timeDisplay = formatTime(barrageData?.createTime, "NPC", isTotalTime);
    } else {
      timeDisplay = formatTime(barrageData?.createTime, "", isTotalTime);
    }
    return (
      <span
        data-time={computedOffsetTime(barrageData?.createTime)}
        className={`barrage-item
    `}
        style={{
          cursor: "default",
        }}
      >
        <>
          <span className="barrage-username">
            <Avatar
              size="small"
              src={barrageData?.userInfo?.avatarUrl}
              style={{ marginRight: 8 }}
            />
            {barrageData?.userInfo?.nick}
          </span>

          {barrageData?.type === 0 && (
            <span className="barrage-text">{barrageData.content}</span>
          )}
          {barrageData?.type === 1 && (
            <span className="barrage-text isGift">
              <span style={{ color: "black", fontWeight: "initial" }}>
                赠送
              </span>{" "}
              🎁
              {barrageData.content}
            </span>
          )}
          {barrageData?.type === 2 && (
            <span className="barrage-text isApproach">🔥进场</span>
          )}
          {barrageData?.type === 3 && (
            <span className="barrage-text isSubscribe">⭐用户订阅</span>
          )}
          {}
          <span className="barrage-reply">
            {barrageData?.isReplied ? "[回复]" : ""}
          </span>
          {barrageData?.type === 12 && (
            <span className="barrage-text isApproach">
              🤖 {barrageData?.content}
            </span>
          )}
          <span
            style={{
              color: "#8c8c8c",
              whiteSpace: "normal", // 确保文本支持换行
              wordBreak: "break-word", // 确保长文本也能正确换行
            }}
          >
            {timeDisplay}
          </span>
        </>
      </span>
    );
  };

  const renderBarrageItem = (
    barrage,
    index,
    isClosestBarrage,
    highlightedIndex,
    setHighlightedIndex
  ) => {
    const barrageData = barrage?.danmu;
    let timeDisplay = "";
    if (barrageData?.isRobot === 1) {
      timeDisplay = formatTime(barrageData?.createTime, "bot");
    } else if (barrageData?.isNpc === 1 && barrageData?.type !== 6) {
      timeDisplay = formatTime(barrageData?.createTime, "NPC");
    } else if (barrageData?.isNpc === 0) {
      timeDisplay = formatTime(barrageData?.createTime);
    } else if (barrageData?.type === 6) {
      timeDisplay = formatTime(barrageData?.createTime, "嗨粉");
    } else if (barrageData?.type === 11 || barrage.bussName == "npc_gx") {
      timeDisplay = formatTime(barrageData?.createTime, "NPC");
    } else {
      timeDisplay = formatTime(barrageData?.createTime);
    }

    return !props.isSimplified ? (
      <Popover
        content={
          <div>
            <a
              onClick={() => {
                setSubmitVisible(true);
                setCurrentBarrage(barrage);
              }}
            >
              创建弹幕标记事件
            </a>
          </div>
        }
        trigger="contextMenu"
      >
        {renderBarrageContent()}
      </Popover>
    ) : (
      renderBarrageContent()
    );

    function renderBarrageContent() {
      return (
        <span
          data-time={computedOffsetTime(barrageData?.createTime)}
          ref={(el) => {
            replyRefs.current[index] = el;
            if (isClosestBarrage) {
              highlightedRef.current = el;
            }
          }}
          className={`barrage-item ${
            index === highlightedIndex
              ? "highlight"
              : isClosestBarrage && highlightedIndex === undefined
              ? "highlight"
              : ""
          }`}
          onClick={() => scrollToTime(computedSeekTime(barrageData.createTime))}
        >
          <span className="barrage-time">
            <span className="barrage-username">
              <Avatar
                size="small"
                src={barrageData?.userInfo?.avatarUrl}
                style={{ marginRight: 8 }}
              />
              {barrageData?.userInfo?.nick}
            </span>

            {barrageData?.type === 0 && (
              <span className="barrage-text">{barrageData.content}</span>
            )}
            {barrageData?.type === 1 && (
              <span className="barrage-text isGift">
                <span style={{ color: "black", fontWeight: "initial" }}>
                  赠送
                </span>{" "}
                🎁
                {barrageData?.content}
              </span>
            )}
            {barrageData?.type === 2 && (
              <span className="barrage-text isApproach">🔥进场</span>
            )}
            {barrageData?.type === 3 && (
              <span className="barrage-text isSubscribe">⭐用户订阅</span>
            )}
            {barrage.type === 4 && (
              <span style={{ color: "red", marginRight: 1 }}>【主播】</span>
            )}
            {barrageData?.type === 6 && (
              <span className="barrage-text">{barrageData.content}</span>
            )}
            <span className="barrage-reply">
              {barrageData?.isReplied ? "[回复]" : ""}
            </span>
            {barrageData?.type === 11 && (
              <span className="barrage-text isGift">
                <span style={{ color: "black", fontWeight: "initial" }}>
                  赠送
                </span>{" "}
                🎁
                {barrageData?.content}
              </span>
            )}
            {barrageData?.type === 12 && (
              <span className="barrage-text isApproach">
                🤖 {barrageData?.content}
              </span>
            )}
            <span
              style={{
                color: "#8c8c8c",
              }}
            >
              {timeDisplay}
            </span>
            {(barrage?.isNpc == 1 && barrage?.danmu?.type != 12) ||
            (barrage?.bussName == "npc_gx" && barrageData?.type !== 12) ? (
              <span
                style={{ color: "#0958d9", fontSize: 13 }}
                onClick={(e) => {
                  props.setBarrageType("commom");
                  e.stopPropagation();
                  e.preventDefault();
                  if (props.bussinessType == "npcBarrage") {
                    contextValue?.setDetailBarrage(barrage);
                    return;
                  }
                  showDetail(barrage);
                }}
              >
                【详情】
              </span>
            ) : null}
            {Array.isArray(barrage?.danmuBypass) &&
            barrage?.danmuBypass?.length > 0 ? (
              <span
                style={{ color: "#0958d9", fontSize: 13 }}
                onClick={() => {
                  showBypass();
                }}
              >
                【旁路】
              </span>
            ) : null}
            <div
              className="barrage-bypass"
              style={{
                display: byPassVisible ? "flex" : "none",
              }}
            >
              {Array.isArray(barrage.danmuBypass) &&
                barrage.danmuBypass.map((item, index) => {
                  return (
                    <span>
                      <Avatar
                        size="small"
                        src={item?.userInfo.avatarUrl}
                        style={{ marginRight: 8 }}
                      />
                      <span className="barrage-username">
                        {item?.userInfo.nick}
                      </span>
                      <span className="barrage-text">{item.content}</span>
                      <span
                        style={{
                          color: "#0958d9",
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          props.setBarrageType("bypass");
                          e.stopPropagation();
                          e.preventDefault();
                          showDetail(item);
                        }}
                      >
                        【详情】
                      </span>
                    </span>
                  );
                })}
            </div>
          </span>
        </span>
      );
    }
  };

  return (
    <div
      style={{
        height: props.isSimplified ? "100%" : "calc(100% - 50px)",
      }}
      className="barrage-container"
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      onScroll={(e) => {
        const target = e.target as HTMLDivElement;

        if (target.scrollTop == 0) {
          props.onScrollHandle(true, false);
        } else if (
          Math.floor(target.scrollHeight - target.scrollTop) <=
          target.clientHeight + 100
        ) {
          props.onScrollHandle(false, true);
        }
      }}
    >
      {/* Skeleton 用于加载状态的占位符 */}
      {isLoading ? (
        Array.from({ length: 10 }).map((_, index) => (
          <Skeleton
            active
            title={false}
            paragraph={{ rows: 1 }}
            style={{ marginBottom: 10 }}
          />
        ))
      ) : (
        <>
          {submitVisible && (
            <Draggable cancel=".ant-card-body">
              <Card
                onClick={(e) => {
                  e.stopPropagation();
                }}
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    ✏ 提交标记
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => {
                        setSubmitVisible(false);
                      }}
                    />
                  </div>
                }
                style={{
                  position: "absolute",
                  top: "30%",
                  left: "-200%",
                  transform: "translate(50%, -150%)",
                  width: 600,
                  zIndex: 999,
                  cursor: "default",
                }}
              >
                <Form form={submitForm}>
                  <Form.Item label="标记弹幕" name="pointBarrage">
                    <BarrageItem
                      barrage={currentBarrage}
                      isClosestBarrage={false}
                      isTotalTime={true}
                    />
                  </Form.Item>

                  <Form.Item name="markType" label="标记类型">
                    <Select
                      placeholder="请选择或者输入"
                      mode="tags"
                      style={{ width: 480 }}
                    >
                      {markTypeList?.map((item) => {
                        return (
                          <Option value={item.optionDesc}>
                            {item.optionDesc}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item label="描述信息" name="description">
                    <Input.TextArea
                      style={{ marginTop: 10, marginBottom: 10 }}
                      rows={8}
                    />
                  </Form.Item>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      type="primary"
                      style={{ marginRight: 10 }}
                      onClick={() => {
                        sumbitDanmuMark();
                        setSubmitVisible(false);
                      }}
                    >
                      提交
                    </Button>
                    <Button
                      onClick={() => {
                        setSubmitVisible(false);
                        submitForm.resetFields();
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </Form>
              </Card>
            </Draggable>
          )}

          {/* 渲染弹幕列表 */}
          {props.barragesList?.map((barrage, index) => {
            const barrageData = barrage?.danmu;
            const isClosestBarrage =
              props.playerCurrentTime >=
                computedOffsetTime(barrageData?.createTime) &&
              (!props.barragesList[index + 1] ||
                props.playerCurrentTime <
                  computedOffsetTime(
                    props.barragesList[index + 1]?.danmu?.createTime
                  ));

            return renderBarrageItem(
              barrage,
              index,
              isClosestBarrage,
              highlightedIndex,
              setHighlightedIndex
            );
          })}
        </>
      )}
    </div>
  );
});

export default BarragesList;
