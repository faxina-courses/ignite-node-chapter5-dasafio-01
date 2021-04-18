import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

let statementRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

describe("Get balance", () => {
  beforeEach(() => {
    statementRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementRepository,
      usersRepository
    );
  });

  it("Should be able to get balance", async () => {
    const user: ICreateUserDTO = {
      name: "User name test",
      email: "user1@teste.com",
      password: "123456",
    };

    const newUser = await usersRepository.create(user);

    const deposit1: ICreateStatementDTO = {
      user_id: newUser.id as string,
      type: OperationType.DEPOSIT,
      amount: 50,
      description: "Statemente description test",
    };

    const withdraw1: ICreateStatementDTO = {
      user_id: newUser.id as string,
      type: OperationType.WITHDRAW,
      amount: 25,
      description: "Statemente description test",
    };

    const deposit2: ICreateStatementDTO = {
      user_id: newUser.id as string,
      type: OperationType.DEPOSIT,
      amount: 10,
      description: "Statemente description test",
    };

    await statementRepository.create(deposit1);

    await statementRepository.create(withdraw1);

    await statementRepository.create(deposit2);

    const balanceData = await getBalanceUseCase.execute({
      user_id: newUser.id as string,
    });

    expect(balanceData.balance).toBe(35);
  });

  it("Should not be able to get balance if user does not exists", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "1231231212156sdafdsa",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

  it("Should be able to get transfer balance with sender_id", async () => {
    const senderDto: ICreateUserDTO = {
      name: "User name test",
      email: "user1@teste.com",
      password: "123456",
    };

    const recipientDto: ICreateUserDTO = {
      name: "User name test",
      email: "user1@teste.com",
      password: "123456",
    };

    const sender = await usersRepository.create(senderDto);
    const recipient = await usersRepository.create(recipientDto);

    const statement1: ICreateStatementDTO = {
      user_id: recipient.id as string,
      sender_id: sender.id,
      type: OperationType.TRANSFER,
      amount: 50,
      description: "Transfer test 1",
    };

    const statement2: ICreateStatementDTO = {
      user_id: recipient.id as string,
      sender_id: sender.id,
      type: OperationType.TRANSFER,
      amount: 150,
      description: "Transfer test 2",
    };

    await statementRepository.create(statement1);

    await statementRepository.create(statement2);

    const balanceData = await getBalanceUseCase.execute({
      user_id: recipient.id as string,
    });

    expect(balanceData.balance).toBe(200);
    expect(balanceData.statement[0]).toHaveProperty("sender_id");
  });
});
