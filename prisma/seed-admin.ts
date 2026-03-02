import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding administrative users...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // You can easily add more admin users to this array
    const adminsToCreate = [
        {
            email: 'admin@injoyplan.com',
            firstName: 'Admin',
            lastName: 'Injoyplan',
            password: hashedPassword,
        },
        {
            email: 'soporte@injoyplan.com',
            firstName: 'Soporte',
            lastName: 'Injoyplan',
            password: hashedPassword,
        }
    ];

    for (const adminData of adminsToCreate) {
        await prisma.user.upsert({
            where: { email: adminData.email },
            update: {
                role: 'ADMIN',
                isVerified: true,
            },
            create: {
                email: adminData.email,
                password: adminData.password,
                userType: 'COMPANY', // Required by schema
                role: 'ADMIN',
                isVerified: true,
                profile: {
                    create: {
                        firstName: adminData.firstName,
                        lastName: adminData.lastName,
                        description: 'Administrador de la plataforma',
                    },
                },
            },
        });
        console.log(`✅ Admin user upserted: ${adminData.email}`);
    }

    console.log('🎉 Admin seeding completed! Default password: password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
