import React from "react";
// import { Navigate } from "react-router-dom"; // 需要安装 react-router-dom
import { type Action, type Resource, type ResourceContext } from "../types";
import { useCan } from "../hooks";

export default function AuthorizedRoute({ action, resource, ctx, children, redirect = "/403" }: { action: Action; resource: Resource; ctx?: ResourceContext; children: React.ReactNode; redirect?: string; }) {
  const pass = useCan(action, resource, ctx);
  // 临时实现：没有路由时显示权限提示
  return pass ? <>{children}</> : <div>无权限访问，请重定向到: {redirect}</div>;
}