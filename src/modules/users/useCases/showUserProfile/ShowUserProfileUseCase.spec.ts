import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("Should be able to show user profile", async () => {
    const user: ICreateUserDTO = {
      name: "User name test",
      email: "user1@teste.com",
      password: "123456",
    };

    const createdUser = await usersRepository.create(user);

    const userProfle = await showUserProfileUseCase.execute(
      createdUser.id as string
    );

    expect(userProfle).toBeInstanceOf(User);
    expect(userProfle.name).toBe(user.name);
    expect(userProfle.email).toBe(user.email);
  });

  it("Should not be able to show user profile if user does not exists", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("123");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
