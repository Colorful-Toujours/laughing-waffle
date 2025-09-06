import React from "react";
import { Layout, Card, Space, Typography } from "antd";
import { PermissionProvider } from "../auth/PermissionProvider";
import Can from "../auth/components/Can";
import Guard from "../auth/components/Guard";
import AuthorizedButton from "../auth/components/AuthorizedButton";
import RoleManager from "../auth/demo/RoleManager";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function App() {
  const project = {
    id: "p_1",
    ownerId: "u_1",
    orgId: "org_1",
    members: ["u_1", "u_2"],
  };
  return (
    <PermissionProvider>
      <Layout style={{ minHeight: "100vh" }}>
        <Header style={{ color: "#fff", fontSize: 18 }}>
          RBAC 权限处理 Ready go 
        </Header>
        <Content style={{ padding: 24 }}>
          <Space direction="vertical" size="large" className="w-full">
            <Card>
              <Title level={4}>页面按钮权限</Title>
              <Space>
                <AuthorizedButton
                  type="primary"
                  action="create"
                  resource="project"
                >
                  新建项目
                </AuthorizedButton>
                <AuthorizedButton
                  action="update"
                  resource="project"
                  ctx={{ ownerId: project.ownerId }}
                >
                  编辑我的项目
                </AuthorizedButton>
                <AuthorizedButton
                  danger
                  action="delete"
                  resource="project"
                  ctx={{ ownerId: project.ownerId }}
                >
                  删除我的项目
                </AuthorizedButton>
                <AuthorizedButton
                  action="read"
                  resource="report"
                  ctx={{ orgId: project.orgId }}
                >
                  查看报表
                </AuthorizedButton>
              </Space>
            </Card>

            <Card>
              <Title level={4}>区域访问控制</Title>
              <Guard
                action="read"
                resource="report"
                ctx={{ orgId: project.orgId }}
              >
                <Paragraph>
                  只有有报表读取权限且满足 orgId 条件的用户能看到这段内容。
                </Paragraph>
              </Guard>
            </Card>

            <Card>
              <Title level={4}>基于表达式的细粒度控制</Title>
              <Paragraph>
                可在 Permission.conditions 中配置如：
                <code>{`{ field: 'members', op: 'includes', value: userId }`}</code>
                ， 用于实现“仅团队成员可见”之类的规则。
              </Paragraph>
              <Can
                action="read"
                resource="project"
                ctx={{ members: project.members }}
              >
                <Paragraph>我是团队成员可见的内容。</Paragraph>
              </Can>
            </Card>

            <RoleManager />
          </Space>
        </Content>
      </Layout>
    </PermissionProvider>
  );
}
