-- =========================================================================
-- ThinkBin Supabase Database Schema
-- Auth, Anti-Duplicate, Class Roster & Pre-Survey Responses
-- =========================================================================

-- 1. Table: class_roster
-- Daftar siswa per kelas (input manual/preloaded oleh sekolah, tanpa API eksternal)
CREATE TABLE IF NOT EXISTS public.class_roster (
    id BIGSERIAL PRIMARY KEY,
    class_name VARCHAR(20) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    student_number INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_class_student_number UNIQUE (class_name, student_number)
);

-- Seed Contoh Data Class Roster
INSERT INTO public.class_roster (class_name, student_name, student_number) VALUES
('7A', 'Aditya Pratama', 1),
('7A', 'Ahmad Fauzi', 2),
('7A', 'Alisa Putri', 3),
('7A', 'Budi Santoso', 4),
('7A', 'Citra Dewi', 5),
('7A', 'Dimas Anggara', 6),
('7A', 'Eka Rahmawati', 7),
('7A', 'Fajar Nugraha', 8),
('7A', 'Gita Permata', 9),
('7A', 'Hendra Wijaya', 10),
('7A', 'Leonardo', 14),
('7A', 'Max', 15),
('7A', 'Raka Pratama', 17),
('7A', 'Susan', 19),
('7B', 'Andi Saputra', 1),
('7B', 'Anisa Rahma', 2),
('7B', 'Bagus Setiawan', 3),
('8A', 'Aroma', 1),
('8A', 'Chloe', 3),
('8A', 'James', 7),
('8A', 'William', 10)
ON CONFLICT (class_name, student_number) DO NOTHING;

-- 2. Table: user_profiles
-- Profil siswa dengan 3 Layer Anti-Duplicate (device_fingerprint + google_id + class_name & student_number)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(20) NOT NULL,
    student_number INT NOT NULL,
    device_fingerprint VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    coins INT DEFAULT 640,
    xp INT DEFAULT 0,
    streak INT DEFAULT 1,
    onboarding_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_class_student_entry UNIQUE (class_name, student_number)
);

-- 3. Table: pre_survey_responses
-- Jawaban Kuisioner Awal siswa
CREATE TABLE IF NOT EXISTS public.pre_survey_responses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    google_id VARCHAR(128) NOT NULL,
    answers JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table: anti_duplicate_logs
-- Log catatan pencatatan & validasi anti-duplikasi
CREATE TABLE IF NOT EXISTS public.anti_duplicate_logs (
    id BIGSERIAL PRIMARY KEY,
    device_fingerprint VARCHAR(255) NOT NULL,
    google_id VARCHAR(128) NOT NULL,
    class_name VARCHAR(20) NOT NULL,
    student_number INT NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'SUCCESS', 'DUPLICATE_DEVICE', 'DUPLICATE_GOOGLE_ID', 'DUPLICATE_ROSTER'
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_user_google_id ON public.user_profiles(google_id);
CREATE INDEX IF NOT EXISTS idx_user_device_fp ON public.user_profiles(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_class_no ON public.user_profiles(class_name, student_number);