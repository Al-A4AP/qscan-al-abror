import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export const recipientSchema = z.object({
  id: z.string().min(1, { message: "ID/Kupon wajib diisi" }),
  name: z.string().min(1, { message: "Nama wajib diisi" }),
  address: z.string().optional(),
  status: z.enum(['Belum', 'Sudah']).default('Belum'),
  note: z.string().optional(),
});

export const animalSchema = z.object({
  id: z.string().min(1, { message: "Tag Hewan wajib diisi" }),
  donor: z.string().min(1, { message: "Nama Pekurban wajib diisi" }),
  type: z.string().min(1, { message: "Jenis hewan wajib diisi" }),
  weight: z.number().min(0).default(0),
  status: z.enum(['Antri', 'Selesai']).default('Antri'),
  address: z.string().optional(),
  note: z.string().optional(),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});
