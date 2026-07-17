const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.websiteConfig.findMany();
  console.log('Available keys in database:', configs.map(c => c.key));
  
  const config = await prisma.websiteConfig.findUnique({
    where: { key: 'hero' }
  });

  if (config) {
    const value = config.value;
    value.useVideo = true;
    
    await prisma.websiteConfig.update({
      where: { key: 'hero' },
      data: { value }
    });
    console.log('✅ Successfully updated hero config: useVideo is now set to true!');
  } else {
    console.log('❌ Hero configuration not found in database.');
  }
  
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
