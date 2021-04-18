import { Request, Response } from "express";
import { container } from "tsyringe";
import { TransferUseCase } from "./TransferUseCase";

export class TransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { user_id: recipient_id } = request.params;
    const { id: sender_id } = request.user;
    const { description, amount } = request.body;
    const transferUseCase = container.resolve(TransferUseCase);

    const transferData = await transferUseCase.execute({
      sender_id,
      recipient_id,
      description,
      amount,
    });
    return response.status(201).send(transferData);
  }
}
