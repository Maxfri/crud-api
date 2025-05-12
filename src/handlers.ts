import { IncomingMessage, ServerResponse } from "http";
import { UserService } from "./services/userService";
import { PartialUser, UserWithoutId } from "./types/user";
import { parseRequestBody } from "./utils/requestParser";

const userService = new UserService();

const sendJsonResponse = (
  res: ServerResponse,
  statusCode: number,
  data: object
) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    Charset: "utf-8",
  });
  res.end(JSON.stringify(data));
};

const handleGetRequest = (id: string | undefined, res: ServerResponse) => {
  try {
    if (id) {
      const user = userService.getById(id);

      if (!user) {
        return sendJsonResponse(res, 404, {
          error: "User not found",
          details: `No user with id: ${id}`,
        });
      }

      sendJsonResponse(res, 200, user);
    } else {
      const allUsers = userService.getAll();
      sendJsonResponse(res, 200, allUsers);
    }
  } catch (error) {
    handleServiceError(error, res);
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

const handlePostRequest = async (body: unknown, res: ServerResponse) => {
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
    handleServiceError(error, res);
  }
};

const handlePutRequest = async (
  id: string | undefined,
  body: PartialUser,
  res: ServerResponse
) => {
  try {
    if (!id) {
      return sendJsonResponse(res, 400, {
        error: "User ID is required",
      });
    }

    const validation = validateUpdateData(body);
    if (!validation.isValid) {
      return sendJsonResponse(res, 400, {
        error: "Invalid update data",
        details: validation.errors,
      });
    }

    const updatedUser = userService.updateUser(id, body);
    sendJsonResponse(res, 200, updatedUser);
  } catch (error) {
    handleServiceError(error, res);
  }
};

const validateUpdateData = (
  data: unknown
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Request body must be an object"] };
  }

  const allowedFields = ["username", "age", "hobbies"];
  const entries = Object.entries(data);

  for (const [key, value] of entries) {
    if (!allowedFields.includes(key)) {
      errors.push(`Field '${key}' is not allowed`);
      continue;
    }

    switch (key) {
      case "username":
        if (typeof value !== "string") errors.push("Username must be a string");
        break;
      case "age":
        if (typeof value !== "number") errors.push("Age must be a number");
        break;
      case "hobbies":
        if (
          !Array.isArray(value) ||
          !value.every((v) => typeof v === "string")
        ) {
          errors.push("Hobbies must be an array of strings");
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : [],
  };
};

const handleDeleteRequest = (id: string, res: ServerResponse) => {
  try {
    if (!id) {
      return sendJsonResponse(res, 400, {
        error: "Invalid UUID format",
        details: `Provided ID: ${id}`,
      });
    }

    const isDeleted = userService.deleteUser(id);

    if (!isDeleted) {
      return sendJsonResponse(res, 404, {
        error: "User not found",
        details: `User with ID ${id} does not exist`,
      });
    }

    res.writeHead(204);
    res.end();
  } catch (error) {
    handleServiceError(error, res);
  }
};

const handleServiceError = (error: unknown, res: ServerResponse) => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  const statusCode = errorMessage.includes("Invalid user ID")
    ? 400
    : errorMessage.includes("User not found")
    ? 404
    : errorMessage.includes("Invalid user data")
    ? 400
    : 500;

  sendJsonResponse(res, statusCode, {
    error: errorMessage,
    type: "service_error",
  });
};

export {
  handleGetRequest,
  handlePostRequest,
  handlePutRequest,
  handleDeleteRequest,
};
