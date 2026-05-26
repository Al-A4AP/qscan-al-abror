import { PrismaClient } from '@prisma/client';

// Singleton pattern untuk mencegah connection pool exhaustion di serverless (Vercel)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
