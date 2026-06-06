import { PrismaClient } from '@prisma/client';
import { circles, demoUser, experiences, practitioners, wellnessLibrary } from '../src/wellness/demo-data';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: demoUser.email },
    update: demoUser,
    create: demoUser,
  });

  for (const circle of circles) {
    await prisma.circle.upsert({
      where: { id: circle.id },
      update: circle,
      create: circle,
    });
  }

  for (const practitioner of practitioners) {
    await prisma.practitioner.upsert({
      where: { id: practitioner.id },
      update: practitioner,
      create: practitioner,
    });
  }

  for (const experience of experiences) {
    await prisma.experience.upsert({
      where: { id: experience.id },
      update: experience,
      create: experience,
    });
  }

  for (const content of wellnessLibrary) {
    await prisma.wellnessContent.upsert({
      where: { id: content.id },
      update: content,
      create: content,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
