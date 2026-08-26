-- =========================================================================
-- THINKBIN PRODUCTION MIGRATION: ATOMIC RPCs, CATALOGS & RLS ENFORCEMENT
-- =========================================================================

-- -------------------------------------------------------------------------
-- 0. READ-ONLY AUDIT QUERIES (Jalankan ini terlebih dahulu untuk inspeksi data)
-- -------------------------------------------------------------------------
-- SELECT user_id, item_id, COUNT(*) FROM public.store_transactions GROUP BY user_id, item_id HAVING COUNT(*) > 1;
-- SELECT user_id, survey_type, COUNT(*) FROM public.pre_survey_responses GROUP BY user_id, survey_type HAVING COUNT(*) > 1;
-- SELECT user_id, node_id, COUNT(*) FROM public.learning_node_progress GROUP BY user_id, node_id HAVING COUNT(*) > 1;

-- -------------------------------------------------------------------------
-- 1. TABLE: node_catalog (Sumber Kebenaran Reward Server-Side)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.node_catalog (
    node_id INT PRIMARY KEY,
    title TEXT,
    xp_reward INT NOT NULL DEFAULT 12,
    coin_reward INT NOT NULL DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed / Upsert 16 Learning Nodes
INSERT INTO public.node_catalog (node_id, title, xp_reward, coin_reward) VALUES
(1, 'Apa itu Sampah & Jenis-Jenisnya', 12, 15),
(2, 'Sampah Organik (Mudah Membusuk)', 12, 15),
(3, 'Sampah Anorganik (Sulit Membusuk)', 12, 15),
(4, 'Kuis Tantangan: Pilah Organik vs Anorganik', 12, 25),
(5, 'Dampak Sampah Dibuang Sembarangan', 12, 15),
(6, 'Kuis Tantangan: Dampak Sampah', 12, 25),
(7, 'Bahaya Mikroplastik di Sekitar Kita', 12, 15),
(8, 'Mengubah Sampah Menjadi Energi', 12, 15),
(9, 'Mengenal Gerakan 3R (Reduce, Reuse, Recycle)', 12, 15),
(10, 'Kuis Tantangan: Praktik 3R', 12, 25),
(11, 'Memilah Sampah dari Rumah dan Sekolah', 12, 15),
(12, 'Kuis Tantangan: Pemilahan Sumber', 12, 25),
(13, 'Menabung di Bank Sampah & Reward ThinkBin', 12, 15),
(14, 'Nilai Jual Sampah yang Dipilah', 12, 15),
(15, 'Tiga Langkah Kebiasaan Hijau', 12, 15),
(16, 'Komitmen Aksi Nyata untuk Bumi', 12, 15)
ON CONFLICT (node_id) DO UPDATE SET
    title = EXCLUDED.title,
    xp_reward = EXCLUDED.xp_reward,
    coin_reward = EXCLUDED.coin_reward;

-- -------------------------------------------------------------------------
-- 2. TABLE: shop_catalog (Katalog Resmi Border & Toko)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shop_catalog (
    item_id TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    price_coins INT NOT NULL CHECK (price_coins >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed / Upsert Full Border Catalog
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

-- -------------------------------------------------------------------------
-- 3. UNIQUE CONSTRAINTS (Pencegah Duplikasi Transaksi & Respon)
-- -------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_item'
    ) THEN
        ALTER TABLE public.store_transactions
        ADD CONSTRAINT unique_user_item UNIQUE (user_id, item_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_survey'
    ) THEN
        ALTER TABLE public.pre_survey_responses
        ADD CONSTRAINT unique_user_survey UNIQUE (user_id, survey_type);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_node'
    ) THEN
        ALTER TABLE public.learning_node_progress
        ADD CONSTRAINT unique_user_node UNIQUE (user_id, node_id);
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- 4. ATOMIC RPC: complete_node
-- -------------------------------------------------------------------------
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
    v_already_completed BOOLEAN := FALSE;
    v_new_xp INT := 0;
    v_new_coins INT := 0;
BEGIN
    IF p_user_id IS NOT NULL AND p_user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        v_user_id := p_user_id::UUID;
    ELSE
        v_user_id := auth.uid();
    END IF;

    IF v_user_id IS NULL AND p_user_id IS NOT NULL THEN
        SELECT id INTO v_user_id FROM public.user_profiles WHERE google_id = p_user_id LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: User ID required');
    END IF;

    -- Ambil reward dari catalog server
    SELECT xp_reward, coin_reward INTO v_xp_reward, v_coin_reward
    FROM public.node_catalog
    WHERE node_id = p_node_id;

    IF NOT FOUND THEN
        v_xp_reward := 12;
        v_coin_reward := 15;
    END IF;

    -- Cek jika node sudah pernah diselesaikan
    IF EXISTS (
        SELECT 1 FROM public.learning_node_progress
        WHERE user_id = v_user_id AND node_id = p_node_id
    ) THEN
        v_already_completed := TRUE;
    ELSE
        BEGIN
            INSERT INTO public.learning_node_progress (
                user_id, node_id, xp_earned, coins_earned, quiz_answer, is_correct, completed_at
            ) VALUES (
                v_user_id, p_node_id, v_xp_reward, v_coin_reward, p_quiz_answer, p_is_correct, NOW()
            );
        EXCEPTION WHEN unique_violation THEN
            v_already_completed := TRUE;
        END;
    END IF;

    -- Increment XP & Coins HANYA jika first completion
    IF NOT v_already_completed THEN
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

-- -------------------------------------------------------------------------
-- 5. ATOMIC RPC: purchase_shop_item
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.purchase_shop_item(
    p_item_id TEXT,
    p_user_id TEXT DEFAULT NULL
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
    IF p_user_id IS NOT NULL AND p_user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        v_user_id := p_user_id::UUID;
    ELSE
        v_user_id := auth.uid();
    END IF;

    IF v_user_id IS NULL AND p_user_id IS NOT NULL THEN
        SELECT id INTO v_user_id FROM public.user_profiles WHERE google_id = p_user_id LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'status', 'unauthorized', 'message', 'Unauthorized');
    END IF;

    -- Validasi item dari catalog server
    SELECT price_coins, item_name INTO v_price, v_item_name
    FROM public.shop_catalog
    WHERE item_id = p_item_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'status', 'item_not_found', 'message', 'Item tidak ditemukan di katalog');
    END IF;

    -- Cek jika sudah dimiliki
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
            'message', 'Item sudah dimiliki dan berhasil dipasang!',
            'current_coins', v_new_coins
        );
    END IF;

    -- Atomic conditional update saldo
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
            'message', 'Koin kamu tidak cukup untuk membeli item ini!'
        );
    END IF;

    -- Record transaction
    BEGIN
        INSERT INTO public.store_transactions (user_id, item_id, item_name, price_coins, purchased_at)
        VALUES (v_user_id, p_item_id, v_item_name, v_price, NOW());
    EXCEPTION WHEN unique_violation THEN
        -- Refund jika terjadi race condition
        UPDATE public.user_profiles
        SET coins = coins + v_price
        WHERE id = v_user_id
        RETURNING coins INTO v_new_coins;

        RETURN jsonb_build_object(
            'success', true,
            'status', 'already_owned',
            'message', 'Item sudah dimiliki!',
            'current_coins', v_new_coins
        );
    END;

    RETURN jsonb_build_object(
        'success', true,
        'status', 'success',
        'message', 'Item berhasil dibeli dan dipasang!',
        'current_coins', v_new_coins
    );
