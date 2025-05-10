import { IncomingMessage, ServerResponse } from "http";

export const handleRequest = (
  req: IncomingMessage,
  res: ServerResponse,
  parsedUrl: URL
) => {
  const path = parsedUrl.pathname || "";
  const method = req.method || "";
  const id = parsedUrl.searchParams.get("id") || "";

  res.setHeader("Content-Type", "application/json");

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  if (path.startsWith("/api/user")) {
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not Found" }));
  }
};
