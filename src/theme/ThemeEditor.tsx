import { Button, Select, Input } from 'antd';
// @ts-ignore
import { SketchPicker } from 'react-color';
import { useTheme, type ThemeKey, themeFiles } from './ThemeContext';

export default function ThemeEditor() {
  const { theme, themeKey, setThemeKey, updateTheme, isLoading } = useTheme();

  if (isLoading || !theme) {
    return <div>Loading theme...</div>;
  }

  const handleColorChange = (color: { hex: string }) => {
    updateTheme({
      token: { ...theme.token, colorPrimary: color.hex },
      cssVars: { ...theme.cssVars, '--brand-color': color.hex },
    });
  };

  const handleFontChange = (fontFamily: string) => {
    updateTheme({
      token: { ...theme.token, fontFamily },
    });
  };

  return (
    <div
      style={{
        padding: 24,
        background: 'var(--background)',
        minHeight: '100vh',
      }}
    >
      <h2 style={{ color: 'var(--brand-color)' }}>这里也会变化哈，主题编辑 CodingBear</h2>

      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>请选择主题模版:</span>
        <Select<ThemeKey>
          value={themeKey}
          style={{ width: 200 }}
          onChange={(val: ThemeKey) => setThemeKey(val)}
          options={Object.keys(themeFiles).map((key) => ({
            label: key,
            value: key as ThemeKey,
          }))}
        />
      </div>

      <div style={{ marginBottom: 16, marginLeft: 8, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <span style={{ marginRight: 8 }}>主色选择器:</span>
        <SketchPicker
          color={theme.token.colorPrimary}
          onChange={handleColorChange}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>自定义字体:</span>
        <Input
          value={theme.token.fontFamily}
          style={{ width: 240 }}
          onChange={(e) => handleFontChange(e.target.value)}
        />
      </div>

      <Button type="primary">主要Button</Button>
      <Button style={{ marginLeft: 8 }}>次要Button</Button>
    </div>
  );
}
