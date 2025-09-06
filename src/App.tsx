import { type FC } from 'react'
import { Tabs } from 'antd'
import { ThemeProvider } from './theme/ThemeContext'
import ThemeEditor from './theme/ThemeEditor'
import ThemedComponent from './components/ThemedComponent'
import Form from './components/Form'
import Permission from './components/Permissin'

import './App.css'
import {
   SkinOutlined,
   MobileOutlined,
   FormOutlined,
   KeyOutlined,
 } from '@ant-design/icons';
const App: FC = () => {
  return (
    <ThemeProvider defaultTheme="default">
      <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
        <Tabs
          defaultActiveKey="theme-editor"
          items={[
            {
              key: 'theme-editor',
              label: (
                <span>
                  <SkinOutlined style={{ marginRight: 8 }} />
                  主题编辑器
                </span>
              ),
              children: <ThemeEditor />,
            },
            {
              key: 'themed-components',
              label: (
                <span>
                  <MobileOutlined style={{ marginRight: 8 }} />
                  主题化组件
                </span>
              ),
              children: <ThemedComponent />,
            },
            {
              key: 'form',
              label: (
                <span>
                  <FormOutlined style={{ marginRight: 8 }} />
                  表单组件
                </span>
              ),
              children: <Form />,
            },
            {
              key: 'permission',
              label: (
                <span>
                  <KeyOutlined style={{ marginRight: 8 }} />
                  权限组件
                </span>
              ),
              children: <Permission />,
            },
          ]}
          style={{ padding: 24 }}
        />
      </div>
    </ThemeProvider>
  )
}

export default App






