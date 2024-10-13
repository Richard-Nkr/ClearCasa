import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const categories = [
        { name: 'Books', emoji: '📚' },
        { name: 'Clothes', emoji: '👚' },
        { name: 'Furniture', emoji: '🛋️' },
        { name: 'Electronics', emoji: '🖥️' },
        { name: 'Kitchen', emoji: '🍳' },
        { name: 'Sports', emoji: '⚽' },
        { name: 'Toys', emoji: '🧸' },
        { name: 'Garden', emoji: '🌱' },
        { name: 'Art', emoji: '🎨' },
        { name: 'Music', emoji: '🎵' },
    ];

    for (const category of categories) {
        await prisma.category.create({
            data: category,
        });
    }

    console.log('Categories seeded successfully');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
