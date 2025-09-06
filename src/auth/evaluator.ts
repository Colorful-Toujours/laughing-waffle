import { type ResourceContext, type Condition, type Policy, type Action, type Resource } from './types';

export function matchCondition(ctx: ResourceContext, c: Condition): boolean {
    const v = ctx?.[c.field];
    switch (c.op) {
      case "eq":
        return v === c.value;
      case "neq":
        return v !== c.value;
      case "in":
        return Array.isArray(c.value) && c.value.includes?.(v);
      case "nin":
        return Array.isArray(c.value) && !c.value.includes?.(v);
      case "includes":
        return Array.isArray(v) && v.includes?.(c.value);
      case "excludes":
        return Array.isArray(v) && !v.includes?.(c.value);
      default:
        return false;
    }
  }
  
  export function canEvaluate(
    policy: Policy | null,
    action: Action,
    resource: Resource,
    ctx: ResourceContext = {}
  ): boolean {
    if (!policy) return false;
    const list = policy.permissions.filter((p: any) => p.resource === resource);
    // manage 视为所有动作的超级权限
    const needed = new Set([action, "manage"]);
    for (const p of list) {
      if (!needed.has(p.action)) continue;
  
      // scope 处理
      if (p.scope === "own" && policy.user?.id && ctx?.ownerId) {
        if (policy.user.id !== ctx.ownerId) continue; // 非本人，跳过
      }
  
      // 条件判断（全部条件满足）
      if (p.conditions?.length) {
        const passAll = p.conditions.every((c: any) => matchCondition(ctx, c));
        if (!passAll) continue;
      }
  
      return true;
    }
    return false;
  }