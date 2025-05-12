import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { User, UserWithoutId } from "../types/user";

export class UserService {
  private users: User[] = [];

  getAll(): User[] {
    return this.users;
  }

  getById(id: string): User | undefined {
    if (!uuidValidate(id)) throw new Error("Invalid UUID");
    return this.users.find((user) => user.id === id);
  }

  create(userData: UserWithoutId): User {
    const newUser: User = {
      id: uuidv4(),
      ...userData,
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: string, updateData: Partial<User>): User {
    if (!uuidValidate(id)) {
      throw new Error("Invalid user ID");
    }

    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updateData,
      id,
    };

    if (
      typeof updatedUser.username !== "string" ||
      typeof updatedUser.age !== "number" ||
      !Array.isArray(updatedUser.hobbies)
    ) {
      throw new Error("Invalid user data structure");
    }

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  delete(id: string): boolean {
    if (!uuidValidate(id)) throw new Error("Invalid UUID");
    const initialLength = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length !== initialLength;
  }
}
