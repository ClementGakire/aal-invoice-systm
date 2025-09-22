// Edge-compatible Prisma client for Vercel deployment
import { PrismaClient } from '@prisma/client'

// Global variable to store Prisma client instance
let prisma

if (process.env.NODE_ENV === 'production') {
  // In production, create a new instance for each serverless function
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  })
} else {
  // In development, reuse the instance to avoid connection limits
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
  prisma = global.__prisma
}

export default prisma