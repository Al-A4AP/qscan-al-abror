import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')
  
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 1. Create 2 Users
  await prisma.user.upsert({
    where: { email: 'admin1@al-abror.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin1@al-abror.com',
      name: 'Admin Pertama',
      password: hashedPassword,
      role: 'admin',
    },
  })
  
  await prisma.user.upsert({
    where: { email: 'admin2@al-abror.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin2@al-abror.com',
      name: 'Admin Kedua',
      password: hashedPassword,
      role: 'admin',
    },
  })
  console.log('Created 2 users.')

  // 2. Create 2 Animals (Pekurban)
  const animals = [
    {
      id: 'SAPI-001',
      donor: 'Bapak Ahmad',
      type: 'Sapi',
      weight: 350,
      status: 'Antri',
      address: 'Blok A',
      note: 'Kondisi sehat'
    },
    {
      id: 'KAMBING-001',
      donor: 'Ibu Fatimah',
      type: 'Kambing',
      weight: 40,
      status: 'Antri',
      address: 'Blok B',
      note: 'Aman'
    }
  ]

  for (const animal of animals) {
    await prisma.animal.upsert({
      where: { id: animal.id },
      update: {},
      create: animal,
    })
  }
  console.log('Created 2 animals.')

  // 3. Create 20 Recipients
  const recipientsData = Array.from({ length: 20 }).map((_, i) => {
    const idNum = (i + 1).toString().padStart(3, '0')
    return {
      id: `0101${idNum}`,
      name: `Penerima ${i + 1}`,
      address: `RT ${Math.floor(i / 5) + 1} RW 01`,
      status: i < 5 ? 'Sudah' : 'Belum', // First 5 already taken
      note: `Kupon ke-${i+1}`
    }
  })

  for (const recipient of recipientsData) {
    await prisma.recipient.upsert({
      where: { id: recipient.id },
      update: {},
      create: recipient,
    })
  }
  console.log('Created 20 recipients.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
