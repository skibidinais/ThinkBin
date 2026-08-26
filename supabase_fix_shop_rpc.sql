-- =========================================================================
-- THINKBIN URGENT SHOP RPC FIX (PRODUCTION)
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> Run
-- =========================================================================

-- 1. Hapus versi lama agar tidak ada konflik signature di schema cache
DROP FUNCTION IF EXISTS public.purchase_shop_item(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.purchase_shop_item(TEXT);
DROP FUNCTION IF EXISTS public.equip_shop_item(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.equip_shop_item(TEXT);
DROP FUNCTION IF EXISTS public.open_mystery_box(TEXT);
DROP FUNCTION IF EXISTS public.open_mystery_box();

-- 2. Pastikan tabel shop_catalog terisi data harga resmi
CREATE TABLE IF NOT EXISTS public.shop_catalog (
    item_id TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    price_coins INT NOT NULL CHECK (price_coins >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 3. FUNCTION TUNGGAL: purchase_shop_item(p_item_id TEXT)
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
    -- Mengambil user langsung dari auth.uid()
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'unauthorized',
            'message', 'Sesi login tidak valid. Silakan login kembali.'
        );
    END IF;

    -- Validasi item dari tabel katalog resmi
    SELECT price_coins, item_name INTO v_price, v_item_name
    FROM public.shop_catalog
    WHERE item_id = p_item_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'item_not_found',
            'message', 'Item tidak ditemukan di katalog toko.'
        );
    END IF;

    -- Cek jika sudah pernah membeli item ini
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
            'message', 'Item sudah kamu miliki dan langsung dipasang.',
            'current_coins', v_new_coins
        );
    END IF;

    -- Atomic conditional update koin (mencegah saldo minus & race condition)
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

    -- Simpan pencatatan transaksi ownership
    BEGIN
        INSERT INTO public.store_transactions (user_id, item_id, item_name, price_coins, purchased_at)
        VALUES (v_user_id, p_item_id, v_item_name, v_price, NOW());
    EXCEPTION WHEN unique_violation THEN
        -- Rollback saldo jika duplikasi concurrent
        UPDATE public.user_profiles
        SET coins = coins + v_price
        WHERE id = v_user_id
        RETURNING coins INTO v_new_coins;

        RETURN jsonb_build_object(
            'success', true,
            'status', 'already_owned',
            'message', 'Item sudah kamu miliki.',
            'current_coins', v_new_coins
        );
    END;

    RETURN jsonb_build_object(
        'success', true,
        'status', 'success',
        'message', 'Item berhasil dibeli dan langsung terpasang.',
        'current_coins', v_new_coins
    );
END;
$$;

-- 4. FUNCTION TUNGGAL: equip_shop_item(p_item_id TEXT)
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

-- 5. FUNCTION TUNGGAL: open_mystery_box()
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

    v_reward_xp := floor(random() * 25 + 15)::INT;

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

-- 6. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION public.purchase_shop_item(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.equip_shop_item(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.open_mystery_box() TO anon, authenticated, service_role;
GRANT SELECT ON public.shop_catalog TO anon, authenticated, service_role;

-- 7. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
