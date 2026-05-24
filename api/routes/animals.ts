import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middlewares/auth';
import { animalSchema, paginationSchema } from '../validations/schemas';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const parsedQuery = paginationSchema.safeParse(req.query);
    const limit = parsedQuery.success ? parsedQuery.data.limit : undefined;
    const offset = parsedQuery.success ? parsedQuery.data.offset : undefined;

    const animals = await prisma.animal.findMany({
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    });
    res.json(animals);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const parsed = animalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { id, donor, type, weight, status, address, note } = parsed.data;
    const animal = await prisma.animal.upsert({
      where: { id },
      update: { donor, type, weight, status, address, note },
      create: { id, donor, type, weight, status, address, note },
    });
    res.json(animal);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Failed to save animal' });
  }
});

export default router;
