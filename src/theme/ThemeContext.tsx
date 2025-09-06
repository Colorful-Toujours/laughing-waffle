import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ConfigProvider } from 'antd';

// 主题配置类型定义
export interface ThemeToken {
  colorPrimary: string;
  borderRadius: number;
  fontFamily: string;
}

export interface ThemeConfig {
  token: ThemeToken;
  cssVars: Record<string, string>;
}

// 主题文件类型
export type ThemeKey = 'default' | 'dark' | 'highContrast' | 'green' | 'red';


// 主题文件加载器类型
type ThemeLoader = () => Promise<{ default: ThemeConfig }>;

// 主题文件映射类型
type ThemeFiles = {
  [K in ThemeKey]: ThemeLoader;
};

// 动态导入主题配置
const themeFiles: ThemeFiles = {
  default: () => import("./themes/default.json"),
  dark: () => import("./themes/dark.json"),
  highContrast: () => import("./themes/highContrast.json"),
  green: () => import("./themes/green.json"),
  red: () => import("./themes/red.json"),
};

// 主题上下文类型
interface ThemeContextType {
  theme: ThemeConfig | null;
  themeKey: ThemeKey;
  setThemeKey: (key: ThemeKey) => void;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  isLoading: boolean;
}

// 创建上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题 Provider 组件
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeKey;
}

export function ThemeProvider({ children, defaultTheme = 'default' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [themeKey, setThemeKeyState] = useState<ThemeKey>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // 加载主题
  const loadTheme = async (key: ThemeKey): Promise<void> => {
    setIsLoading(true);
    try {
      const loader = themeFiles[key];
      if (loader) {
        const data = await loader();
        setTheme(data.default);
        // 应用 CSS 变量到根元素
        Object.entries(data.default.cssVars).forEach(([k, v]) => {
          document.documentElement.style.setProperty(k, v as string);
        });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 切换主题
  const setThemeKey = (key: ThemeKey) => {
    setThemeKeyState(key);
    loadTheme(key);
  };

  // 更新主题配置
  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setTheme((prev) => {
      if (!prev) return prev;
      const newTheme: ThemeConfig = {
        ...prev,
        ...updates,
        token: { ...prev.token, ...updates.token },
        cssVars: { ...prev.cssVars, ...updates.cssVars },
      };
      
      // 重新应用 CSS 变量
      Object.entries(newTheme.cssVars).forEach(([k, v]) => {
        document.documentElement.style.setProperty(k, v);
      });
      
      return newTheme;
    });
  };

  // 初始化主题
  useEffect(() => {
    loadTheme(themeKey);
  }, []);

  const contextValue: ThemeContextType = {
    theme,
    themeKey,
    setThemeKey,
    updateTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={theme ? { token: theme.token } : undefined}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
  }

// 自定义 Hook 用于使用主题
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// 导出主题文件映射，供其他组件使用
export { themeFiles };
