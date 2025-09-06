import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type Policy, type User, type Role, type Permission } from "./types";

// 到时候改为后端API
async function fetchMe(): Promise<User> {
  return {
    id: "u_1",
    name: "顽皮熊熊",
    orgId: "org_1",
    roles: [{ id: "r_admin", name: "管理员" }],
  } as any;
}

async function fetchRoles(): Promise<Role[]> {
  return [
    {
      id: "r_admin",
      name: "管理员",
      permissions: [
        { id: "p1", action: "manage", resource: "project", scope: "all" },
        { id: "p2", action: "manage", resource: "user", scope: "all" },
      ],
    },
    {
      id: "r_pm",
      name: "项目经理",
      permissions: [
        { id: "p3", action: "create", resource: "project" },
        { id: "p4", action: "update", resource: "project", scope: "own" },
        { id: "p5", action: "read", resource: "report", conditions: [ { field: "orgId", op: "eq", value: "org_1" } ] },
      ],
    },
  ];
}

async function fetchGrants(_userId: string): Promise<Permission[]> {
  // 动态个人授权（示例：允许张三删除自己项目）
  return [ { id: "g1", action: "delete", resource: "project", scope: "own" } ];
}

export type PermissionContextValue = {
  policy: Policy | null;
  loading: boolean;
  refresh: () => Promise<void>;
  assignRoles: (userId: string, roleIds: string[]) => Promise<void>; // 动态角色分配
  upsertGrant: (userId: string, grant: Permission) => Promise<void>;  // 动态个人授权
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  const buildPolicy = useCallback(async () => {
    setLoading(true);
    const me = await fetchMe();
    const roles = await fetchRoles();
    const roleMap = new Map(roles.map((r) => [r.id, r] as const));    
    const merged: Permission[] = [];
    me.roles.forEach((r) => {
      const role = roleMap.get(r.id);
      if (role?.permissions?.length) merged.push(...role.permissions);
    });
    const grants = await fetchGrants(me.id);
    if (grants?.length) merged.push(...grants);

    const dedup = new Map<string, Permission>();
    merged.forEach((p) => dedup.set(p.id, p));
    setPolicy({ user: me, permissions: Array.from(dedup.values()) });
    setLoading(false);
  }, []);

  useEffect(() => {
    buildPolicy();
  }, [buildPolicy]);

  // 角色分配：实际应调用后端并在成功后 refresh() -管理员给用户分配新角色 -用户角色变更（升职、调岗等） -批量角色管理
  const assignRoles = useCallback(async (userId: string, roleIds: string[]) => {
    console.log("assignRoles", userId, roleIds);
    await new Promise((r) => setTimeout(r, 200));
    await buildPolicy();
  }, [buildPolicy]);
//个人授权函数 -跨角色权限补充- 给特定用户临时授权 -特殊项目权限分配
  const upsertGrant = useCallback(async (userId: string, grant: Permission) => {
    console.log("upsertGrant", userId, grant);
    await new Promise((r) => setTimeout(r, 200));
    await buildPolicy();
  }, [buildPolicy]);

  const value = useMemo<PermissionContextValue>(() => ({ policy, loading, refresh: buildPolicy, assignRoles, upsertGrant }), [policy, loading, buildPolicy, assignRoles, upsertGrant]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissionContext() {
  const ctx = useContext(PermissionContext);
  console.log('ctx',ctx);
  if (!ctx) throw new Error("usePermissionContext must be used within PermissionProvider");
  return ctx;
}
