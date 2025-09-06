import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Tooltip,
  Cascader,
  Table,
  Collapse,
  Divider,
  message,
  Switch,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  SaveOutlined,
  ReloadOutlined,
  FilterOutlined,
  DownloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

// --- Mock dataset -----------------------------------------------------------
const MOCK_DATA = Array.from({ length: 120 }).map((_, i) => ({
  id: i + 1,
  title: `记录-${i + 1}`,
  category: ["神经外科", "肿瘤", "内分泌"][i % 3],
  status: ["active", "paused", "archived"][i % 3],
  owner: ["张三", "李四", "王五"][i % 3],
  score: Math.round(Math.random() * 100),
  createdAt: dayjs().subtract(i, "day").toISOString(),
}));

// --- Utils -----------------------------------------------------------------
const FIELD_OPTIONS = [
  { label: "标题", value: "title", type: "text" },
  { label: "负责人", value: "owner", type: "text" },
  { label: "状态", value: "status", type: "select", options: [
      { label: "active", value: "active" },
      { label: "paused", value: "paused" },
      { label: "archived", value: "archived" },
    ] },
  { label: "类别", value: "category", type: "cascader", options: [
      { value: "外科", label: "外科", children: [
        { value: "神经外科", label: "神经外科" },
        { value: "骨科", label: "骨科" },
      ] },
      { value: "内科", label: "内科", children: [
        { value: "内分泌", label: "内分泌" },
        { value: "呼吸", label: "呼吸" },
      ] },
    ] },
  { label: "评分", value: "score", type: "number" },
  { label: "创建时间", value: "createdAt", type: "daterange" },
];

const OPERATORS: Record<string, Array<{ label: string; value: string }>> = {
  text: [
    { label: "包含", value: "contains" },
    { label: "不包含", value: "not_contains" },
    { label: "等于", value: "eq" },
    { label: "不等于", value: "neq" },
  ],
  select: [
    { label: "是", value: "eq" },
    { label: "不是", value: "neq" },
    { label: "属于(多选)", value: "in" },
    { label: "不属于(多选)", value: "not_in" },
  ],
  number: [
    { label: "等于", value: "eq" },
    { label: ">=", value: "gte" },
    { label: "<=", value: "lte" },
    { label: "介于", value: "between" },
  ],
  daterange: [
    { label: "介于", value: "between" },
    { label: "早于", value: "before" },
    { label: "晚于", value: "after" },
  ],
  cascader: [
    { label: "包含于", value: "in" },
    { label: "不包含于", value: "not_in" },
  ],
};

function fieldMeta(field?: string) {
  return FIELD_OPTIONS.find((f) => f.value === field);
}

function toTags(values: any) {
  const tags: Array<{ key: string; label: string; onClose?: () => void } | null> = [];
  if (values.keyword) {
    tags.push({ key: "keyword", label: `关键词: ${values.keyword}` });
  }
  if (values.dateRange?.length === 2) {
    tags.push({
      key: "dateRange",
      label: `时间: ${values.dateRange[0].format("YYYY-MM-DD")} ~ ${values.dateRange[1].format("YYYY-MM-DD")}`,
    });
  }
  (values.rules || []).forEach((r: any, idx: number) => {
    if (!r || !r.field) return;
    const meta = fieldMeta(r.field);
    const name = meta?.label || r.field;
    let valStr = "";
    if (meta?.type === "daterange" && r.value?.length === 2) {
      valStr = `${r.value[0].format("YYYY-MM-DD")} ~ ${r.value[1].format("YYYY-MM-DD")}`;
    } else if (Array.isArray(r.value)) {
      valStr = r.value.join("/");
    } else if (typeof r.value === "object" && r.value?.join) {
      valStr = r.value.join("/");
    } else {
      valStr = r.value ?? "";
    }
    tags.push({ key: `rule-${idx}`, label: `${name} ${r.op || ""} ${valStr}` });
  });
  return tags.filter(Boolean) as Array<{ key: string; label: string }>;
}

