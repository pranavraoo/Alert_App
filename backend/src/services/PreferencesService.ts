import { prisma } from '../lib/db.js'

export interface UpdatePreferencesData {
  concerns?: string[]
  theme?: 'light' | 'dark' | 'system'
  quiet_start?: string
  quiet_end?: string
}

export class PreferencesService {
  async getPreferences() {
    return await prisma.userPreference.findUnique({
      where: { id: 'default' },
    })
  }

  async updatePreferences(data: UpdatePreferencesData) {
    return await prisma.userPreference.update({
      where: { id: 'default' },
      data,
    })
  }
}
