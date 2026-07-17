import { z } from 'zod'

export const externalFileSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL'),
  file_name: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must be under 255 characters'),
  storage_type: z.enum([
    'youtube',
    'spotify',
    'google_drive',
    'dropbox',
    'external_url',
  ]),
  description: z.string().optional(),
})

export type ExternalFileFormValues = z.infer<typeof externalFileSchema>
