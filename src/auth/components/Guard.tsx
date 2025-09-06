import React from "react";
import { Result } from "antd";
import { type Action, type Resource, type ResourceContext } from "../types";
import { useCan } from "../hooks";

export default function Guard({ action, resource, ctx, children }: { action: Action; resource: Resource; ctx?: ResourceContext; children: React.ReactNode; }) {
  const pass = useCan(action, resource, ctx);
  if (!pass) return <Result status="403" title="403" subTitle="抱歉，您没有访问该资源的权限" />;
  return <>{children}</>;
}