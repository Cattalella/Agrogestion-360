import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
    super({
        datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
        },
    });
    }

    async onModuleInit() {
    await this.$connect();
    console.log('🚀 Base de datos conectada con éxito');
    }

    async onModuleDestroy() {
    await this.$disconnect();
    }
}