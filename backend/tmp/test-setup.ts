import { prisma } from '../src/lib/db.js';

async function main() {
  await prisma.userPreference.update({
    where: { id: 'default' },
    data: { concerns: [] }
  });
  console.log('Preferences updated: empty concerns');
  await prisma.$disconnect();
}

main();
