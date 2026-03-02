import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding normal users via mocked /auth/register...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // List of test users to create
    const usersToCreate = [
        {
            email: 'usuario1@injoyplan.com',
            firstName: 'Juan',
            lastName: 'Pérez',
            password: hashedPassword,
            genero: 'Masculino',
            isVerified: true, // Verified for easy testing
        },
        {
            email: 'usuario2@injoyplan.com',
            firstName: 'María',
            lastName: 'López',
            password: hashedPassword,
            genero: 'Femenino',
            isVerified: false, // Unverified to test verification flow
        }
    ];

    for (const userData of usersToCreate) {
        // Generate a 6-digit verification code just like /auth/register
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.user.upsert({
            where: { email: userData.email },
            update: {
                isVerified: userData.isVerified,
                verificationToken: userData.isVerified ? null : verificationToken,
            },
            create: {
                email: userData.email,
                password: userData.password,
                userType: 'NORMAL',
                isVerified: userData.isVerified,
                verificationToken: userData.isVerified ? null : verificationToken,
                profile: {
                    create: {
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        description: userData.genero ? `Género: ${userData.genero}` : null,
                    },
                },
            },
        });

        console.log(`✅ User UPSERTED: ${userData.email} | Verified: ${userData.isVerified}`);
        if (!userData.isVerified) {
            console.log(`   -> Verification Code: ${verificationToken}`);
        }
    }

    console.log('🎉 Users seeding completed! Default password: password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
