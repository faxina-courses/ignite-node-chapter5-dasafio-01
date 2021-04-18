import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      name: "User name test",
      email: "user1@teste.com",
      password: "123456",
    };

    const newUser = await createUserUseCase.execute(user);

    expect(newUser).toBeInstanceOf(User);
  });

  it("Should not be able to create a new user when wmail already exists", async () => {
    expect(async () => {
      const firstUser: ICreateUserDTO = {
        name: "User name test",
        email: "user1@teste.com",
        password: "123456",
      };

      await createUserUseCase.execute(firstUser);

      const secondtUser: ICreateUserDTO = {
        name: "User name test 2",
        email: "user1@teste.com",
        password: "3336699",
      };

      await createUserUseCase.execute(secondtUser);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
