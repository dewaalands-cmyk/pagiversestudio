-- Pagiverse Studio Database Schema
-- PostgreSQL

CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'proposal_sent', 'closed');
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'review', 'completed', 'on_hold');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  role user_role DEFAULT 'client',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Portfolio items
CREATE TABLE portfolio_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(50),
  technologies VARCHAR(255),
  link TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Testimonies
CREATE TABLE testimonies (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_company VARCHAR(255),
  content TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  image_url TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Client inquiries (from contact form)
CREATE TABLE inquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  message TEXT,
  budget_range VARCHAR(50),
  status inquiry_status DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clients (linked to user accounts)
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects (client projects)
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status project_status DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES clients(id) ON DELETE CASCADE,
  project_id INT REFERENCES projects(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status invoice_status DEFAULT 'draft',
  due_date DATE,
  paid_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INT REFERENCES users(id) ON DELETE CASCADE,
  client_id INT REFERENCES clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  page_path VARCHAR(255),
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  referrer TEXT,
  user_agent TEXT,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Site settings (key-value store)
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('hero_title', 'Website Profesional untuk Bisnis Lokal'),
  ('hero_subtitle', 'Pagiverse Studio membantu UMKM dan brand lokal punya website cepat, rapi, dan mudah ditemukan di Google.'),
  ('contact_whatsapp', '6285xxxxxxxx'),
  ('contact_email', 'hello@pagiversestudio.com'),
  ('contact_instagram', '@pagiversestudio'),
  ('seo_title', 'Pagiverse Studio — Jasa Pembuatan Website Profesional di Garut'),
  ('seo_description', 'Pagiverse Studio membantu UMKM dan brand lokal punya website yang cepat, rapi, dan mudah ditemukan di Google.');

-- Indexes
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_page_path ON analytics_events(page_path);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_messages_client ON messages(client_id);
