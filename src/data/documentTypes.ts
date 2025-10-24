import { DocumentType } from '../lib/supabase';

export const initialDocumentTypes: DocumentType[] = [
  {
    id: '1730000000001',
    name: 'Prototype',
    description: 'A preliminary model or sample of a product built to test and validate concepts, designs, and functionalities before final production.',
    is_active: true,
    created_at: '2024-01-15T10:30:00.000Z',
    updated_at: '2024-01-15T10:30:00.000Z',
    created_by: 'admin',
    updated_by: 'admin'
  },
  {
    id: '1730000000002',
    name: 'Lab Report',
    description: 'A detailed document that presents the findings, methodology, analysis, and conclusions of scientific experiments or laboratory investigations.',
    is_active: true,
    created_at: '2024-02-10T14:20:00.000Z',
    updated_at: '2024-02-10T14:20:00.000Z',
    created_by: 'admin',
    updated_by: 'admin'
  },
  {
    id: '1730000000003',
    name: 'Invalid Status Report',
    description: 'A report documenting items, records, or transactions that have been identified as invalid, incorrect, or not meeting the required validation criteria.',
    is_active: false,
    created_at: '2024-03-05T09:15:00.000Z',
    updated_at: '2024-03-05T09:15:00.000Z',
    created_by: 'admin',
    updated_by: 'admin'
  }
];
