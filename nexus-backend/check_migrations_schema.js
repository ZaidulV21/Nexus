const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = '_prisma_migrations'
      ORDER BY ordinal_position
    `;
    console.log('_prisma_migrations columns:');
    result.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
