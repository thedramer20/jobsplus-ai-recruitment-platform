import { z } from 'zod'

export const postJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  experienceLevel: z.string().min(1, 'Experience level is required'),
  location: z.string().optional(),
  salaryMin: z.coerce.number().min(0).optional().or(z.literal('')),
  salaryMax: z.coerce.number().min(0).optional().or(z.literal('')),
  deadline: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  skillIds: z.array(z.number()).optional(),
})

export type PostJobSchema = z.infer<typeof postJobSchema>
