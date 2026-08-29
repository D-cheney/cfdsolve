export function assertLocalWorkspaceRequest(
  event: Parameters<typeof getRequestHeader>[0],
) {
  if (process.env.CFDSOLVE_ALLOW_LAN === "true") return;
  const rawHost = String(getRequestHeader(event, "host") || "").toLowerCase();
  const host = rawHost.startsWith("[")
    ? rawHost.slice(1, rawHost.indexOf("]"))
    : rawHost.split(":")[0];
  if (!["127.0.0.1", "localhost", "::1"].includes(host)) {
    throw createError({
      statusCode: 403,
      message: "工作区接口仅允许本机访问",
    });
  }
  const address = getRequestIP(event, { xForwardedFor: false });
  if (address && !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address)) {
    throw createError({
      statusCode: 403,
      message: "工作区接口仅允许本机访问",
    });
  }
}

export function assertSameOriginWorkspaceWrite(
  event: Parameters<typeof getRequestHeader>[0],
) {
  assertLocalWorkspaceRequest(event);
  const origin = getRequestHeader(event, "origin");
  const host = String(getRequestHeader(event, "host") || "").toLowerCase();
  const fetchSite = String(
    getRequestHeader(event, "sec-fetch-site") || "",
  ).toLowerCase();
  if (fetchSite === "cross-site")
    throw createError({ statusCode: 403, message: "拒绝跨站工作区写入" });
  if (!origin) return;
  try {
    if (new URL(origin).host.toLowerCase() !== host)
      throw new Error("origin mismatch");
  } catch {
    throw createError({ statusCode: 403, message: "工作区写入来源无效" });
  }
}
