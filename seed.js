import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Check if the user already exists
    const existingUser = await prisma.user.findFirst({
        where: { email: 'admin@panchnishthafoundation.com' }
    });

    if (!existingUser) {
        // Hash password before storing it
        const hashedPassword = await bcrypt.hash('admin@123', 10);

        // Create an initial user
        await prisma.user.create({
            data: {
                email: 'admin@panchnishthafoundation.com',
                password: hashedPassword, // Store the hashed password
                role: 'ADMIN',
                mobileNumber: '7405698382',
                dateofBirth: new Date()
            }
        });

        console.log('✅ Default admin user created successfully!');
    } else {
        console.log('⚠️ Admin user already exists, skipping creation.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
