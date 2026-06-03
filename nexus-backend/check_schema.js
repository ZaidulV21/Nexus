const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Project'
      ORDER BY ordinal_position
    `;
    console.log('Project table columns:');
    result.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
