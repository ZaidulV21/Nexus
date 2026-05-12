// nexus-backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt           = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Super Admin ──────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@Nexus2025!', 12)

  const admin = await prisma.user.upsert({
    where:  { email: process.env.ADMIN_EMAIL || 'admin@nexusmanaged.in' },
    update: {},
    create: {
      name:         process.env.ADMIN_NAME || 'Nexus Admin',
      email:        process.env.ADMIN_EMAIL || 'admin@nexusmanaged.in',
      passwordHash: hashedPassword,
      role:         'SUPER_ADMIN',
      isVerified:   true,
      companyName:  'Nexus Managed Services',
      phone:        '+91 98765 43210',
    }
  })
  console.log('✅ Admin created:', admin.email)

  // ── 5 Core Services ──────────────────────────────────────
  const services = [
    {
      name:        'Interior Design',
      description: 'Complete office and retail space fit-out including furniture, partitions, false ceiling, and full aesthetics.',
      icon:        'sofa',
      category:    'Civil',
      basePrice:   150000,
      sortOrder:   1,
    },
    {
      name:        'Electrical Work',
      description: 'Full electrical installation — wiring, panels, lighting, switchboards, earthing, and compliance certification.',
      icon:        'zap',
      category:    'Civil',
      basePrice:   80000,
      sortOrder:   2,
    },
    {
      name:        'Solar Installation',
      description: 'Commercial rooftop solar panels with inverters, net metering setup, and UPPCL coordination for Lucknow.',
      icon:        'sun',
      category:    'Energy',
      basePrice:   250000,
      sortOrder:   3,
    },
    {
      name:        'Signage & Billboard',
      description: 'Indoor and outdoor branding — LED signs, hoardings, shop fascias, vinyl wraps, and hoarding installation.',
      icon:        'megaphone',
      category:    'Branding',
      basePrice:   40000,
      sortOrder:   4,
    },
    {
      name:        'Website & IT Setup',
      description: 'Business website development, network infrastructure, email setup, and full IT systems configuration.',
      icon:        'monitor',
      category:    'Technology',
      basePrice:   35000,
      sortOrder:   5,
    },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where:  { name: service.name },
      update: service,
      create: service,
    })
  }
  console.log('✅ 5 services created.')

  // ── Sample Project Manager ───────────────────────────────
  const pmPassword = await bcrypt.hash('Manager@2025!', 12)
  const pm = await prisma.user.upsert({
    where:  { email: 'pm@nexusmanaged.in' },
    update: {},
    create: {
      name:         'Rahul Verma',
      email:        'pm@nexusmanaged.in',
      passwordHash: pmPassword,
      role:         'PROJECT_MANAGER',
      isVerified:   true,
      phone:        '+91 98765 43211',
      companyName:  'Nexus Managed Services',
    }
  })
  console.log('✅ Sample PM created:', pm.email)

  // ── Sample Client ────────────────────────────────────────
  const clientPassword = await bcrypt.hash('Client@2025!', 12)
  const client = await prisma.user.upsert({
    where:  { email: 'client@test.com' },
    update: {},
    create: {
      name:         'Amit Sharma',
      email:        'client@test.com',
      passwordHash: clientPassword,
      role:         'CLIENT',
      isVerified:   true,
      phone:        '+91 98765 43212',
      companyName:  'Sharma Enterprises',
    }
  })
  console.log('✅ Sample client created:', client.email)

  console.log('')
  console.log('🎉 Seeding complete!')
  console.log('')
  console.log('  Login credentials:')
  console.log(`  Admin   → ${process.env.ADMIN_EMAIL || 'admin@nexusmanaged.in'} / ${process.env.ADMIN_PASSWORD || 'Admin@Nexus2025!'}`)
  console.log('  PM      → pm@nexusmanaged.in / Manager@2025!')
  console.log('  Client  → client@test.com / Client@2025!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
