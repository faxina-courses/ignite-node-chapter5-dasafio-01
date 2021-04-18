import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { ITransferDto } from "./TransferDTO";
import { TransferError } from "./TransferError";
import { TransferUseCase } from "./TransferUseCase";

let statementRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let transferUseCase: TransferUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    statementRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    transferUseCase = new TransferUseCase(usersRepository, statementRepository);
  });

  it("Should be able to do a transfer", async () => {
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

    const senderDeposit: ICreateStatementDTO = {
      user_id: sender.id as string,
      type: OperationType.DEPOSIT,
      amount: 150,
      description: "Deposit",
    };

    const senderWithdraw: ICreateStatementDTO = {
      user_id: sender.id as string,
      type: OperationType.WITHDRAW,
      amount: 25,
      description: "Withdraw1",
    };

    const recipientDeposit: ICreateStatementDTO = {
      user_id: recipient.id as string,
      type: OperationType.DEPOSIT,
      amount: 25,
      description: "Deposit",
    };

    const transfer: ITransferDto = {
      recipient_id: recipient.id as string,
      sender_id: sender.id as string,
      amount: 50,
      description: "Transfer test 1",
    };

    await statementRepository.create(senderDeposit);
    await statementRepository.create(senderWithdraw);
    await statementRepository.create(recipientDeposit);

    await transferUseCase.execute(transfer);

    const senderStatement = await statementRepository.getUserBalance({
      user_id: sender.id as string,
    });

    const recipientStatement = await statementRepository.getUserBalance({
      user_id: recipient.id as string,
    });

    expect(senderStatement.balance).toBe(75);
    expect(recipientStatement.balance).toBe(75);
  });

  it("Should not be able to do a transfer if sender does not exists", async () => {
    expect(async () => {
      const recipientDto: ICreateUserDTO = {
        name: "User name test",
        email: "user1@teste.com",
        password: "123456",
      };

      const recipient = await usersRepository.create(recipientDto);

      const transfer: ITransferDto = {
        recipient_id: recipient.id as string,
        sender_id: "d54f56dsa4f56dsa4f56sda4f65",
        amount: 50,
        description: "Transfer test 1",
      };

      await transferUseCase.execute(transfer);
    }).rejects.toBeInstanceOf(TransferError.SenderNotFound);
  });

  it("Should not be able to do a transfer if recipient does not exists", async () => {
    expect(async () => {
      const senderDto: ICreateUserDTO = {
        name: "User name test",
        email: "user1@teste.com",
        password: "123456",
      };

      const sender = await usersRepository.create(senderDto);

      const senderDeposit: ICreateStatementDTO = {
        user_id: sender.id as string,
        type: OperationType.DEPOSIT,
        amount: 150,
        description: "Deposit",
      };

      await statementRepository.create(senderDeposit);

      const transfer: ITransferDto = {
        recipient_id: "2ds1f2s1daf1sa2d3",
        sender_id: sender.id as string,
        amount: 50,
        description: "Transfer test 1",
      };

      await transferUseCase.execute(transfer);
    }).rejects.toBeInstanceOf(TransferError.RecipientNotFound);
  });

  it("Should not be able to do a transfer if sender has insufficient funds", async () => {
    expect(async () => {
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

      const transfer: ITransferDto = {
        recipient_id: recipient.id as string,
        sender_id: sender.id as string,
        amount: 50,
        description: "Transfer test 1",
      };

      await transferUseCase.execute(transfer);
    }).rejects.toBeInstanceOf(TransferError.InsufficientFunds);
  });
});
