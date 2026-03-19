import { prisma } from '../lib/db.js'

export interface CreateGuardianData {
  name: string
  label?: string
}

export class GuardianService {
  async getGuardians() {
    return await prisma.guardian.findMany({
      orderBy: { created_at: 'desc' },
    })
  }

  async createGuardian(data: CreateGuardianData) {
    return await prisma.guardian.create({
      data,
    })
  }

  async deleteGuardian(id: string): Promise<boolean> {
    try {
      await prisma.guardian.delete({
        where: { id },
      })
      return true
    } catch {
      return false
    }
  }

  async getGuardianById(id: string) {
    return await prisma.guardian.findUnique({
      where: { id },
    })
  }
}
