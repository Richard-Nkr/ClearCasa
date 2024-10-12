import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
    try {
        const { email, name, profilePicture, googleId } = req.body;
        const user = await prisma.user.upsert({
            where: { email: email },
            update: {
                name,
                profilePicture,
                googleId,
            },
            create: {
                email,
                name,
                profilePicture,
                googleId,
            },
        });
        res.json(user);
    } catch (error) {
        console.error('Error creating/updating user:', error);
        res.status(400).json({ error: 'Unable to create/update user' });
    }
});

export default router;
