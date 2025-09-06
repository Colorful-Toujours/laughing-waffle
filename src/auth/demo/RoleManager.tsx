import { useState } from "react";
import { Card, List, Space, Tag, Transfer, Typography, Divider, Form, Select, Button, message } from "antd";
import { usePermissionContext } from "../PermissionProvider";
import { type Permission } from "../types";

const { Title, Text } = Typography;

// 为用户分配角色，并动态添加个人授权（grant）
export default function RoleManager() {
  const { policy, assignRoles, upsertGrant } = usePermissionContext();
  const allRoles = [
    { key: "r_admin", title: "管理员" },
    { key: "r_pm", title: "项目经理" },
    { key: "r_guest", title: "访客" },
  ];
  const [target, setTarget] = useState(policy?.user.roles.map((r) => r.id) || []);

  const [form] = Form.useForm();
  console.log('form',form);
  
  const onSaveRoles = async () => {
    await assignRoles(policy!.user.id, target);
    message.success("角色已更新");
  };

  const onGrant = async (v: any) => {
    console.log('执行个人授权');
    
    const grant: Permission = {
      id: `grant_${Date.now()}`,
      action: v.action,
      resource: v.resource,
      scope: v.scope,
      conditions: v.orgOnly ? [{ field: "orgId", op: "eq", value: policy?.user.orgId }] : undefined,
    };
    await upsertGrant(policy!.user.id, grant);
    message.success("个人授权已更新");
    form.resetFields();
  };

  return (
    <Space direction="vertical" className="w-full">
      <Card>
        <Title level={5}>为用户分配角色</Title>
        <Transfer
          dataSource={allRoles}
          titles={["待选", "已分配"]}
          targetKeys={target}
          onChange={(targetKeys) => setTarget(targetKeys as string[])}
          render={(item) => item.title}
          listStyle={{ width: 260, height: 200 }}
        />
        <Divider />
        <Button type="primary" onClick={onSaveRoles}>保存角色</Button>
      </Card>

      <Card>
        <Title level={5}>添加个人授权（更细粒度）</Title>
        <Form form={form} layout="inline" onFinish={onGrant}>
          <Form.Item name="resource" label="资源" rules={[{ required: true }]}>
            <Select style={{ width: 160 }} options={[{ value: "project", label: "项目" }, { value: "report", label: "报表" }, { value: "user", label: "用户" }]} />
          </Form.Item>
          <Form.Item name="action" label="动作" rules={[{ required: true }]}>
            <Select style={{ width: 160 }} options={["create","read","update","delete","manage"].map(x=>({value:x,label:x}))} />
          </Form.Item>
          <Form.Item name="scope" label="范围" rules={[{ required: true }]}>
            <Select style={{ width: 160 }} options={[{value:"all",label:"全部"},{value:"own",label:"仅本人"}]} />
          </Form.Item>
          <Form.Item name="orgOnly" valuePropName="checked">
            <Select style={{ display: "none" }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">授权</Button>
          </Form.Item>
        </Form>
        <Text type="secondary">可扩展更多条件（如部门、标签、成员集合等），通过 conditions 传入</Text>
      </Card>

      <Card>
        <Title level={5}>当前有效权限</Title>
        <List
          size="small"
          dataSource={policy?.permissions || []}
          renderItem={(p) => (
            <List.Item>
              <Space>
                <Tag color="blue">{p.resource}</Tag>
                <Tag color="green">{p.action}</Tag>
                {p.scope && <Tag color="geekblue">{p.scope}</Tag>}
                {p.conditions?.length ? <Text type="secondary">{JSON.stringify(p.conditions)}</Text> : null}
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}