END;
$$;

-- -------------------------------------------------------------------------
-- 6. ATOMIC RPC: equip_shop_item
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.equip_shop_item(
    p_item_id TEXT,
    p_user_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    IF p_user_id IS NOT NULL AND p_user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        v_user_id := p_user_id::UUID;
    ELSE
        v_user_id := auth.uid();
    END IF;

    IF v_user_id IS NULL AND p_user_id IS NOT NULL THEN
        SELECT id INTO v_user_id FROM public.user_profiles WHERE google_id = p_user_id LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    IF p_item_id = 'frame_teal_tech' OR EXISTS (
        SELECT 1 FROM public.store_transactions
        WHERE user_id = v_user_id AND item_id = p_item_id
    ) THEN
        UPDATE public.user_profiles
        SET selected_frame = p_item_id, updated_at = NOW()
        WHERE id = v_user_id;

        RETURN jsonb_build_object('success', true, 'message', 'Border berhasil dipasang!');
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Kamu belum memiliki border ini.');
    END IF;
END;
$$;

-- -------------------------------------------------------------------------
-- 7. ATOMIC RPC: open_mystery_box
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.open_mystery_box(
    p_user_id TEXT DEFAULT NULL
)
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
    IF p_user_id IS NOT NULL AND p_user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        v_user_id := p_user_id::UUID;
    ELSE
        v_user_id := auth.uid();
    END IF;

    IF v_user_id IS NULL AND p_user_id IS NOT NULL THEN
        SELECT id INTO v_user_id FROM public.user_profiles WHERE google_id = p_user_id LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    -- Acak XP 15 - 39 (floor(random() * 25) + 15)
    v_reward_xp := floor(random() * 25 + 15)::INT;

    -- Potong 40 koin & tambah XP secara atomik
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
            'message', 'Koin tidak cukup untuk Mystery Box!'
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

-- -------------------------------------------------------------------------
-- 8. ATOMIC RPC: submit_survey
-- -------------------------------------------------------------------------
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
    IF p_user_id IS NOT NULL AND p_user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        v_user_id := p_user_id::UUID;
    ELSE
        v_user_id := auth.uid();
    END IF;

    IF v_user_id IS NULL AND p_user_id IS NOT NULL THEN
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

    IF EXISTS (
        SELECT 1 FROM public.pre_survey_responses
        WHERE user_id = v_user_id AND survey_type = p_survey_type
    ) THEN
        v_is_first := FALSE;
    ELSE
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
    END IF;

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
        SELECT xp, coins INTO v_new_xp, v_new_coins
        FROM public.user_profiles WHERE id = v_user_id;

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

-- -------------------------------------------------------------------------
-- 9. PERMISSIONS & GRANTS
-- -------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.complete_node TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.purchase_shop_item TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.equip_shop_item TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.open_mystery_box TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_survey TO anon, authenticated, service_role;

GRANT SELECT ON public.node_catalog TO anon, authenticated, service_role;
GRANT SELECT ON public.shop_catalog TO anon, authenticated, service_role;

-- -------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_node_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for leaderboard, profiles, progress, inventory
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public and authenticated can read user_profiles" ON public.user_profiles;
    CREATE POLICY "Public and authenticated can read user_profiles"
        ON public.user_profiles FOR SELECT
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
END $$;
