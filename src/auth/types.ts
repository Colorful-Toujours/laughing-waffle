export type Action = "create" | "read" | "update" | "delete" | "manage" | string;
export type Resource = string; // 如："project", "user", "report"

// 条件：支持基于资源字段的简单比较（等于/包含/集合包含 等）
export type Condition =
  | { field: string; op: "eq" | "neq" | "in" | "nin"; value: any }
  | { field: string; op: "includes" | "excludes"; value: any };

export type Permission = {
  id: string; // 唯一ID，便于前端缓存/差量更新
  action: Action; // 允许的动作，如 'read'
  resource: Resource; // 作用资源，如 'project'
  // 作用范围：all / own / 条件表达式（组合）
  scope?: "all" | "own";
  conditions?: Condition[]; // 多条件且逻辑（可扩展：any/all）
};

export type Role = {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
};

export type User = {
  id: string;
  name: string;
  orgId?: string;
  roles: Array<{ id: string; name: string }>; // 轻量化
  // 动态注入的个人权限（覆盖/补充角色）
  grants?: Permission[];
};

export type ResourceContext = Record<string, any>; // 用于条件判断：{ ownerId, orgId, members: [...] }

export type Policy = { user: User; permissions: Permission[] }; // 展开后的权限集