function applyFilters(data: any[], v: any) {
  const rules = (v.rules || []).filter((r: any) => r && r.field);
  return data.filter((row) => {
    // keyword search
    if (v.keyword) {
      const k = String(v.keyword).toLowerCase();
      const hit = [row.title, row.owner, row.category, row.status]
        .map((x) => String(x).toLowerCase())
        .some((s) => s.includes(k));
      if (!hit) return false;
    }

    // date range filter (global)
    if (v.dateRange?.length === 2) {
      const [start, end] = v.dateRange;
      const d = dayjs(row.createdAt);
      if (d.isBefore(start, "day") || d.isAfter(end, "day")) return false;
    }

    // rule-based filters
    for (const r of rules) {
      const meta = fieldMeta(r.field);
      const value = row[r.field];
      const op = r.op;
      const rv = r.value;
      if (!meta) continue;
      const type = meta.type;

      const asText = (x: any) => String(x ?? "").toLowerCase();

      if (type === "text") {
        const l = asText(value);
        const rvText = asText(rv);
        if (
          (op === "contains" && !l.includes(rvText)) ||
          (op === "not_contains" && l.includes(rvText)) ||
          (op === "eq" && l !== rvText) ||
          (op === "neq" && l === rvText)
        )
          return false;
      }

      if (type === "select") {
        if (
          (op === "eq" && value !== rv) ||
          (op === "neq" && value === rv) ||
          (op === "in" && !rv?.includes?.(value)) ||
          (op === "not_in" && rv?.includes?.(value))
        )
          return false;
      }

      if (type === "number") {
        if (
          (op === "eq" && Number(value) !== Number(rv)) ||
          (op === "gte" && Number(value) < Number(rv)) ||
          (op === "lte" && Number(value) > Number(rv)) ||
          (op === "between" && !(Number(value) >= Number(rv?.[0]) && Number(value) <= Number(rv?.[1])))
        )
          return false;
      }

      if (type === "cascader") {
        const flat = Array.isArray(value) ? value : [value];
        if (
          (op === "in" && !rv?.some?.((seg: any) => flat.includes(seg?.at?.(-1) ?? seg))) ||
          (op === "not_in" && rv?.some?.((seg: any) => flat.includes(seg?.at?.(-1) ?? seg)))
        )
          return false;
      }

      if (type === "daterange") {
        const d = dayjs(value);
        if (
          (op === "before" && !d.isBefore(rv?.[0], "day")) ||
          (op === "after" && !d.isAfter(rv?.[1], "day")) ||
          (op === "between" && !(d.isAfter(rv?.[0].subtract(1, "day")) && d.isBefore(rv?.[1].add(1, "day"))))
        )
          return false;
      }
    }

    return true;
  });
}

const PRESET_KEY = "advanced-search-presets";

