import { ServerResponse } from "http";
import { UserService } from "./services/userService";

const userService = new UserService();

export const handleGetRequest = (
  id: string | undefined,
  res: ServerResponse
) => {
  try {
    if (id) {
      const user = userService.getById(id);
      if (!user) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: "User not found" }));
      }
      res.writeHead(200);
      res.end(JSON.stringify(user));
    } else {
      res.writeHead(200);
      res.end(JSON.stringify(userService.getAll()));
    }
  } catch (error) {
    handleError(error, res);
  }
};

const handleError = (error: unknown, res: ServerResponse) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  const statusCode = message.includes("UUID") ? 400 : 404;
  res.writeHead(statusCode);
  res.end(JSON.stringify({ error: message }));
};
