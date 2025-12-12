import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generate/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,   // ahora sí existe
});
    super({ adapter });
  }

  
}
