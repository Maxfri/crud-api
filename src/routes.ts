import { IncomingMessage, ServerResponse } from "http";
import { UserWithoutId, PartialUser } from "./types/user";
import { parseRequestBody } from "./utils/requestParser";
import { handleGetRequest } from "./handlers";

export const handleRequest = async (
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
    const body = await parseRequestBody<UserWithoutId | PartialUser>(req);

    switch (method) {
      case "GET":
        return handleGetRequest(id, res);

      default:
        res.writeHead(405);
        res.end(JSON.stringify({ error: "Method Not Allowed" }));
        break;
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not Found" }));
  }
};
