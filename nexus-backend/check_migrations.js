const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const result = await prisma.$queryRaw`
      SELECT migration_name, started_at, finished_at, applied_steps_count, rolled_back_at
      FROM "_prisma_migrations"
      ORDER BY started_at
    `;
    console.log('Applied migrations:');
    if (result.length === 0) {
      console.log('  NO MIGRATIONS APPLIED');
    } else {
      result.forEach(m => {
        console.log(`  ${m.migration_name}: started=${m.started_at}, finished=${m.finished_at}, steps=${m.applied_steps_count}, rolled_back=${m.rolled_back_at}`);
      });
    }
  } catch(err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
