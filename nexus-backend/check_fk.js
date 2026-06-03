const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const result = await prisma.$queryRaw`
      SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.table_name = kcu.table_name AND tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'Project' AND tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.constraint_name
    `;
    console.log('Project table foreign keys:');
    if (result.length === 0) {
      console.log('  NO FOREIGN KEYS FOUND');
    } else {
      result.forEach(c => {
        console.log(`  ${c.constraint_name}: ${c.column_name} -> ${c.foreign_table_name}.${c.foreign_column_name}`);
      });
    }
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
