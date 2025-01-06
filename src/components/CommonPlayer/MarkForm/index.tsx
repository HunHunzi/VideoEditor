import { Button, Card, Form, Input, message, Select } from "antd";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { CloseOutlined } from "@ant-design/icons";
import { vaOptions, annotationAdd } from "@/services/ant-design-pro/api";
import Draggable from "react-draggable";
interface MarkFormProps {
  videoStartTime: number;
  currentPointTime: number;
  anchorUid: string;
  markSource: string;
  handleVisible: () => void;
  handleDottingInfo: () => void;
}

const MarkForm: React.FC<MarkFormProps> = ({
  videoStartTime,
  currentPointTime,
  handleVisible,
}) => {
  // 提交打点结果
  const [submitForm] = Form.useForm(); // 表单
  const [markTypeList, setMarkTypeList] = useState<any[]>([
    { optionDesc: "1" },
    { optionDesc: "2" },
    { optionDesc: "3" },
  ]); // 标记类型列表
  const userInfo = ["1", "1"]; // 用户信息

  return (
    <Draggable cancel=".ant-card-body">
      <Card
        onClick={(e) => {
          e.stopPropagation();
        }}
        getPopupContainer={(triggerNode) => triggerNode.parentNode} // 添加这一行
        title={
          <div
            style={{
              marginTop: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            ✏提交标记
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={(e) => {
                handleVisible();
              }}
            />
          </div>
        }
        style={{
          position: "absolute",
          top: "35%",
          left: "35%",
          transform: "translate(-50%, -50%)",
          width: 600,
          zIndex: 9999,
          cursor: "default",
        }}
      >
        <Form form={submitForm}>
          <Form.Item label="标记时间" name="startPoint">
            <span style={{ color: "red" }}>
              {moment(videoStartTime * 1000 + currentPointTime * 1000).format(
                "YYYY-MM-DD HH:mm:ss"
              )}
            </span>
          </Form.Item>
          <Form.Item label="标记类型" name="pointType">
            <Select
              getPopupContainer={(triggerNode) => triggerNode.parentNode} // 添加这一行
              placeholder="请选择或者输入"
              mode="tags"
              style={{ width: 480 }}
              onChange={(value) => {
                if (value.length > 1) {
                  value.shift();
                }
              }}
            >
              {markTypeList?.map((item) => {
                return (
                  <Select.Option value={item.optionDesc}>
                    {item.optionDesc}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item label="描述信息" name="pointDesc">
            <Input.TextArea
              rows={4}
              style={{ resize: "none", height: 120 }}
              placeholder="请输入描述信息"
            />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="primary" style={{ marginRight: 10 }}>
              提交
            </Button>
            <Button
              onClick={() => {
                handleVisible();
                submitForm.resetFields();
              }}
            >
              取消
            </Button>
          </div>
        </Form>
      </Card>
    </Draggable>
  );
};

export default MarkForm;
