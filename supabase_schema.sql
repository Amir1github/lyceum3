-- Supabase Database Schema for Lyceum Website
-- This schema replaces the JSON file-based data storage

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Gallery table for storing gallery images
CREATE TABLE IF NOT EXISTS gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    images TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class groups table
CREATE TABLE IF NOT EXISTS class_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID REFERENCES class_groups(id) ON DELETE CASCADE,
    name VARCHAR(10) NOT NULL,
    letters TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pavilion types table
CREATE TABLE IF NOT EXISTS pavilion_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cabinet types table
CREATE TABLE IF NOT EXISTS cabinet_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pavilions table
CREATE TABLE IF NOT EXISTS pavilions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pavilion_number VARCHAR(10) NOT NULL,
    pavilion_type_id UUID REFERENCES pavilion_types(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staff_id INTEGER UNIQUE NOT NULL,
    responsible_person VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cabinets table
CREATE TABLE IF NOT EXISTS cabinets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staff_id UUID REFERENCES staff(id),
    cabinet_number VARCHAR(20) NOT NULL,
    cabinet_type_id UUID REFERENCES cabinet_types(id),
    capacity INTEGER NOT NULL,
    pavilion_id UUID REFERENCES pavilions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact information table
CREATE TABLE IF NOT EXISTS contact_info (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    telegram VARCHAR(100),
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News table
CREATE TABLE IF NOT EXISTS news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table (simplified structure)
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vacancies table
CREATE TABLE IF NOT EXISTS vacancies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    position VARCHAR(200) NOT NULL,
    salary VARCHAR(50) NOT NULL,
    hours_per_week VARCHAR(10) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work hours table
CREATE TABLE IF NOT EXISTS work_hours (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    day VARCHAR(10) NOT NULL,
    hours VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cabinets_staff_id ON cabinets(staff_id);
CREATE INDEX IF NOT EXISTS idx_cabinets_cabinet_type_id ON cabinets(cabinet_type_id);
CREATE INDEX IF NOT EXISTS idx_cabinets_pavilion_id ON cabinets(pavilion_id);
CREATE INDEX IF NOT EXISTS idx_classes_group_id ON classes(group_id);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vacancies_created_at ON vacancies(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pavilion_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE cabinet_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pavilions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE cabinets ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;

-- Public read access for most tables
CREATE POLICY "Allow public read access" ON gallery FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON class_groups FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON classes FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON pavilion_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON cabinet_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON pavilions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON staff FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON cabinets FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON contact_info FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON news FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON vacancies FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON work_hours FOR SELECT USING (true);

-- Messages table - allow insert for new messages, read for admin
CREATE POLICY "Allow public insert" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON messages FOR SELECT USING (true);

-- Admin policies for write operations (you'll need to implement admin authentication)
-- For now, allowing all operations - you should secure these in production
CREATE POLICY "Allow all operations" ON gallery FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON class_groups FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON classes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON pavilion_types FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON cabinet_types FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON pavilions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON staff FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON cabinets FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON contact_info FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON news FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON students FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON vacancies FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON work_hours FOR ALL USING (true);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_groups_updated_at BEFORE UPDATE ON class_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pavilions_updated_at BEFORE UPDATE ON pavilions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cabinets_updated_at BEFORE UPDATE ON cabinets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vacancies_updated_at BEFORE UPDATE ON vacancies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_hours_updated_at BEFORE UPDATE ON work_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
