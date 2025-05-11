import { ServerResponse } from "http";
import { UserService } from "./services/userService";
import { PartialUser, UserWithoutId } from "./types/user";

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
      res.writeHead(200, {
        "Content-Type": "application/json",
        Charset: "utf-8",
      });
      res.end(JSON.stringify(user));
    } else {
      res.writeHead(200, {
        "Content-Type": "application/json",
        Charset: "utf-8",
      });
      res.end(JSON.stringify(userService.getAll()));
    }
  } catch (error) {
    handleError(error, res);
  }
};

const validateUserData = (data: unknown): data is UserWithoutId => {
  if (!data || typeof data !== "object") return false;
  const { username, age, hobbies } = data as Record<string, unknown>;

  return (
    typeof username === "string" &&
    typeof age === "number" &&
    Array.isArray(hobbies) &&
    hobbies.every((item) => typeof item === "string")
  );
};

export const handlePostRequest = async (body: unknown, res: ServerResponse) => {
  try {
    if (!validateUserData(body)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "Invalid user data",
          details: [
            "username (string) is required",
            "age (number) is required",
            "hobbies (string[]) is required",
          ],
        })
      );
    }

    const newUser = userService.create(body);

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(newUser));
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
