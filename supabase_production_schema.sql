-- =========================================================================
-- THINKBIN PRODUCTION SUPABASE DATABASE SCHEMA
-- Riset OPSI SMPN 20 Malang (Clean Deploy / Pure 0 Start)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. TABLE: class_roster (Master Roster 192 Siswa SMPN 20 Malang)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.class_roster (
    id BIGSERIAL PRIMARY KEY,
    class_name VARCHAR(10) NOT NULL,
    student_name VARCHAR(120) NOT NULL,
    student_number INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_class_student_number UNIQUE (class_name, student_number)
);

-- =========================================================================
-- 2. TABLE: user_profiles (Profil Siswa & 3-Layer Anti-Duplicate)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    class_name VARCHAR(10) NOT NULL,
    student_number INT NOT NULL,
    device_fingerprint VARCHAR(255) NOT NULL,
    avatar_url TEXT DEFAULT '/assets/mascot_leonardo.png',
    selected_frame VARCHAR(100) DEFAULT 'frame_teal_tech',
    coins INT DEFAULT 0 CHECK (coins >= 0),
    xp INT DEFAULT 0 CHECK (xp >= 0),
    streak INT DEFAULT 1,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_class_student_entry UNIQUE (class_name, student_number)
);

-- =========================================================================
-- 3. TABLE: pre_survey_responses (Kuisioner Awal & Akhir Riset)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.pre_survey_responses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    google_id VARCHAR(128) NOT NULL,
    survey_type VARCHAR(20) NOT NULL CHECK (survey_type IN ('awal', 'akhir')),
    answers JSONB NOT NULL,
    knowledge_score INT DEFAULT 0,
    attitude_average NUMERIC(3,2) DEFAULT 0.00,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 4. TABLE: learning_node_progress (Progresi 16 Node Siswa)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.learning_node_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    node_id INT NOT NULL CHECK (node_id BETWEEN 1 AND 16),
    xp_earned INT DEFAULT 12,
    coins_earned INT DEFAULT 15,
    quiz_answer VARCHAR(10),
    is_correct BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_node UNIQUE (user_id, node_id)
);

