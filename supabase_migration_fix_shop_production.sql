-- =========================================================================
-- MIGRATION: FIX SHOP RPC (PRODUCTION)
-- File: supabase_migration_fix_shop_production.sql
-- =========================================================================

-- 1. DROP EXISTING OVERLOADS TO PREVENT SIGNATURE MISMATCH IN POSTGREST
DROP FUNCTION IF EXISTS public.purchase_shop_item(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.purchase_shop_item(TEXT);
DROP FUNCTION IF EXISTS public.equip_shop_item(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.equip_shop_item(TEXT);

-- 2. ENSURE SHOP CATALOG TABLE EXISTS WITH AUTHORITATIVE PRICES
CREATE TABLE IF NOT EXISTS public.shop_catalog (
    item_id TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    price_coins INT NOT NULL CHECK (price_coins >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed / update border prices
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

-- 3. CANONICAL ATOMIC RPC: purchase_shop_item(p_item_id TEXT)
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
    -- Auth resolution strictly from session
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'unauthorized',
            'message', 'Sesi login tidak valid. Silakan login kembali.'
        );
    END IF;

    -- Fetch item details from shop_catalog
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

    -- Check if item is already owned
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

    -- Atomic conditional update for coins (prevents negative balance & race conditions)
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

    -- Record ownership transaction
    BEGIN
        INSERT INTO public.store_transactions (user_id, item_id, item_name, price_coins, purchased_at)
        VALUES (v_user_id, p_item_id, v_item_name, v_price, NOW());
    EXCEPTION WHEN unique_violation THEN
        -- Rollback coins if concurrent duplicate transaction occurred
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

-- 4. CANONICAL ATOMIC RPC: equip_shop_item(p_item_id TEXT)
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

-- 5. GRANTS
GRANT EXECUTE ON FUNCTION public.purchase_shop_item(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.equip_shop_item(TEXT) TO anon, authenticated, service_role;
GRANT SELECT ON public.shop_catalog TO anon, authenticated, service_role;

-- 6. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
