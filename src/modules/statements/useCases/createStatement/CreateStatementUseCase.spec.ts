import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let statementRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    statementRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementRepository
    );
  });

  it("Should be able to create a new statement", async () => {
    const user: ICreateUserDTO = {
      name: "User name test",
      email: "user1@teste.com",
      password: "123456",
    };

    const newUser = await usersRepository.create(user);

    const createStatementData: ICreateStatementDTO = {
      user_id: newUser.id as string,
      type: OperationType.DEPOSIT,
      amount: 50,
      description: "Statemente description test",
    };

    const newStatement = await createStatementUseCase.execute(
      createStatementData
    );

    expect(newStatement).toMatchObject(createStatementData);
  });

  it("Should not be able to create a new statement if user does not exists", async () => {
    expect(async () => {
      const createStatementData: ICreateStatementDTO = {
        user_id: "12123165safasdfd1s1d5s",
        type: OperationType.DEPOSIT,
        amount: 50,
        description: "Statemente description test",
      };

      await createStatementUseCase.execute(createStatementData);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to create a new statement if type equal 'withdraw' and balance less than amount ", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User name test",
        email: "user1@teste.com",
        password: "123456",
      };

      const newUser = await usersRepository.create(user);

      const firstStatement: ICreateStatementDTO = {
        user_id: newUser.id as string,
        type: OperationType.DEPOSIT,
        amount: 50,
        description: "deposit",
      };

      const secondStatement: ICreateStatementDTO = {
        user_id: newUser.id as string,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "withdraw",
      };

      await createStatementUseCase.execute(firstStatement);

      await createStatementUseCase.execute(secondStatement);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
