import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { stringify } from 'csv-stringify';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /customers
 * Query: q, page=1, pageSize=10, sort=createdAt, order=desc
 */
router.get('/', async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize) || 10, 1), 100);
  const sort = (req.query.sort || 'createdAt').toString();
  const order = (req.query.order || 'desc').toString();

  const where = q
    ? {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } }
        ]
      }
    : {};

  const [total, items] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { [sort]: order.toLowerCase() === 'asc' ? 'asc' : 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  res.json({ total, page, pageSize, items });
});

/** GET /customers/:id */
router.get('/:id', async (req, res) => {
  const item = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: { documents: true }
  });
  if (!item) return res.status(404).json({ error: 'Customer not found' });
  res.json(item);
});

/** POST /customers */
router.post('/', async (req, res) => {
  const {
    firstName, infix, lastName, email, phone,
    street, houseNumber, postcode, city
  } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'firstName, lastName, email verplicht' });
  }

  try {
    const created = await prisma.customer.create({
      data: { firstName, infix, lastName, email, phone, street, houseNumber, postcode, city }
    });
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Email bestaat al' });
    }
    console.error(e);
    res.status(500).json({ error: 'Onbekende fout' });
  }
});

/** GET /customers/export (CSV) */
router.get('/export', async (_req, res) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');

  const cursorPageSize = 500;
  let lastId = undefined;

  const stringifier = stringify({ header: true, columns: [
    'id','firstName','infix','lastName','email','phone','street','houseNumber','postcode','city','createdAt'
  ]});
  stringifier.pipe(res);

  while (true) {
    const batch = await prisma.customer.findMany({
      orderBy: { id: 'asc' },
      take: cursorPageSize,
      ...(lastId ? { skip: 1, cursor: { id: lastId } } : {})
    });
    if (batch.length === 0) break;
    for (const c of batch) {
      stringifier.write([
        c.id, c.firstName, c.infix || '', c.lastName, c.email, c.phone || '',
        c.street || '', c.houseNumber || '', c.postcode || '', c.city || '',
        c.createdAt.toISOString()
      ]);
    }
    lastId = batch[batch.length - 1].id;
    if (batch.length < cursorPageSize) break;
  }
  stringifier.end();
});

export default router;
