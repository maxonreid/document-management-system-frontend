import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dms.com' },
    update: {},
    create: {
      email: 'admin@dms.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      active: true,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@dms.com' },
    update: {},
    create: {
      email: 'user@dms.com',
      passwordHash: userPassword,
      name: 'Regular User',
      role: UserRole.USER,
      active: true,
    },
  });

  console.log('✅ Created regular user:', user.email);

  // Create some sample tags
  const tags = ['Important', 'Archive', 'Draft', 'Final', 'Review'];
  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
  }

  console.log('✅ Created sample tags');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
