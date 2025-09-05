import React, { useState, useEffect } from "react";
import { ConfigProvider, Button, Select, Input } from "antd";
import { SketchPicker } from "react-color";

// 动态导入主题配置
const themeFiles = {
  default: () => import("./themes/default.json"),
//   dark: () => import("./themes/dark.json"),
//   green: () => import("./themes/green.json"),
//   red: () => import("./themes/red.json"),
//   purple: () => import("./themes/purple.json"),
//   blue: () => import("./themes/blue.json"),
//   orange: () => import("./themes/orange.json"),
//   teal: () => import("./themes/teal.json"),
//   pink: () => import("./themes/pink.json"),
//   gray: () => import("./themes/gray.json"),
//   highContrast: () => import("./themes/highContrast.json"),
};

export default function ThemeEditor() {
  const [themeKey, setThemeKey] = useState("default");
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    loadTheme(themeKey);
  }, [themeKey]);

  const loadTheme = async (key) => {
    if (themeFiles[key]) {
      const data = await themeFiles[key]();
      setTheme(data.default);
      Object.entries(data.default.cssVars).forEach(([k, v]) => {
        document.documentElement.style.setProperty(k, v);
      });
    }
  };

  const handleColorChange = (color) => {
    setTheme((prev) => {
      if (!prev) return prev;
      const newTheme = {
        ...prev,
        token: { ...prev.token, colorPrimary: color.hex },
        cssVars: { ...prev.cssVars, "--brand-color": color.hex },
      };
      Object.entries(newTheme.cssVars).forEach(([k, v]) => {
        document.documentElement.style.setProperty(k, v);
      });
      return newTheme;
    });
  };

  if (!theme) return <div>Loading theme...</div>;

  return (
    <ConfigProvider theme={{ token: theme.token }}>
      <div
        style={{
          padding: 24,
          background: "var(--background)",
          minHeight: "100vh",
        }}
      >
        <h2 style={{ color: "var(--brand-color)" }}>🎨 Theme Editor</h2>

        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>Select Preset Theme:</span>
          <Select
            value={themeKey}
            style={{ width: 200 }}
            onChange={(val) => setThemeKey(val)}
            options={Object.keys(themeFiles).map((key) => ({
              label: key,
              value: key,
            }))}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>Primary Color:</span>
          <SketchPicker
            color={theme.token.colorPrimary}
            onChange={handleColorChange}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>Custom Font:</span>
          <Input
            value={theme.token.fontFamily}
            style={{ width: 240 }}
            onChange={(e) =>
              setTheme((prev) => {
                const newTheme = {
                  ...prev,
                  token: { ...prev.token, fontFamily: e.target.value },
                };
                return newTheme;
              })
            }
          />
        </div>

        <Button type="primary">Primary Button</Button>
        <Button style={{ marginLeft: 8 }}>Secondary Button</Button>
      </div>
    </ConfigProvider>
  );
}
