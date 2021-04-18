import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to authenticate a user", async () => {
    const user: ICreateUserDTO = {
      name: "User name test",
      email: "user1@teste.com",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    const authenticateData = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(authenticateData).toHaveProperty("token");
    expect(authenticateData).toHaveProperty("user");
    expect(authenticateData.user).toHaveProperty("id");
    expect(authenticateData.user).toHaveProperty("name");
    expect(authenticateData.user.email).toBe(user.email);
  });

  it("Should not be able to authenticate when user does not exists", async () => {
    expect(async () => {
      const credentials = {
        email: "teste@teste.com",
        password: "12345",
      };

      await authenticateUserUseCase.execute({ ...credentials });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate when password does not match", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User name test",
        email: "teste@teste.com",
        password: "123456",
      };

      const credentials = {
        email: user.email,
        password: "wrongpass",
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({ ...credentials });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
