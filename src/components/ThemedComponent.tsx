import React from "react";
import {
  Button,
  Card,
  Space,
  Typography,
  Input,
  Select,
  Radio,
  TimePicker,
} from "antd";
import { useTheme } from "../theme/ThemeContext";
import { SkinOutlined } from "../icon.tsx";
const { Title, Text, Paragraph } = Typography;

export default function ThemedComponent() {
  const { theme, themeKey } = useTheme();

  if (!theme) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        padding: 24,
        background: "var(--background)",
        minHeight: "100vh",
      }}
    >
      <Card
        style={{
          marginBottom: 24,
          borderRadius: theme.token.borderRadius,
          borderColor: theme.token.colorPrimary,
        }}
      >
        <Title level={2} style={{ color: "var(--brand-color)" }}>
          <SkinOutlined style={{ marginRight: 8 }} /> 主题化组件Demo
        </Title>

        <Paragraph>
          当前主题: <Text code>{themeKey}</Text>
        </Paragraph>

        <Paragraph>
          主色调: <Text code>{theme.token.colorPrimary}</Text>
        </Paragraph>

        <Paragraph>
          圆角大小: <Text code>{theme.token.borderRadius}px</Text>
        </Paragraph>

        <Paragraph>
          字体: <Text code>{theme.token.fontFamily}</Text>
        </Paragraph>
      </Card>
      <Card>
        Radio组件:
        <Radio.Group>
          <Radio value="1">选项1</Radio>
          <Radio value="2">选项2</Radio>
          <Radio value="3">选项3</Radio>
        </Radio.Group>
      </Card>
      <Card>
        TimePicker组件:
        <TimePicker />
      </Card>
      <Card
        title="表单组件Demo"
        style={{
          marginBottom: 24,
          borderRadius: theme.token.borderRadius,
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Text>输入框:</Text>
            <Input
              placeholder="这是一个输入框"
              style={{
                marginLeft: 8,
                borderRadius: theme.token.borderRadius,
              }}
            />
          </div>

          <div>
            <Text>选择器:</Text>
            <Select
              placeholder="请选择"
              style={{
                width: 200,
                marginLeft: 8,
                borderRadius: theme.token.borderRadius,
              }}
              options={[
                { label: "选项1", value: "1" },
                { label: "选项2", value: "2" },
                { label: "选项3", value: "3" },
              ]}
            />
          </div>

          <Space>
            <Button type="primary">主要按钮</Button>
            <Button>次要按钮</Button>
            <Button type="dashed">虚线按钮</Button>
            <Button type="link">链接按钮</Button>
          </Space>
        </Space>
      </Card>

      <Card
        title="自定义样式示例"
        style={{
          borderRadius: theme.token.borderRadius,
          border: `2px solid ${theme.token.colorPrimary}`,
          background: `linear-gradient(135deg, ${theme.token.colorPrimary}10, transparent)`,
        }}
      >
        <div
          style={{
            padding: 16,
            background: "var(--brand-color)",
            color: "white",
            borderRadius: theme.token.borderRadius,
            textAlign: "center",
            fontFamily: theme.token.fontFamily,
          }}
        >
          <Title level={3} style={{ color: "white", margin: 0 }}>
            这个卡片使用了主题变量
          </Title>
          <Text style={{ color: "white" }}>
            背景色、边框、圆角、字体都来自当前主题配置
          </Text>
        </div>
      </Card>
    </div>
  );
}
