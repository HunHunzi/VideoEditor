import React, { useEffect } from "react";
import { List, Avatar, Button, Select, Card } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import Draggable from "react-draggable";
import { message } from "antd";

import "./index.module.css";

interface DetailCardProps {
  detailData: any;
  isBypass: boolean;
  handleCancel: (value: boolean) => void;
}

const DetailCard: React.FC<DetailCardProps> = (props) => {
  const [cardData, setCardData] = React.useState<any>({});
  const [preDanmuData, setPreDanmuData] = React.useState<any[]>([]);
  const [danmuType, setDanmuType] = React.useState<string>("");
  const [diaglogHistory, setDiaglogHistory] = React.useState<any[]>([]);

  useEffect(() => {
    if (!props.detailData) {
      message.error("未获取到数据");
    }
  }, [props.detailData]);

  return (
    <Draggable cancel=".ant-card-body">
      <Card
        className="thin-scrollbar"
        headStyle={{
          position: "sticky", // 添加这一行
          top: 0, // 添加这一行
          backgroundColor: "#fff", // 添加这一行，保证标题在内容滚动时不透明
          zIndex: 10,
        }}
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 18,
              color: "#40a9ff",
            }}
          >
            NPC详情{props.isBypass ? "（旁路）" : ""}
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => {
                // 通知父组件关闭
                props.handleCancel(false);
              }}
            />
          </div>
        }
        style={{
          zIndex: 100,
          position: "fixed",
          // top: '15%',
          left: 600,
          width: 600,
          height: { danmuType } == 11 ? 500 : 650,
          borderRadius: 5,
          overflow: "auto",
          maxHeight: "95vh",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          transform: "translateX(-50%)",
        }}
      >
        {danmuType == 11 ? (
          <List>
            <List.Item>
              <List.Item.Meta
                title="NPC信息"
                description={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      src={cardData?.npcAvatarUrl}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 25,
                        marginRight: "10px",
                      }}
                    />
                    <div>
                      <span>{cardData?.npcName}</span>
                      <br />
                      <span>{cardData?.npcUid}</span>
                    </div>
                  </div>
                }
              />
            </List.Item>

            <List.Item>
              <List.Item.Meta
                title="触发类型"
                description={cardData?.triggerType}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title="礼物名称"
                description={cardData?.giftName}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title="礼物数量"
                description={cardData?.giftSize}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title="礼物价值"
                description={Number(cardData?.giftPrice).toFixed(2) + "元"}
              />
            </List.Item>
          </List>
        ) : (
          <List>
            <List.Item>
              <List.Item.Meta
                title="NPC信息"
                description={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      src={cardData?.npcAvatarUrl}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 25,
                        marginRight: "10px",
                      }}
                    />
                    <div>
                      <span>{cardData?.npcName}</span>
                      <br />
                      <span>{cardData?.npcUid}</span>
                    </div>
                  </div>
                }
              />
            </List.Item>

            {danmuType != 6 ? (
              <>
                {cardData?.npcType && (
                  <List.Item>
                    <List.Item.Meta
                      title="NPC类型"
                      description={cardData.npcType}
                    />
                  </List.Item>
                )}
                {cardData?.npcCharacter && (
                  <List.Item>
                    <List.Item.Meta
                      title="NPC性格特征"
                      description={cardData.npcCharacter}
                    />
                  </List.Item>
                )}
                {cardData?.llmManufacturer && (
                  <List.Item>
                    <List.Item.Meta
                      title="模型厂商"
                      description={cardData.llmManufacturer}
                    />
                  </List.Item>
                )}
                {cardData?.llmModel && (
                  <List.Item>
                    <List.Item.Meta
                      title="NPC模型"
                      description={cardData.llmModel}
                    />
                  </List.Item>
                )}
              </>
            ) : (
              ""
            )}
            <List.Item>
              <List.Item.Meta
                title="触发类型"
                description={cardData?.triggerType}
              />
            </List.Item>
            <List.Item>
              {preDanmuData?.type == 100 ? (
                <List.Item.Meta
                  title={"触发事件："}
                  description={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ fontWeight: "bold" }}>
                        {preDanmuData?.content}
                      </span>
                    </div>
                  }
                />
              ) : danmuType == 6 ? (
                <List.Item.Meta
                  title={"触发条件："}
                  description={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={preDanmuData?.userInfo?.avatarUrl}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 25,
                          marginRight: "10px",
                        }}
                      />
                      <div>
                        <span>{preDanmuData?.userInfo?.nick} </span>
                        <span>{preDanmuData?.userInfo?.uid}</span>
                        <br />
                        <span style={{ fontWeight: "bold" }}>
                          赠送{cardData?.totalPay}虎牙币等值礼物
                        </span>
                      </div>
                    </div>
                  }
                />
              ) : (
                <List.Item.Meta
                  title={"原始弹幕"}
                  description={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div>
                        <Avatar
                          src={preDanmuData?.userInfo?.avatarUrl}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 25,
                            marginRight: "10px",
                          }}
                        />
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <span>{preDanmuData?.userInfo?.nick} </span>
                        <span>{preDanmuData?.userInfo?.uid}</span>
                        <br />
                        <div style={{ fontWeight: "bold" }}>
                          {preDanmuData?.content}
                        </div>
                      </div>
                    </div>
                  }
                />
              )}
            </List.Item>

            {Array.isArray(diaglogHistory) && diaglogHistory.length > 0 && (
              <List.Item>
                <List.Item.Meta
                  title="对话列表"
                  description={
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        textAlign: "left",
                        width: "100%",
                        height: "100%",
                        userSelect: "text",
                      }}
                    >
                      {Array.isArray(diaglogHistory) &&
                        diaglogHistory.map((item, index) => (
                          <div key={index}>
                            <span style={{ fontWeight: "bold" }}>
                              {item.question.userName}：{" "}
                            </span>
                            <span>{item.question.text}</span>
                            <br />
                            <span style={{ fontWeight: "bold" }}>
                              {item.answer.userName}：{" "}
                            </span>
                            <span>{item.answer.text}</span>
                            <br />
                          </div>
                        ))}
                    </div>
                  }
                />
              </List.Item>
            )}

            {danmuType != 6 && (
              <>
                <List.Item>
                  <List.Item.Meta
                    title="SystemPrompt"
                    description={
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          textAlign: "left",
                          width: "100%",
                          height: "100%",
                          userSelect: "text",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: cardData?.systemPrompt
                            ? cardData?.systemPrompt.replace(/\\n/g, "<br />")
                            : "",
                        }}
                      ></div>
                    }
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    title="UserPrompt"
                    description={
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          textAlign: "left",
                          width: "100%",
                          height: "100%",
                          userSelect: "text",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: cardData?.userPrompt
                            ? cardData?.userPrompt.replace(/\\n/g, "<br />")
                            : "",
                        }}
                      ></div>
                    }
                  />
                </List.Item>
              </>
            )}
          </List>
        )}
      </Card>
    </Draggable>
  );
};

export default DetailCard;
