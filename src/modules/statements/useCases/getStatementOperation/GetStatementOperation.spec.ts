import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let statementRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    statementRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementRepository
    );
  });

  it("Should be able to get statement operation", async () => {
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

    const newStatement = await statementRepository.create(createStatementData);

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: newUser.id as string,
      statement_id: newStatement.id as string,
    });

    expect(statementOperation).toBeInstanceOf(Statement);
    expect(statementOperation).toMatchObject(newStatement);
  });

  it("Should not be able to get statement if user does not exists", async () => {
    expect(async () => {
      const createStatementData: ICreateStatementDTO = {
        user_id: "12123165safasdfd1s1d5s",
        type: OperationType.DEPOSIT,
        amount: 50,
        description: "Statemente description test",
      };

      const newStatement = await statementRepository.create(
        createStatementData
      );

      await getStatementOperationUseCase.execute({
        user_id: "1sd23f1ds56f45d6sfds51",
        statement_id: newStatement.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to get statement if statement does not exists", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User name test",
        email: "user1@teste.com",
        password: "123456",
      };

      const newUser = await usersRepository.create(user);

      await getStatementOperationUseCase.execute({
        user_id: newUser.id as string,
        statement_id: "1dds1f21dsf15ds1fa5as3",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
