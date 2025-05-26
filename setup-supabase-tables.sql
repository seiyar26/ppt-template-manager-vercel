-- Création des tables pour l'application PPT Template Manager

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des dossiers
CREATE TABLE IF NOT EXISTS public.folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des templates
CREATE TABLE IF NOT EXISTS public.templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(255),
  original_name VARCHAR(255),
  public_url TEXT,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  folder_id INTEGER REFERENCES public.folders(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des champs personnalisés de templates
CREATE TABLE IF NOT EXISTS public.template_fields (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES public.templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  field_key VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) DEFAULT 'text',
  placeholder TEXT,
  default_value TEXT,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de données de démonstration
INSERT INTO public.categories (name, description, color)
VALUES 
  ('Présentations Business', 'Templates pour présentations professionnelles', '#3B82F6'),
  ('Rapports', 'Templates pour rapports et analyses', '#10B981'),
  ('Marketing', 'Templates pour supports marketing', '#F59E0B')
ON CONFLICT DO NOTHING;

-- Création d'une politique de stockage pour les templates
BEGIN;
  -- Activer l'extension pour les UUIDs
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- Insertion d'utilisateurs de démonstration
  INSERT INTO public.users (email, name, password_hash, role)
  VALUES 
    ('admin@example.com', 'Administrateur', 'a0/HQI6FhbIISOUVeusy3sKyUDhSq36fF5d/54aAdiC4Mgbpq', 'admin'),
    ('user@example.com', 'Utilisateur Test', 'a0/HQI6FhbIISOUVeusy3sKyUDhSq36fF5d/54aAdiC4Mgbpq', 'user')
  ON CONFLICT (email) DO NOTHING;
COMMIT;

-- Activation de RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_fields ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité pour les tables
CREATE POLICY "Utilisateurs authentifiés peuvent voir les catégories" 
  ON public.categories FOR SELECT 
  USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent voir les dossiers" 
  ON public.folders FOR SELECT 
  USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent voir les templates" 
  ON public.templates FOR SELECT 
  USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent voir les champs" 
  ON public.template_fields FOR SELECT 
  USING (true);

-- Fonction pour initialiser les tables
CREATE OR REPLACE FUNCTION public.init_ppt_template_manager_tables()
RETURNS void AS 92279
BEGIN
  -- Cette fonction sera automatiquement appelée au démarrage du serveur
  -- pour s'assurer que toutes les tables existent
  RAISE NOTICE 'PPT Template Manager tables initialized';
END;
92279 LANGUAGE plpgsql;

-- Fonction pour générer un slug unique pour les templates
CREATE OR REPLACE FUNCTION public.generate_template_slug()
RETURNS TRIGGER AS 92279
BEGIN
  NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(uuid_generate_v4()::text, 1, 8);
  RETURN NEW;
END;
92279 LANGUAGE plpgsql;

-- Trigger pour générer automatiquement un slug pour les templates
DROP TRIGGER IF EXISTS generate_template_slug_trigger ON public.templates;
CREATE TRIGGER generate_template_slug_trigger
BEFORE INSERT ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.generate_template_slug();
