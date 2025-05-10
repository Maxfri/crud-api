import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { User, UserWithoutId, PartialUser } from "../types/user";

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

  update(id: string, updateData: PartialUser): User {
    if (!uuidValidate(id)) throw new Error("Invalid UUID");

    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) throw new Error("User not found");

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateData,
      id,
    };
    return this.users[userIndex];
  }

  delete(id: string): boolean {
    if (!uuidValidate(id)) throw new Error("Invalid UUID");
    const initialLength = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length !== initialLength;
  }
}
