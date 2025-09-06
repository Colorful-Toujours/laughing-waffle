import React from "react";
import { Button, Tooltip } from "antd";
import { type Action, type Resource, type ResourceContext } from "../types";
import { useCan } from "../hooks";

export default function AuthorizedButton({ action, resource, ctx, disabledWhenNoAuth = true, reason = "无权限", children, ...btnProps }: { action: Action; resource: Resource; ctx?: ResourceContext; disabledWhenNoAuth?: boolean; reason?: string; children: React.ReactNode; [k: string]: any; }) {
  const pass = useCan(action, resource, ctx);
  console.log('pass',pass);
  
  const btn = <Button {...btnProps} disabled={disabledWhenNoAuth ? !pass : btnProps.disabled}>{children}</Button>;
  return pass ? btn : <Tooltip title={reason}>{btn}</Tooltip>;
}