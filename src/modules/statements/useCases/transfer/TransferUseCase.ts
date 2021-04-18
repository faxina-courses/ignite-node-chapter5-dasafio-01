import { inject, injectable } from "tsyringe";
import { OperationType } from "../../entities/Statement";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { TransferError } from "./TransferError";
import { ITransferDto } from "./TransferDTO";


@injectable()
export class TransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    sender_id,
    recipient_id,
    amount,
    description,
  }: ITransferDto) {
    const sender = await this.usersRepository.findById(sender_id);

    if (!sender) {
      throw new TransferError.SenderNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });

    if (balance < amount) {
      throw new TransferError.InsufficientFunds();
    }

    const recipient = await this.usersRepository.findById(recipient_id);

    if (!recipient) {
      throw new TransferError.RecipientNotFound();
    }

    const senderStatement = await this.statementsRepository.create({
      user_id: sender_id,
      type: OperationType.WITHDRAW,
      amount,
      description,
    });

    await this.statementsRepository.create({
      user_id: recipient_id,
      sender_id,
      type: OperationType.TRANSFER,
      amount,
      description,
    });

    return senderStatement;
  }
}
