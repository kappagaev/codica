import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, DeleteResult, Repository, UpdateResult } from "typeorm"
import {
  Transaction,
  TransactionType,
} from "../transaction/entities/transaction.entity"
import { CreateBankDto } from "./dto/create-bank.dto"
import { UpdateBankDto } from "./dto/update-bank.dto"
import { Bank } from "./entities/bank.entity"

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank) private bankRepository: Repository<Bank>,
    private readonly dataSource: DataSource
  ) {}

  private logger = new Logger(BankService.name)

  async findAll(): Promise<Bank[]> {
    const banks = await this.bankRepository.find()

    return banks
  }

  async findOne(id: string): Promise<Bank> {
    const bank = await this.bankRepository.findOne({
      where: { id },
    })

    return bank
  }

  async create({ name }: CreateBankDto): Promise<Bank> {
    const bank = this.bankRepository.create({ name })

    const result = await this.bankRepository.save(bank)

    return result
  }

  async update(id: string, update: UpdateBankDto): Promise<UpdateResult> {
    const result = await this.bankRepository.update(id, update)

    return result
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.bankRepository.delete(id)
  }

  async processTransaction(transaction: Transaction) {
    this.logger.log(`Processing transaction ${transaction.id}`)
    await this.dataSource
      .transaction(async (entityManager) => {
        await entityManager.save(transaction)
        await entityManager.update(Bank, transaction.bankId, {
          balance: () =>
            `"balance" ${
              transaction.type === TransactionType.PROFITABLE ? "+" : "-"
            } ${transaction.amount}`,
        })
      })
      .then(() => {
        this.logger.log(`Transaction ${transaction.id} processed`)
      })
      .catch((error) => {
        this.logger.error(`Transaction ${transaction.id} failed`, error)
      })
  }
}
