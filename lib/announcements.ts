import { z } from 'zod';

export const announcementSchema = z.object({
  title: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(2000),
  path: z.enum(['/dashboard', '/dashboard/settings', '/dashboard/certificates']),
}).strict();

export interface Announcement {
  id: string;
  title: string;
  message: string;
  path: string;
  created_at: string;
  read: boolean;
}
