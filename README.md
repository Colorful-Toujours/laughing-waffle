# 主题系统使用指南

## 概述

这个主题系统提供了完整的 TypeScript 类型支持，可以在整个应用中统一管理主题配置。

## 核心文件

- `ThemeContext.tsx` - 主题上下文和 Provider
- `ThemeEditor.tsx` - 主题编辑器组件
- `themes/*.json` - 主题配置文件

## 如何在组件中使用主题

### 1. 基本用法

```tsx
import { useTheme } from '../theme/ThemeContext';

function MyComponent() {
  const { theme, themeKey, setThemeKey, updateTheme } = useTheme();
  
  if (!theme) return <div>Loading...</div>;
  
  return (
    <div style={{ 
      color: theme.token.colorPrimary,
      borderRadius: theme.token.borderRadius,
      fontFamily: theme.token.fontFamily 
    }}>
      <h1>当前主题: {themeKey}</h1>
    </div>
  );
}
```

### 2. 使用 CSS 变量

```tsx
function MyComponent() {
  return (
    <div style={{ 
      background: 'var(--background)',
      color: 'var(--brand-color)',
      padding: 16,
      borderRadius: 'var(--border-radius)' // 如果定义了的话
    }}>
      这个组件会自动使用当前主题的 CSS 变量
    </div>
  );
}
```

### 3. 动态切换主题

```tsx
import { Select } from 'antd';
import { useTheme, ThemeKey } from '../theme/ThemeContext';

function ThemeSwitcher() {
  const { themeKey, setThemeKey } = useTheme();
  
  return (
    <Select<ThemeKey>
      value={themeKey}
      onChange={setThemeKey}
      options={[
        { label: '默认主题', value: 'default' },
        { label: '深色主题', value: 'dark' },
        { label: '高对比度', value: 'highContrast' },
      ]}
    />
  );
}
```

### 4. 动态更新主题配置

```tsx
function ColorPicker() {
  const { theme, updateTheme } = useTheme();
  
  const handleColorChange = (color: string) => {
    updateTheme({
      token: { ...theme?.token, colorPrimary: color },
      cssVars: { ...theme?.cssVars, '--brand-color': color }
    });
  };
  
  return (
    <input 
      type="color" 
      value={theme?.token.colorPrimary}
      onChange={(e) => handleColorChange(e.target.value)}
    />
  );
}
```

## 主题配置结构

```typescript
interface ThemeConfig {
  token: {
    colorPrimary: string;    // 主色调
    borderRadius: number;    // 圆角大小
    fontFamily: string;      // 字体
  };
  cssVars: Record<string, string>; // CSS 变量
}
```

## 添加新主题

1. 在 `themes/` 目录下创建新的 JSON 文件
2. 在 `ThemeContext.tsx` 中添加新的主题键
3. 更新 `ThemeKey` 类型定义

```typescript
// 1. 创建 themes/green.json
{
  "token": {
    "colorPrimary": "#52c41a",
    "borderRadius": 8,
    "fontFamily": "Arial, sans-serif"
  },
  "cssVars": {
    "--brand-color": "#52c41a",
    "--background": "#f6ffed"
  }
}

// 2. 更新 ThemeContext.tsx
export type ThemeKey = 'default' | 'dark' | 'highContrast' | 'green';

const themeFiles: ThemeFiles = {
  // ... 其他主题
  green: () => import("./themes/green.json"),
};
```

## 最佳实践

1. **优先使用 CSS 变量**：对于样式，优先使用 CSS 变量而不是直接访问 `theme.token`
2. **类型安全**：始终使用 TypeScript 类型，避免运行时错误
3. **性能优化**：主题切换时会重新渲染所有使用 `useTheme` 的组件，避免在频繁更新的组件中使用
4. **默认值处理**：始终检查 `theme` 是否为 `null`，提供加载状态

## 注意事项

- 确保所有使用主题的组件都被 `ThemeProvider` 包裹
- CSS 变量会自动应用到 `document.documentElement`
- 主题切换是全局的，会影响整个应用
- 自定义主题配置会覆盖默认配置，但不会影响其他主题
