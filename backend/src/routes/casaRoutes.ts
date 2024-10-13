import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
    try {
        const { title, description, address, city, startDate, endDate, latitude, longitude, userEmail, categories } = req.body;

        const user = await prisma.user.findUnique({
            where: { email: userEmail },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const casa = await prisma.casa.create({
            data: {
                title,
                description,
                address,
                city,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                latitude,
                longitude,
                owner: { connect: { id: user.id } },
                categories: {
                    create: categories.map((categoryId: string) => ({
                        category: { connect: { id: categoryId } }
                    }))
                }
            },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                },
                owner: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json(casa);
    } catch (error) {
        console.error('Error creating casa:', error);
        res.status(400).json({ error: 'Unable to create casa' });
    }
});

router.get('/', async (req, res) => {
    try {
        const casas = await prisma.casa.findMany({
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.json(casas);
    } catch (error) {
        console.error('Error fetching all casas:', error);
        res.status(500).json({ error: 'Unable to fetch casas' });
    }
});

// New route to get ALL casas
router.get('/all', async (req, res) => {
    try {
        const allCasas = await prisma.casa.findMany({
            include: {
                categories: {
                    include: {
                        category: true
                    }
                },
                owner: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.json(allCasas);
    } catch (error) {
        console.error('Error fetching all casas:', error);
        res.status(500).json({ error: 'Unable to fetch all casas' });
    }
});

// Add a new route to get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Unable to fetch categories' });
    }
});

export default router;
