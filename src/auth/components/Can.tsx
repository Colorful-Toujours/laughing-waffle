import React from "react";
import { type Action, type Resource, type ResourceContext } from "../types";
import { useCan } from "../hooks";

export default function Can({ action, resource, ctx, children, fallback = null }: { action: Action; resource: Resource; ctx?: ResourceContext; children: React.ReactNode; fallback?: React.ReactNode; }) {
  const pass = useCan(action, resource, ctx);
  return <>{pass ? children : fallback}</>;
}