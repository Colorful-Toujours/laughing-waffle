import { useMemo } from "react";
import { type Action, type Resource, type ResourceContext } from "./types";
import { usePermissionContext } from "./PermissionProvider";
import { canEvaluate } from "./evaluator";

export function useCan(action: Action, resource: Resource, ctx: ResourceContext = {}) {
  const { policy } = usePermissionContext();
  return useMemo(() => canEvaluate(policy, action, resource, ctx), [policy, action, resource, JSON.stringify(ctx)]);
}

export function usePolicy() {
  const { policy } = usePermissionContext();
  return policy;
}