import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middlewares/auth';
import { recipientSchema, paginationSchema } from '../validations/schemas';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const parsedQuery = paginationSchema.safeParse(req.query);
    const limit = parsedQuery.success ? parsedQuery.data.limit : undefined;
    const offset = parsedQuery.success ? parsedQuery.data.offset : undefined;

    const recipients = await prisma.recipient.findMany({
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    });
    res.json(recipients);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Failed to fetch recipients' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const parsed = recipientSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { id, name, address, status, note } = parsed.data;
    const recipient = await prisma.recipient.upsert({
      where: { id },
      update: { name, address, status, note },
      create: { id, name, address, status, note },
    });
    res.json(recipient);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Failed to save recipient' });
  }
});

export default router;
