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
                latitude: parseFloat(latitude),  // Ensure it's a float
                longitude: parseFloat(longitude),  // Ensure it's a float
                owner: {
                    connect: { id: user.id }
                },
                categories // This is already an array of strings
            },
            include: {
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
        res.status(500).json({ error: 'An error occurred while creating the casa' });
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

export default router;