export default function AdvancedSearch() {
  const [form] = Form.useForm();
  const [compact, setCompact] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRESET_KEY);
      if (raw) setPresets(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    // simulate async search
    setTimeout(() => setLoading(false), 400);
  };

  const values = Form.useWatch([], form);

  const data = useMemo(() => applyFilters(MOCK_DATA, values || {}), [values]);

  const tags = useMemo(() => toTags(values || {}), [values]);

  const columns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "标题", dataIndex: "title" },
    { title: "负责人", dataIndex: "owner" },
    { title: "状态", dataIndex: "status" },
    { title: "类别", dataIndex: "category" },
    {
      title: "评分",
      dataIndex: "score",
      sorter: (a: any, b: any) => a.score - b.score,
      width: 120,
    },
    { title: "创建时间", dataIndex: "createdAt", render: (v: string) => dayjs(v).format("YYYY-MM-DD") },
  ];

  const savePreset = async (name: string) => {
    const v = form.getFieldsValue();
    const next = [...presets, { id: Date.now(), name, payload: v }];
    setPresets(next);
    localStorage.setItem(PRESET_KEY, JSON.stringify(next));
    message.success("已保存筛选器");
  };

  const removePreset = (id: number) => {
    const next = presets.filter((p) => p.id !== id);
    setPresets(next);
    localStorage.setItem(PRESET_KEY, JSON.stringify(next));
  };

  const loadPreset = (payload: any) => {
    form.setFieldsValue(payload);
    setDrawerOpen(false);
  };

  const exportParams = () => {
    const v = form.getFieldsValue();
   
    const params = new URLSearchParams();
    Object.entries(v).forEach(([k, val]) => {
      if (!val || (Array.isArray(val) && val.length === 0)) return;
      if (dayjs.isDayjs(val)) params.set(k, val.toISOString());
      else if (Array.isArray(val) && val[0] && dayjs.isDayjs(val[0]))
        params.set(k, val.map((d: any) => d.toISOString()).join(","));
      else params.set(k, typeof val === "object" ? JSON.stringify(val) : String(val));
    });
    navigator.clipboard.writeText(params.toString());
    message.success("查询参数已复制到剪贴板");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-semibold">高级搜索</div>
        <Space>
          <Tooltip title={compact ? "切换到展开布局" : "切换到紧凑布局"}>
            <Button icon={<SettingOutlined />} onClick={() => setCompact((v) => !v)} />
          </Tooltip>
          <Tooltip title="保存为筛选器">
            <Button icon={<SaveOutlined />} onClick={() => setDrawerOpen(true)} />
          </Tooltip>
          <Tooltip title="导出为URL参数">
            <Button icon={<DownloadOutlined />} onClick={exportParams} />
          </Tooltip>
          <Tooltip title="重置">
            <Button icon={<ReloadOutlined />} onClick={() => form.resetFields()} />
          </Tooltip>
        </Space>
      </div>

      <Form
        form={form}
        layout={compact ? "inline" : "vertical"}
        onFinish={onFinish}
        initialValues={{ rules: [{ field: "status", op: "eq", value: "active" }] }}
      >
        <Space wrap className="w-full">
          <Form.Item name="keyword" label="关键词">
            <Input allowClear placeholder="标题/负责人/类别/状态..." style={{ width: 280 }} />
          </Form.Item>

          <Form.Item name="dateRange" label="时间范围">
            <DatePicker.RangePicker />
          </Form.Item>

          <Collapse ghost className="w-full">
            <Collapse.Panel header={<span className="text-gray-700"><FilterOutlined /> 自定义规则</span>} key="rules">
              <Form.List name="rules">
                {(fields, { add, remove }) => (
                  <div className="space-y-3">
                    {fields.map(({ key, name, ...rest }) => {
                      const current = form.getFieldValue(["rules", name]);
                      const meta = fieldMeta(current?.field);
                      return (
                        <Space key={key} align="start" wrap>
                          <Form.Item {...rest} name={[name, "field"]} rules={[{ required: true, message: "请选择字段" }]}>
                            <Select placeholder="字段" style={{ width: 160 }} options={FIELD_OPTIONS.map(({ label, value }) => ({ label, value }))} />
                          </Form.Item>

                          <Form.Item shouldUpdate noStyle>
                            {() => (
                              <Form.Item name={[name, "op"]} rules={[{ required: true, message: "请选择运算符" }]}> 
                                <Select placeholder="运算符" style={{ width: 140 }}
                                  options={OPERATORS[meta?.type || "text"]} />
                              </Form.Item>
                            )}
                          </Form.Item>

                          <Form.Item shouldUpdate noStyle>
                            {() => (
                              <Form.Item name={[name, "value"]} rules={[{ required: true, message: "请输入/选择值" }]}> 
                                {meta?.type === "text" && (
                                  <Input placeholder="文本" style={{ width: 220 }} />
                                )}
                                {meta?.type === "select" && (
                                  <Select
                                    mode={form.getFieldValue(["rules", name, "op"])?.includes("in") ? "multiple" : undefined}
                                    placeholder="状态"
                                    style={{ width: 220 }}
                                    options={fieldMeta("status")?.options as any}
                                  />
                                )}
                                {meta?.type === "number" && (
                                  form.getFieldValue(["rules", name, "op"]) === "between" ? (
                                    <Space>
                                      <InputNumber placeholder="最小" />
                                      <InputNumber placeholder="最大" />
                                    </Space>
                                  ) : (
                                    <InputNumber placeholder="数值" style={{ width: 220 }} />
                                  )
                                )}
                                {meta?.type === "cascader" && (
                                  <Cascader style={{ width: 260 }} options={fieldMeta("category")?.options as any} changeOnSelect multiple showSearch placeholder="选择类别" />
                                )}
                                {meta?.type === "daterange" && (
                                  <DatePicker.RangePicker />
                                )}
                              </Form.Item>
                            )}
                          </Form.Item>

                          <Button icon={<DeleteOutlined />} danger onClick={() => remove(name)} />
                        </Space>
                      );
                    })}
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({})}>添加规则</Button>
                  </div>
                )}
              </Form.List>
            </Collapse.Panel>
          </Collapse>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>搜索</Button>
              <Button htmlType="button" onClick={() => form.resetFields()}>重置</Button>
            </Space>
          </Form.Item>
        </Space>
      </Form>

      {tags.length > 0 && (
        <div className="mt-3">
          <Space wrap>
            {tags.map((t) => (
              <Tag key={t.key} closable onClose={(e) => e.preventDefault()}>{t.label}</Tag>
            ))}
          </Space>
        </div>
      )}

      <Divider />

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns as any}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <Drawer
        title="保存筛选器"
        placement="right"
        width={420}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <Form
          onFinish={(v) => savePreset(v.name)}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item name="name" label="筛选器名称" rules={[{ required: true, message: "请输入名称" }]}>
            <Input placeholder="例如：活跃-近30天-评分>60" />
          </Form.Item>
          <Space>
            <Button type="primary" icon={<SaveOutlined />} htmlType="submit">保存</Button>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
          </Space>
        </Form>

        <Divider />
        <div className="text-sm text-gray-500 mb-2">已保存</div>
        <Space direction="vertical" className="w-full">
          {presets.length === 0 && <div className="text-gray-400">暂无筛选器</div>}
          {presets.map((p) => (
            <div key={p.id} className="border rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">{dayjs(p.id).format("YYYY-MM-DD HH:mm")}</div>
              </div>
              <Space>
                <Button size="small" onClick={() => loadPreset(p.payload)}>应用</Button>
                <Button size="small" danger onClick={() => removePreset(p.id)}>删除</Button>
              </Space>
            </div>
          ))}
        </Space>
      </Drawer>
    </div>
  );
}