-- =========================================================================
-- 5. TABLE: store_transactions (Transaksi Pembelian Toko Frame)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.store_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    item_id VARCHAR(100) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    price_coins INT NOT NULL CHECK (price_coins >= 0),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 6. TABLE: anti_duplicate_logs (Audit Log Percobaan Duplikasi)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.anti_duplicate_logs (
    id BIGSERIAL PRIMARY KEY,
    device_fingerprint VARCHAR(255) NOT NULL,
    google_id VARCHAR(128) NOT NULL,
    class_name VARCHAR(10) NOT NULL,
    student_number INT NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'SUCCESS', 'DUPLICATE_GOOGLE_ID', 'DUPLICATE_ROSTER', 'DUPLICATE_DEVICE'
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 7. VIEWS: Leaderboard Individu & Antar-Kelas
-- =========================================================================

-- View Peringkat Individu (Real-time)
CREATE OR REPLACE VIEW public.v_individual_leaderboard AS
SELECT 
    id,
    display_name,
    class_name,
    student_number,
    avatar_url,
    selected_frame,
    xp,
    coins,
    streak,
    RANK() OVER (ORDER BY xp DESC, created_at ASC) as rank_overall,
    RANK() OVER (PARTITION BY class_name ORDER BY xp DESC, created_at ASC) as rank_in_class
FROM public.user_profiles
WHERE onboarding_completed = TRUE;

-- View Peringkat Antar-Kelas (Real-time)
CREATE OR REPLACE VIEW public.v_class_leaderboard AS
SELECT 
    class_name,
    COUNT(id) as active_students,
    COALESCE(SUM(xp), 0) as total_xp,
    COALESCE(ROUND(AVG(xp)), 0) as avg_xp,
    RANK() OVER (ORDER BY COALESCE(SUM(xp), 0) DESC) as class_rank
FROM public.user_profiles
WHERE onboarding_completed = TRUE
GROUP BY class_name;

-- =========================================================================
-- 8. INDEXING UNTUK PERFORMA QUERY
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_user_google_id ON public.user_profiles(google_id);
CREATE INDEX IF NOT EXISTS idx_user_class_no ON public.user_profiles(class_name, student_number);
CREATE INDEX IF NOT EXISTS idx_user_xp ON public.user_profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_survey_user ON public.pre_survey_responses(user_id, survey_type);

-- =========================================================================
-- 9. SEED DATA MASTER ROSTER (192 Siswa SMPN 20 Malang)
-- =========================================================================
INSERT INTO public.class_roster (class_name, student_number, student_name) VALUES
-- 8A
('8A', 1, 'ACHMAD ZAAHIR SYAHBANI'), ('8A', 2, 'AFIF ABID SURUR'), ('8A', 3, 'AL NESTA PUTRA SETIAWAN'), ('8A', 4, 'ALESHA DEAVIKA TAUFAN'),
('8A', 5, 'AMARTYA GAYATRI TEJARESWARI'), ('8A', 6, 'ASYLA SYA''BAN QURRATU''AININ'), ('8A', 7, 'AURUMMA NAJWA WICHITA'), ('8A', 8, 'CHRISTIAN RIZKY DWIPUTRA'),
('8A', 9, 'ERRENS LADY NATHALIA'), ('8A', 10, 'GENDHIS FANNYNA LIONA POETRI'), ('8A', 11, 'GLORY DINA CHRISTIANI'), ('8A', 12, 'HAIDAR AHMAD NABIL'),
('8A', 13, 'INTAN KARUNIA TOHATU'), ('8A', 14, 'JASMIEN ISNAINI SELAWATI'), ('8A', 15, 'KADEK MAHATMA SATYA PRADIPTA'), ('8A', 16, 'KANZA FITRI RAMADHANI'),
('8A', 17, 'KIRANIA ADREENA CARISSA'), ('8A', 18, 'LYRA SALSABILLA PUTRI WARDHANA'), ('8A', 19, 'M ZHAFRAN ABQARY WAFI'), ('8A', 20, 'MOHAMMAD KENZA RADITYA'),
('8A', 21, 'MUH AFANDY RAMADHAN'), ('8A', 22, 'MUHAMMAD JINDAN AKBAR'), ('8A', 23, 'MUHAMMAD QAISER AFDHALI'), ('8A', 24, 'NAFISYA AYUNDI RADISTHI'),
('8A', 25, 'NAUFAL AHMAD DZAKII'), ('8A', 26, 'NEYSA ATHALLAH FAJRINA'), ('8A', 27, 'NURIN NAJWA'), ('8A', 28, 'PETRUS NANDO AMADEO'),
('8A', 29, 'RAFA RADITHYA YUNANSYAH'), ('8A', 30, 'RIDWAN DWI RAMADHAN'), ('8A', 31, 'WELLBYANO KARYA PUTRA'), ('8A', 32, 'ZAHRA AULIA PUTRI'),

-- 8C
('8C', 1, 'ABDURRAHMAN REZA PASHA'), ('8C', 2, 'AMALAH SAFANA FURNIALIKAH'), ('8C', 3, 'ANDINI TATA ARTI'), ('8C', 4, 'ATHAR FIRASH WARDHANA'),
('8C', 5, 'ATHAYA NAZNEEN SAHRIZAL'), ('8C', 6, 'AYCHILLA ARUNY FALERINE AGATHA'), ('8C', 7, 'AZZAHRA NOVELITA FADILLAH'), ('8C', 8, 'DENIZ FARSHAD'),
('8C', 9, 'DZAHARA PUTRI AMELLIA'), ('8C', 10, 'ERICK KURNIAWAN'), ('8C', 11, 'HASAN AMMAAR SENO'), ('8C', 12, 'IBRAHIM ALFARABI'),
('8C', 13, 'KANIA DWI FEBRIANA EFENDY'), ('8C', 14, 'MUCHAMMAD NIZAM RAMADHANI'), ('8C', 15, 'MUHAMAD RIZKY RIAN MAULANA'), ('8C', 16, 'MUHAMMAD HASBI NUR FAIZ'),
('8C', 17, 'MUHAMMAD YUSUF AL GHIFARI'), ('8C', 18, 'MUHAMMAD ZIDANE ZAKYYATHAA FIRMANSYAH'), ('8C', 19, 'NABILA NAYLA RAMADHANI'), ('8C', 20, 'NABILLA DWI SAPUTRI'),
('8C', 21, 'NADHITA INTAN ZAHIRA'), ('8C', 22, 'NAIRA KHANZA AZAHRA'), ('8C', 23, 'NAUFAL ARYA FERDIANSYAH'), ('8C', 24, 'NIZAR INDRASTA AKNA FIRMANSYAH'),
('8C', 25, 'PUTRI SALSA MARCHELLA'), ('8C', 26, 'RAISHA KYNA SEFA AL ANANTA'), ('8C', 27, 'RAJA RIZKY IRAWAN'), ('8C', 28, 'RAKKA ATHALLAH DWISA PRANATA'),
('8C', 29, 'RATU MAHIRA NURRIDHA'), ('8C', 30, 'SALSABILA PUTRI KAMILA'), ('8C', 31, 'SEKAR CAHYA WAHYUNINGRUM'), ('8C', 32, 'SHAQUEL DHAWIY ZHIAN'),

-- 8E
('8E', 1, 'ADINDA KIRANA FAUZIAH'), ('8E', 2, 'AIREESE ATHALLA FITRA SETIAWAN'), ('8E', 3, 'ALFAHREZI RAYVAN HUDIANSYAH'), ('8E', 4, 'AMELIA DWI ANGGRAENI'),
('8E', 5, 'APRILLIA AZZAHRA'), ('8E', 6, 'AZKA ABDILLAH ALVARO'), ('8E', 7, 'CALISTA ATHAYA ALODIA RAISSA'), ('8E', 8, 'DAFFA ARSYAH FRAMADITYA'),
('8E', 9, 'DEHAN BRAMA ALVARO'), ('8E', 10, 'DUTHA SATRIA A LUMBU'), ('8E', 11, 'FALLEN RAYYAN RAHARDIANSYAH'), ('8E', 12, 'GENDIS KOMALA NUGROHO'),
('8E', 13, 'HAFIZHAN WIDYANATHA'), ('8E', 14, 'KALILA ARIYANTI'), ('8E', 15, 'KANAYA AZALEA NAFISAH'), ('8E', 16, 'KEVIN ALFAHRIZIO WIRASTA'),
('8E', 17, 'KHODIJAH'), ('8E', 18, 'MAHARDIKA AZKA PRADANA'), ('8E', 19, 'MOCHAMAD DICKA APRIANSYAH'), ('8E', 20, 'NOVANDA PUTRA HARDIYANTO'),
('8E', 21, 'NUR AHMAD HABIBUL MAJID'), ('8E', 22, 'PARISYA KANAKA ASADYA'), ('8E', 23, 'PHI THETA CAHYONO PUTRA'), ('8E', 24, 'RAGILDA RACHMA TRI WIJAYANTI'),
('8E', 25, 'RARAS CITRA RAMADHANI'), ('8E', 26, 'RONALDO KURNIA ABHIRAMA'), ('8E', 27, 'RUCITA SASIKIRANA PARAHITA'), ('8E', 28, 'SALWA NISRINA AFIFAH'),
('8E', 29, 'SAQILA FITRI FATIMAH'), ('8E', 30, 'SIFA CHOIRUN NISA'), ('8E', 31, 'TAJUNNISA FARIDATUL ILMI'), ('8E', 32, 'ZAINILA LAILATUL ZAHIRIA'),

-- 9C (Treatment)
('9C', 1, 'AHMAD ADI DANUARTA'), ('9C', 2, 'ALFAHREZA RAFFASYA CHASAVANI'), ('9C', 3, 'ALMIRA PRAMUSITA PUTRI SETIAWAN'), ('9C', 4, 'AMMAR ARYA PASCA MADA'),
('9C', 5, 'AQILAH IRDINA ZAFARANA'), ('9C', 6, 'ARJUNA ABISHEVA SUSETIADI'), ('9C', 7, 'AUFA ABIYYU BRAMANTY'), ('9C', 8, 'BHADISTA NOOR THALIA'),
('9C', 9, 'CITRA MARCHELLA LATHIFA'), ('9C', 10, 'DHANIYAH AQILAH PUTRI PRASETYO'), ('9C', 11, 'DIANDRA KIRANA MAHESWARI'), ('9C', 12, 'DZAKIRA TALITA AZ ZAHRA'),
('9C', 13, 'GLADYS ELYSIA FAYOLA'), ('9C', 14, 'GLADYS LETICIA ANABELLE DESTINY'), ('9C', 15, 'HAFIZA HANUN SALSABILA RAHMA'), ('9C', 16, 'MARVELLE PUTRA ARDIANSYAH'),
('9C', 17, 'MOCH. ARRA SASTRA INDRA PRATAMA'), ('9C', 18, 'MUHAMAD RIZKI ALIFIAN'), ('9C', 19, 'MUHAMAD ZIDAN PUTRA PRASETYO'), ('9C', 20, 'MUHAMMAD AKBAR NOFA WIJAYA'),
('9C', 21, 'MUHAMMAD BAHRUL HIKMI'), ('9C', 22, 'MUHAMMAD OKTARYAN NUGRAHA'), ('9C', 23, 'MUHAMMAD WILDAN ARYASATYA'), ('9C', 24, 'NAURA SIMA'),
('9C', 25, 'NEVA O-SHINE FITRIA PURI'), ('9C', 26, 'OKTAVIA PERMATA ASARI'), ('9C', 27, 'QUEENSA BERLIANA IASA'), ('9C', 28, 'RADITYA ZIKRI ALKHALIFI'),
('9C', 29, 'RAYHAN SANDI PRATAMA'), ('9C', 30, 'SURYANITA DWI ANGGRAINI'), ('9C', 31, 'YUSUF AR RIDHO'), ('9C', 32, 'ZASKEYA WILDANIA EFFENDY'),

-- 9E (Treatment)
('9E', 1, 'ACHMAD BIMA KURNIAWAN'), ('9E', 2, 'AHMAD AMRAN RASYIDAN ALI'), ('9E', 3, 'ALDIS PUTRI FIJAYANTI'), ('9E', 4, 'ANASTASIA NADA PARAMITHA WIJAYA'),
('9E', 5, 'ARDELIA ZAFARANI INARAISSA'), ('9E', 6, 'ARMANDO GAVIN DIAN SASMITHA'), ('9E', 7, 'ATHASYAH RANIDIA CALISTA'), ('9E', 8, 'AXELLE ABRAR BHAGAWANTA IBAD'),
('9E', 9, 'AZKA SYADDAD MUSYAFFA EFFENDI'), ('9E', 10, 'BAHA''UDIN ARIEF DHARMAWAN'), ('9E', 11, 'BARA RESTU SAPUTRA'), ('9E', 12, 'CAVALIERO IBRAHIM PATTISAHUSIWA'),
('9E', 13, 'DEVIANA JIHAN KHAIRUNNISA'), ('9E', 14, 'GENTZA RAYHAN ESTU AZZAHIDI'), ('9E', 15, 'HANANIA ATAYA RAMADHANI'), ('9E', 16, 'HASNA LUBNA ATHAYA'),
('9E', 17, 'ICHIGO MIFAZI NUR AISYAH'), ('9E', 18, 'ISNANIYAH AHLIS SHOFA'), ('9E', 19, 'M.GALE PRAKOSO'), ('9E', 20, 'MOCHAMAD KEVIN PUTRA WIBOWO'),
('9E', 21, 'MUHAMMAD EVAN SETIAWAN'), ('9E', 22, 'MUHAMMAD RADITHYA JAVAS AKBAR'), ('9E', 23, 'MUHAMMAD YARDAN WIRYAMANTA'), ('9E', 24, 'NAJWA HAFI AZZAHRA'),
('9E', 25, 'NAZZA AULIA RAHMA'), ('9E', 26, 'NEYSHA ALZENA SAFIRA'), ('9E', 27, 'ORLIN ONDINE HENDRA KUMARA'), ('9E', 28, 'RAFI BAGUS PRABOWO'),
('9E', 29, 'RISKY SATRIYO PAMUNGKAS'), ('9E', 30, 'SUKMA AYU PRAMESWARI'), ('9E', 31, 'WINIA CANTIKA LAUREN'), ('9E', 32, 'ZAHRAH SYIFA NAFEEZA YULIANTI'),

-- 9F (Treatment)
('9F', 1, 'AIZA SYABILLA MUMTAZZA'), ('9F', 2, 'ALEESYA DANIA HIDAYAT'), ('9F', 3, 'ALESIA SIERRA NURANI'), ('9F', 4, 'ALEXA MECKENZIE TYANDRA'),
('9F', 5, 'ALFIANSYACH ANANG SAPUTRA'), ('9F', 6, 'ANDRA RAMANIA RADISTA'), ('9F', 7, 'ARYA OKTAVIAN PUTRA'), ('9F', 8, 'ASKA AL FARUQ'),
('9F', 9, 'ASYRAF MUSYAFFA ALKAF'), ('9F', 10, 'AVRIZAL RIZKY RHOMADHON'), ('9F', 11, 'BARA KIESHA ALVARO'), ('9F', 12, 'BILQIIS NABILA INTAN KAROMAH'),
('9F', 13, 'DAHLIA FITRIANINGRUM'), ('9F', 14, 'DEVITA MAHARANI'), ('9F', 15, 'DIANDRA ADELINA'), ('9F', 16, 'FREZA ATHAYA ALFARIZKY'),
('9F', 17, 'KENYA JELITA PRAMONO'), ('9F', 18, 'LEBANOUIST OCTHA PARA YUDHA PUTRA'), ('9F', 19, 'MOCHAMMAD ARYA ZAKKI PRASETYA'), ('9F', 20, 'MUHAMMAD DHARMAWANGSA'),
('9F', 21, 'MUHAMMAD HAIKAL ABDILLAH'), ('9F', 22, 'NADHIF ARIEF ASHIDDIQ'), ('9F', 23, 'NAOZSI ELLENA DIANDRA AQILLA'), ('9F', 24, 'NOVITA ANGGRAENY'),
('9F', 25, 'RAISSA AQILA'), ('9F', 26, 'SABRINA YURI PARAMITA'), ('9F', 27, 'SATRIA NUGRAHA SUYOKO PUTRA'), ('9F', 28, 'SHAFIRA DEVITA PRILYLA'),
('9F', 29, 'SHAVIERA AULIA ANDHIKA'), ('9F', 30, 'YULIAUSY CITRASARI'), ('9F', 31, 'ZAHIRAH KARIMATUN NISSAK'), ('9F', 32, 'MEGA AULIA')
ON CONFLICT (class_name, student_number) DO UPDATE SET student_name = EXCLUDED.student_name;
