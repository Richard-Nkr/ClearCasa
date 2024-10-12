import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
    try {
        const { title, description, address, city, startDate, endDate, latitude, longitude, userEmail } = req.body;

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
            },
        });

        res.status(201).json(casa);
    } catch (error) {
        console.error('Error creating casa:', error);
        res.status(400).json({ error: 'Unable to create casa' });
    }
});

router.get('/', async (req, res) => {
    try {
        const casas = await prisma.casa.findMany();
        res.json(casas);
    } catch (error) {
        console.error('Error fetching casas:', error);
        res.status(500).json({ error: 'Unable to fetch casas' });
    }
});

export default router;
