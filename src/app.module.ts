import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { BankModule } from "./bank/bank.module"
import { Bank } from "./bank/entities/bank.entity"

const entities = [Bank]
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "127.0.0.1",
      port: +process.env.DB_PORT || 7706,
      username: process.env.DB_USER || "user",
      password: process.env.DB_PWD || "user",
      database: process.env.DB_NAME || "db",
      synchronize: true,
      entities: entities,
    }),
    BankModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
