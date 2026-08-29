export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });
  if (getRequestURL(event).pathname.startsWith("/api/workspace")) {
    setResponseHeader(event, "Cache-Control", "no-store, private");
  }
});
