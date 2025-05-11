import { IncomingMessage, ServerResponse } from "http";
import { UserWithoutId, PartialUser } from "./types/user";
import { parseRequestBody } from "./utils/requestParser";
import { handleGetRequest, handlePostRequest } from "./handlers";

export const handleRequest = async (
  req: IncomingMessage,
  res: ServerResponse,
  parsedUrl: URL
) => {
  const path = parsedUrl.pathname || "";
  const method = req.method || "";
  const id = parsedUrl.searchParams.get("id") || "";
  const allowedOrigins = ["http://localhost:5173", "*"];
  const origin = req.headers.origin || "";

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (path.startsWith("/api/user")) {
    const body = await parseRequestBody<UserWithoutId | PartialUser>(req);

    switch (method) {
      case "GET":
        return handleGetRequest(id, res);
      case "POST":
        return handlePostRequest(body, res);
      // case "PUT":
      //   return handlePutRequest(id, body, res);
      // case "DELETE":
      //   return handleDeleteRequest(id, res);
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
