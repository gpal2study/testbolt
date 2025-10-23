/*
  # Create document_types table

  1. New Tables
    - `document_types`
      - `id` (uuid, primary key) - Unique identifier for each document type
      - `name` (text, unique, not null) - Document type name
      - `description` (text) - Description of the document type
      - `is_active` (boolean, default true) - Active status flag
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp
      - `created_by` (uuid) - User who created the record
      - `updated_by` (uuid) - User who last updated the record

  2. Security
    - Enable RLS on `document_types` table
    - Add policy for authenticated users to read all document types
    - Add policy for authenticated users to insert document types
    - Add policy for authenticated users to update document types
    - Add policy for authenticated users to delete document types

  3. Indexes
    - Index on `name` for faster search queries
    - Index on `is_active` for filtering active/inactive records
*/

CREATE TABLE IF NOT EXISTS document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read document types"
  ON document_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert document types"
  ON document_types FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update document types"
  ON document_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() = updated_by);

CREATE POLICY "Authenticated users can delete document types"
  ON document_types FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_document_types_name ON document_types(name);
CREATE INDEX IF NOT EXISTS idx_document_types_is_active ON document_types(is_active);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_types_updated_at BEFORE UPDATE ON document_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
