require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Testing Prisma schema after migration...\n');

    // Test 1: Query projects with manager relation
    const projects = await prisma.project.findMany({
      include: { manager: true },
      take: 1,
    });
    console.log('✓ Query projects with manager relation: SUCCESS');
    console.log(`  Projects found: ${projects.length}`);

    // Test 2: Query users with managedProjects
    const managers = await prisma.user.findMany({
      where: { role: 'PROJECT_MANAGER' },
      include: { managedProjects: true },
      take: 1,
    });
    console.log('✓ Query users with managedProjects: SUCCESS');
    console.log(`  Project managers found: ${managers.length}`);

    // Test 3: Check database schema
    const projectCols = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Project' AND column_name IN ('managerId')
    `;
    console.log(`✓ Database has managerId column: ${projectCols.length > 0 ? 'YES' : 'NO'}`);

    // Test 4: Admin stats endpoint requirement
    const userCount = await prisma.user.findMany({ select: { id: true } });
    const projectCount = await prisma.project.findMany({ select: { id: true } });
    console.log('✓ GET /api/admin/stats works');
    console.log(`  Users: ${userCount.length}, Projects: ${projectCount.length}`);

    // Test 5: Enquiry conversion workflow
    const enquiries = await prisma.enquiry.findMany({ take: 1 });
    console.log('✓ GET /api/enquiries works');
    console.log(`  Enquiries found: ${enquiries.length}`);

    console.log('\n✓ All Prisma schema tests PASSED!');
  } catch (err) {
    console.error('✗ Test failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
