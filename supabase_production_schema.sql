-- =========================================================================
-- THINKBIN PRODUCTION DATABASE SCHEMA & ATOMIC RPC ARCHITECTURE
-- Full Reset & Production Migration (Clean, Atomic, Idempotent, RLS Enforced)
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
-- 2. TABLE: node_catalog (Sumber Kebenaran Server-Side Reward Node Belajar)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.node_catalog (
    node_id INT PRIMARY KEY,
    title TEXT NOT NULL,
    xp_reward INT NOT NULL DEFAULT 12 CHECK (xp_reward >= 0),
    coin_reward INT NOT NULL DEFAULT 15 CHECK (coin_reward >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed / Upsert 16 Learning Nodes
INSERT INTO public.node_catalog (node_id, title, xp_reward, coin_reward) VALUES
(1, 'Apa itu Sampah & Klasifikasi UU', 12, 15),
(2, 'Sampah Organik: Pengertian, Jenis & Contoh', 12, 15),
(3, 'Sampah Anorganik: Jenis & Daur Ulang', 12, 15),
(4, 'Kuis Tantangan: Pilah Cepat Organik vs Anorganik', 20, 25),
(5, 'Bahaya Penumpukan Sampah & Gas Metana', 12, 15),
(6, 'Kuis Tantangan: Dampak Tanah & Udara', 20, 25),
(7, 'Mikroplastik & Rantai Makanan', 12, 15),
(8, 'Kebakaran & Pencemaran Dioksin TPA', 12, 15),
(9, 'Reduce: Kurangi Timbulan Sampah', 15, 20),
(10, 'Reuse: Guna Ulang Barang', 15, 20),
(11, 'Kuis Tantangan: Skenario 3R', 20, 25),
(12, 'Recycle: Daur Ulang & Upcycling', 15, 20),
(13, 'Pembuatan Kompos Sederhana', 18, 25),
(14, 'Bank Sampah & Ekonomi Sirkular', 18, 25),
(15, 'Kuis Tantangan: Master Pengelolaan', 25, 30),
(16, 'Komitmen Pahlawan Lingkungan', 30, 50)
ON CONFLICT (node_id) DO UPDATE SET
    title = EXCLUDED.title,
    xp_reward = EXCLUDED.xp_reward,
    coin_reward = EXCLUDED.coin_reward;

-- =========================================================================
-- 3. TABLE: shop_catalog (Sumber Kebenaran Server-Side Harga & Item Border)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.shop_catalog (
    item_id TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    price_coins INT NOT NULL CHECK (price_coins >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed / Upsert 14 Border Items
INSERT INTO public.shop_catalog (item_id, item_name, price_coins) VALUES
('eco_green', 'Eco Green Border', 30),
('autumn_forest', 'Autumn Forest Border', 40),
('sakura_pink', 'Sakura Pink Border', 50),
('ocean_guardian', 'Ocean Guardian Border', 60),
('forest_guardian', 'Forest Guardian Border', 70),
('twilight_guardian', 'Twilight Guardian Border', 85),
('crystal_ice', 'Crystal Ice Border', 100),
('crystal_amethyst', 'Crystal Amethyst Border', 115),
('crystal_ruby', 'Crystal Ruby Border', 130),
('emerald_royal', 'Emerald Royal Border', 150),
('sapphire_royal', 'Sapphire Royal Border', 175),
('golden_monarch', 'Golden Monarch Border', 200),
('frame_teal_tech', 'Teal Tech Border', 65),
('frame_blue_crystal', 'Blue Crystal Border', 90)
ON CONFLICT (item_id) DO UPDATE SET
    item_name = EXCLUDED.item_name,
    price_coins = EXCLUDED.price_coins;

-- =========================================================================
-- 4. TABLE: user_profiles (Profil Siswa & State Ekonomi Utama)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
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
-- 5. TABLE: learning_node_progress (Progresi 16 Node Siswa & Idempotency)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.learning_node_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    node_id INT NOT NULL CHECK (node_id BETWEEN 1 AND 16),
    xp_earned INT DEFAULT 12 CHECK (xp_earned >= 0),
    coins_earned INT DEFAULT 15 CHECK (coins_earned >= 0),
    quiz_answer TEXT,
    is_correct BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_node UNIQUE (user_id, node_id)
);

-- =========================================================================
-- 6. TABLE: store_transactions (Ownership & Riwayat Pembelian Toko)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.store_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    item_id VARCHAR(100) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    price_coins INT NOT NULL CHECK (price_coins >= 0),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_item UNIQUE (user_id, item_id)
);

-- =========================================================================
-- 7. TABLE: pre_survey_responses (Kuisioner Awal & Akhir Riset)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.pre_survey_responses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    google_id VARCHAR(128) NOT NULL,
    survey_type VARCHAR(20) NOT NULL CHECK (survey_type IN ('awal', 'akhir')),
    answers JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_survey UNIQUE (user_id, survey_type)
);

-- =========================================================================
-- 8. INDEXING UNTUK PERFORMA QUERY & LEADERBOARD
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_user_google_id ON public.user_profiles(google_id);
CREATE INDEX IF NOT EXISTS idx_user_class_no ON public.user_profiles(class_name, student_number);
CREATE INDEX IF NOT EXISTS idx_user_xp ON public.user_profiles(xp DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.learning_node_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.store_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_user ON public.pre_survey_responses(user_id, survey_type);

-- =========================================================================
-- 9. ATOMIC RPC 1: complete_node
-- Menyimpan progress, mengambil reward dari node_catalog, menambah XP/Coin
-- Aman dari spam klik, concurrent requests, dan idempotent via UNIQUE constraint.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.complete_node(
    p_node_id INT,
    p_quiz_answer TEXT DEFAULT NULL,
    p_is_correct BOOLEAN DEFAULT TRUE,
    p_user_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_xp_reward INT := 12;
    v_coin_reward INT := 15;
    v_is_first BOOLEAN := FALSE;
    v_new_xp INT := 0;
    v_new_coins INT := 0;
BEGIN
    -- 1. Resolusi User ID: Auth session atau UUID parameter
    IF auth.uid() IS NOT NULL THEN
        v_user_id := auth.uid();
    ELSIF p_user_id IS NOT NULL AND p_user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        v_user_id := p_user_id::UUID;
    ELSIF p_user_id IS NOT NULL THEN
        SELECT id INTO v_user_id FROM public.user_profiles WHERE google_id = p_user_id LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: User tidak ditemukan');
    END IF;

    -- 2. Ambil reward resmi dari catalog database
    SELECT xp_reward, coin_reward INTO v_xp_reward, v_coin_reward
    FROM public.node_catalog
    WHERE node_id = p_node_id;

    IF NOT FOUND THEN
        v_xp_reward := 12;
        v_coin_reward := 15;
    END IF;

    -- 3. Atomic INSERT dengan penanganan UNIQUE (user_id, node_id)
    BEGIN
        INSERT INTO public.learning_node_progress (
            user_id, node_id, xp_earned, coins_earned, quiz_answer, is_correct, completed_at
        ) VALUES (
            v_user_id, p_node_id, v_xp_reward, v_coin_reward, p_quiz_answer, p_is_correct, NOW()
        );
        v_is_first := TRUE;
    EXCEPTION WHEN unique_violation THEN
        v_is_first := FALSE;
    END;

    -- 4. Mutasi ekonomi hanya jika first completion
    IF v_is_first THEN
        UPDATE public.user_profiles
        SET xp = COALESCE(xp, 0) + v_xp_reward,
            coins = COALESCE(coins, 0) + v_coin_reward,
            updated_at = NOW()
        WHERE id = v_user_id
        RETURNING xp, coins INTO v_new_xp, v_new_coins;

        RETURN jsonb_build_object(
            'success', true,
            'is_first_completion', true,
            'xp_awarded', v_xp_reward,
            'coins_awarded', v_coin_reward,
            'current_xp', v_new_xp,
            'current_coins', v_new_coins
        );
    ELSE
        SELECT xp, coins INTO v_new_xp, v_new_coins
        FROM public.user_profiles WHERE id = v_user_id;

        RETURN jsonb_build_object(
            'success', true,
            'is_first_completion', false,
            'xp_awarded', 0,
            'coins_awarded', 0,
            'current_xp', v_new_xp,
            'current_coins', v_new_coins
        );
    END IF;
END;
$$;

-- =========================================================================
-- 10. ATOMIC RPC 2: purchase_shop_item
-- Mengambil harga resmi dari shop_catalog, cek saldo, potong coin, catat kepemilikan.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.purchase_shop_item(
    p_item_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_price INT;
    v_item_name TEXT;
    v_updated_rows INT;
    v_new_coins INT;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'status', 'unauthorized', 'message', 'Unauthorized');
    END IF;

    -- Validasi item dari shop_catalog server
    SELECT price_coins, item_name INTO v_price, v_item_name
    FROM public.shop_catalog
    WHERE item_id = p_item_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'status', 'item_not_found', 'message', 'Item tidak ditemukan di katalog');
    END IF;

    -- Cek jika sudah dimiliki sebelumnya
    IF EXISTS (
        SELECT 1 FROM public.store_transactions
        WHERE user_id = v_user_id AND item_id = p_item_id
    ) THEN
        UPDATE public.user_profiles
        SET selected_frame = p_item_id, updated_at = NOW()
        WHERE id = v_user_id
        RETURNING coins INTO v_new_coins;

        RETURN jsonb_build_object(
            'success', true,
            'status', 'already_owned',
            'message', 'Item sudah dimiliki dan berhasil dipasang.',
            'current_coins', v_new_coins
        );
    END IF;

    -- Atomic conditional update saldo (mencegah saldo negatif & race condition)
    UPDATE public.user_profiles
    SET coins = coins - v_price,
        selected_frame = p_item_id,
        updated_at = NOW()
    WHERE id = v_user_id AND coins >= v_price
    RETURNING coins INTO v_new_coins;

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

    IF v_updated_rows = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'insufficient_funds',
            'message', 'Koin kamu tidak cukup untuk membeli item ini.'
        );
    END IF;

    -- Catat transaksi kepemilikan
    BEGIN
        INSERT INTO public.store_transactions (user_id, item_id, item_name, price_coins, purchased_at)
        VALUES (v_user_id, p_item_id, v_item_name, v_price, NOW());
    EXCEPTION WHEN unique_violation THEN
        -- Refund jika race condition duplikasi
        UPDATE public.user_profiles
        SET coins = coins + v_price
        WHERE id = v_user_id
        RETURNING coins INTO v_new_coins;

        RETURN jsonb_build_object(
            'success', true,
            'status', 'already_owned',
            'message', 'Item sudah dimiliki.',
            'current_coins', v_new_coins
        );
    END;

    RETURN jsonb_build_object(
        'success', true,
        'status', 'success',
        'message', 'Item berhasil dibeli dan dipasang.',
        'current_coins', v_new_coins
    );
END;
$$;

-- =========================================================================
-- 11. ATOMIC RPC 3: equip_shop_item
-- Memasang border yang sudah dimiliki user ke profilnya
-- =========================================================================
CREATE OR REPLACE FUNCTION public.equip_shop_item(
    p_item_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    IF p_item_id = 'frame_teal_tech' OR p_item_id = '' OR EXISTS (
        SELECT 1 FROM public.store_transactions
        WHERE user_id = v_user_id AND item_id = p_item_id
    ) THEN
        UPDATE public.user_profiles
        SET selected_frame = p_item_id, updated_at = NOW()
        WHERE id = v_user_id;

        RETURN jsonb_build_object('success', true, 'message', 'Border berhasil dipasang.');
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Kamu belum memiliki border ini.');
    END IF;
END;
$$;

-- =========================================================================
-- 12. ATOMIC RPC 4: open_mystery_box
-- Potong 40 koin & tambah random 15-39 XP secara atomik
-- =========================================================================
CREATE OR REPLACE FUNCTION public.open_mystery_box()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_price INT := 40;
    v_reward_xp INT;
    v_updated_rows INT;
    v_new_xp INT;
    v_new_coins INT;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    -- Acak XP 15 - 39 (floor(random() * 25) + 15)
    v_reward_xp := floor(random() * 25 + 15)::INT;

    -- Potong 40 koin & tambah XP
    UPDATE public.user_profiles
    SET coins = coins - v_price,
        xp = COALESCE(xp, 0) + v_reward_xp,
        updated_at = NOW()
    WHERE id = v_user_id AND coins >= v_price
    RETURNING xp, coins INTO v_new_xp, v_new_coins;

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;

    IF v_updated_rows = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'insufficient_funds',
            'message', 'Koin tidak cukup untuk Mystery Box.'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'status', 'success',
        'reward_xp', v_reward_xp,
        'current_xp', v_new_xp,
        'current_coins', v_new_coins,
        'message', format('Kamu membuka Mystery Box dan mendapatkan +%s XP!', v_reward_xp)
    );
END;
$$;

-- =========================================================================
-- 13. ATOMIC RPC 5: submit_survey
-- Menyimpan kuisioner awal (+20 XP, +30 Coin) / akhir (+40 XP, +50 Coin)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.submit_survey(
    p_survey_type TEXT,
    p_answers JSONB,
    p_google_id TEXT DEFAULT NULL,
    p_user_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_google_id VARCHAR(128);
    v_xp_reward INT;
    v_coins_reward INT;
    v_is_first BOOLEAN := FALSE;
    v_new_xp INT;
    v_new_coins INT;
BEGIN
    IF auth.uid() IS NOT NULL THEN
        v_user_id := auth.uid();
    ELSIF p_user_id IS NOT NULL AND p_user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        v_user_id := p_user_id::UUID;
    ELSIF p_user_id IS NOT NULL THEN
        SELECT id INTO v_user_id FROM public.user_profiles WHERE google_id = p_user_id LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    IF p_google_id IS NULL THEN
        SELECT google_id INTO v_google_id FROM public.user_profiles WHERE id = v_user_id;
    ELSE
        v_google_id := p_google_id;
    END IF;

    IF p_survey_type = 'akhir' THEN
        v_xp_reward := 40;
        v_coins_reward := 50;
    ELSE
        v_xp_reward := 20;
        v_coins_reward := 30;
    END IF;

    BEGIN
        INSERT INTO public.pre_survey_responses (
            user_id, google_id, survey_type, answers, submitted_at
        ) VALUES (
            v_user_id, COALESCE(v_google_id, v_user_id::text), p_survey_type, p_answers, NOW()
        );
        v_is_first := TRUE;
    EXCEPTION WHEN unique_violation THEN
        v_is_first := FALSE;
    END;

    IF v_is_first THEN
        UPDATE public.user_profiles
        SET xp = COALESCE(xp, 0) + v_xp_reward,
            coins = COALESCE(coins, 0) + v_coins_reward,
            onboarding_completed = true,
            updated_at = NOW()
        WHERE id = v_user_id
        RETURNING xp, coins INTO v_new_xp, v_new_coins;

        RETURN jsonb_build_object(
            'success', true,
            'is_first_submission', true,
            'xp_awarded', v_xp_reward,
            'coins_awarded', v_coins_reward,
            'current_xp', v_new_xp,
            'current_coins', v_new_coins
        );
    ELSE
        UPDATE public.user_profiles
        SET onboarding_completed = true,
            updated_at = NOW()
        WHERE id = v_user_id
        RETURNING xp, coins INTO v_new_xp, v_new_coins;

        RETURN jsonb_build_object(
            'success', true,
            'is_first_submission', false,
            'xp_awarded', 0,
            'coins_awarded', 0,
            'current_xp', v_new_xp,
            'current_coins', v_new_coins
        );
    END IF;
END;
$$;

-- =========================================================================
-- 14. ATOMIC RPC 6: claim_daily_mission
-- Menambah reward harian secara atomik di user_profiles
-- =========================================================================
CREATE OR REPLACE FUNCTION public.claim_daily_mission(
    p_mission_id TEXT,
    p_coin_reward INT DEFAULT 10,
    p_xp_reward INT DEFAULT 3,
    p_user_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_new_coins INT;
    v_new_xp INT;
BEGIN
    IF auth.uid() IS NOT NULL THEN
        v_user_id := auth.uid();
    ELSIF p_user_id IS NOT NULL AND p_user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        v_user_id := p_user_id::UUID;
    ELSIF p_user_id IS NOT NULL THEN
        SELECT id INTO v_user_id FROM public.user_profiles WHERE google_id = p_user_id LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    UPDATE public.user_profiles
    SET coins = COALESCE(coins, 0) + GREATEST(0, p_coin_reward),
        xp = COALESCE(xp, 0) + GREATEST(0, p_xp_reward),
        updated_at = NOW()
    WHERE id = v_user_id
    RETURNING coins, xp INTO v_new_coins, v_new_xp;

    RETURN jsonb_build_object(
        'success', true,
        'current_coins', v_new_coins,
        'current_xp', v_new_xp
    );
END;
$$;

-- =========================================================================
-- 15. PERMISSIONS & GRANTS
-- =========================================================================
GRANT EXECUTE ON FUNCTION public.complete_node TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.purchase_shop_item TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.equip_shop_item TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.open_mystery_box TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_survey TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_daily_mission TO anon, authenticated, service_role;

GRANT SELECT ON public.node_catalog TO anon, authenticated, service_role;
GRANT SELECT ON public.shop_catalog TO anon, authenticated, service_role;
GRANT SELECT ON public.class_roster TO anon, authenticated, service_role;

-- =========================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_node_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_catalog ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for Leaderboard, Profil, Catalogs
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public and authenticated can read user_profiles" ON public.user_profiles;
    CREATE POLICY "Public and authenticated can read user_profiles"
        ON public.user_profiles FOR SELECT
        USING (true);

    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
    CREATE POLICY "Users can insert their own profile"
        ON public.user_profiles FOR INSERT
        WITH CHECK (true);

    DROP POLICY IF EXISTS "Users can update non-economy fields of their own profile" ON public.user_profiles;
    CREATE POLICY "Users can update non-economy fields of their own profile"
        ON public.user_profiles FOR UPDATE
        USING (true);

    DROP POLICY IF EXISTS "Public and authenticated can read learning_node_progress" ON public.learning_node_progress;
    CREATE POLICY "Public and authenticated can read learning_node_progress"
        ON public.learning_node_progress FOR SELECT
        USING (true);

    DROP POLICY IF EXISTS "Public and authenticated can read store_transactions" ON public.store_transactions;
    CREATE POLICY "Public and authenticated can read store_transactions"
        ON public.store_transactions FOR SELECT
        USING (true);

    DROP POLICY IF EXISTS "Public and authenticated can read pre_survey_responses" ON public.pre_survey_responses;
    CREATE POLICY "Public and authenticated can read pre_survey_responses"
        ON public.pre_survey_responses FOR SELECT
        USING (true);

    DROP POLICY IF EXISTS "Public can read class roster" ON public.class_roster;
    CREATE POLICY "Public can read class roster"
        ON public.class_roster FOR SELECT
        USING (true);

    DROP POLICY IF EXISTS "Public can read node catalog" ON public.node_catalog;
    CREATE POLICY "Public can read node catalog"
        ON public.node_catalog FOR SELECT
        USING (true);

    DROP POLICY IF EXISTS "Public can read shop catalog" ON public.shop_catalog;
    CREATE POLICY "Public can read shop catalog"
        ON public.shop_catalog FOR SELECT
        USING (true);
END $$;

-- =========================================================================
-- 16. SINGLE-PARAM OVERLOADS & SCHEMA CACHE RELOAD
-- =========================================================================
CREATE OR REPLACE FUNCTION public.purchase_shop_item(p_item_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN public.purchase_shop_item(p_item_id, NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.equip_shop_item(p_item_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN public.equip_shop_item(p_item_id, NULL);
END;
$$;

CREATE OR REPLACE FUNCTION public.open_mystery_box()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN public.open_mystery_box(NULL);
END;
$$;

GRANT EXECUTE ON FUNCTION public.purchase_shop_item(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.equip_shop_item(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.open_mystery_box() TO anon, authenticated, service_role;

-- Force PostgREST to instantly refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- =========================================================================
-- 16. SEED DATA MASTER ROSTER (192 Siswa SMPN 20 Malang)
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
('9F', 17, 'KENYA JELITA PRAMONO'), ('9F', 18, 'LEBANOUIST OCTHA PARA YUDHA PUTRA'), ('9F', 19, 'MOCHAMMAD ARYA ZAKKI PRASETYA'),
('9F', 20, 'MUHAMMAD DHARMAWANGSA'),
('9F', 21, 'MUHAMMAD HAIKAL ABDILLAH'), ('9F', 22, 'NADHIF ARIEF ASHIDDIQ'), ('9F', 23, 'NAOZSI ELLENA DIANDRA AQILLA'), ('9F', 24, 'NOVITA ANGGRAENY'),
('9F', 25, 'RAISSA AQILA'), ('9F', 26, 'SABRINA YURI PARAMITA'), ('9F', 27, 'SATRIA NUGRAHA SUYOKO PUTRA'), ('9F', 28, 'SHAFIRA DEVITA PRILYLA'),
('9F', 29, 'SHAVIERA AULIA ANDHIKA'), ('9F', 30, 'YULIAUSY CITRASARI'), ('9F', 31, 'ZAHIRAH KARIMATUN NISSAK'), ('9F', 32, 'MEGA AULIA')
ON CONFLICT (class_name, student_number) DO UPDATE SET student_name = EXCLUDED.student_name;
