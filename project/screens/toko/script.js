// ThinkBin Toko Border & Items - JavaScript Logic
// Standard Vanilla JS

// 1. Dataset of 14 items (2 tokens, 12 borders)
const bordersData = [
    {
        id: 99, // Streak Freeze Consumable
        name: "Streak Freeze",
        price: 60,
        tier: "sederhana",
        image: "assets/streak_freeze.png"
    },
    {
        id: 100, // Mystery Box Chest
        name: "Mystery Box",
        price: 40,
        tier: "bagus",
        image: "assets/mystery_box.png"
    },
    {
        id: 1,
        name: "Eco Green Border",
        price: 30,
        tier: "sederhana",
        image: "assets/border1.png",
        filter: ""
    },
    {
        id: 2,
        name: "Autumn Forest Border",
        price: 40,
        tier: "sederhana",
        image: "assets/border1.png",
        filter: "hue-rotate(30deg) saturate(1.2) brightness(0.95)"
    },
    {
        id: 3,
        name: "Sakura Pink Border",
        price: 50,
        tier: "sederhana",
        image: "assets/border1.png",
        filter: "hue-rotate(240deg) saturate(1.4)"
    },
    {
        id: 4,
        name: "Ocean Guardian Border",
        price: 60,
        tier: "bagus",
        image: "assets/border2.png",
        filter: "hue-rotate(180deg) saturate(1.1)"
    },
    {
        id: 5,
        name: "Forest Guardian Border",
        price: 70,
        tier: "bagus",
        image: "assets/border2.png",
        filter: ""
    },
    {
        id: 6,
        name: "Twilight Guardian Border",
        price: 85,
        tier: "bagus",
        image: "assets/border2.png",
        filter: "hue-rotate(90deg) saturate(1.2)"
    },
    {
        id: 7,
        name: "Crystal Ice Border",
        price: 100,
        tier: "sangat bagus",
        image: "assets/border3.png",
        filter: ""
    },
    {
        id: 8,
        name: "Crystal Amethyst Border",
        price: 115,
        tier: "sangat bagus",
        image: "assets/border3.png",
        filter: "hue-rotate(70deg) saturate(1.2)"
    },
    {
        id: 9,
        name: "Crystal Ruby Border",
        price: 130,
        tier: "sangat bagus",
        image: "assets/border3.png",
        filter: "hue-rotate(220deg) saturate(1.3)"
    },
    {
        id: 10,
        name: "Emerald Royal Border",
        price: 150,
        tier: "premium",
        image: "assets/border4.png",
        filter: ""
    },
    {
        id: 11,
        name: "Sapphire Royal Border",
        price: 170,
        tier: "premium",
        image: "assets/border4.png",
        filter: "hue-rotate(140deg) saturate(1.2)"
    },
    {
        id: 12,
        name: "Golden Monarch Border",
        price: 200,
        tier: "premium",
        image: "assets/border4.png",
        filter: "hue-rotate(320deg) brightness(1.1) saturate(1.4)"
    }
];

// Calculate Total Pages dynamically (6 items per page)
const totalPages = Math.ceil(bordersData.length / 6);

// 2. Application State variables
let state = {
    coins: 540,
    purchasedIds: [],
    equippedId: null,
    currentPage: 1,
    streakFreezeCount: 0
};

// 3. Cache DOM elements
const coinBalanceSpan = document.getElementById('coin-balance');
const coinDisplayContainer = document.getElementById('coin-display-container');
const headerEquippedBorder = document.getElementById('header-equipped-border');

const shelfGridRow1 = document.getElementById('shelf-grid-row-1');
const shelfGridRow2 = document.getElementById('shelf-grid-row-2');

const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageIndicator = document.getElementById('page-indicator');

// Custom Confirm Modal
const purchaseModal = document.getElementById('purchase-modal');
const modalBorderImg = document.getElementById('modal-border-img');
const modalItemName = document.getElementById('modal-item-name');
const modalItemPriceVal = document.getElementById('modal-item-price-val');
const btnModalCancel = document.getElementById('btn-modal-cancel');
const btnModalConfirm = document.getElementById('btn-modal-confirm');

// Custom Mystery Box Modal
const mysteryModal = document.getElementById('mystery-modal');
const mysteryBoxSprite = document.getElementById('mystery-box-sprite');
const mysteryRewardShowcase = document.getElementById('mystery-reward-showcase');
const mysteryInstruction = document.getElementById('mystery-instruction');
const btnMysteryClaim = document.getElementById('btn-mystery-claim');
const mysteryTitle = document.getElementById('mystery-title');
const mysteryGlow = document.getElementById('mystery-glow');
const rewardIconWrapper = document.getElementById('reward-icon-wrapper');
const rewardText = document.getElementById('reward-text');
const rewardTierBadge = document.getElementById('reward-tier-badge');

// Custom Toast
const toastNotification = document.getElementById('toast-notification');
const toastIcon = document.getElementById('toast-icon');
const toastMessage = document.getElementById('toast-message');

// Current item selected in modal
let selectedBorderId = null;
let toastTimeout = null;
let currentMysteryReward = null;

// 4. Initialize Local Storage and Application
function init() {
    // Load coins
    if (localStorage.getItem('thinkbin_coins') !== null) {
        state.coins = parseInt(localStorage.getItem('thinkbin_coins'));
    } else {
        localStorage.setItem('thinkbin_coins', state.coins);
    }

    // Load purchased list
    if (localStorage.getItem('thinkbin_purchased') !== null) {
        state.purchasedIds = JSON.parse(localStorage.getItem('thinkbin_purchased'));
    } else {
        localStorage.setItem('thinkbin_purchased', JSON.stringify(state.purchasedIds));
    }

    // Load equipped border ID
    if (localStorage.getItem('thinkbin_equipped') !== null) {
        const stored = localStorage.getItem('thinkbin_equipped');
        state.equippedId = stored === 'null' ? null : parseInt(stored);
    } else {
        localStorage.setItem('thinkbin_equipped', 'null');
    }

    // Load Streak Freeze owned count
    if (localStorage.getItem('thinkbin_streak_freeze') !== null) {
        state.streakFreezeCount = parseInt(localStorage.getItem('thinkbin_streak_freeze'));
    } else {
        localStorage.setItem('thinkbin_streak_freeze', state.streakFreezeCount);
    }

    // Bind event listeners
    btnPrev.addEventListener('click', () => changePage(-1));
    btnNext.addEventListener('click', () => changePage(1));
    btnModalCancel.addEventListener('click', closeModal);
    btnModalConfirm.addEventListener('click', confirmPurchase);
    
    // Close modals on clicking overlay background
    purchaseModal.addEventListener('click', (e) => {
        if (e.target === purchaseModal) closeModal();
    });

    // Handle back button
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.parent) {
                window.parent.postMessage({ type: 'navigate', screen: 'home' }, '*');
            } else {
                showToast("Kembali ke Beranda...", true);
            }
        });
    });

    // Footer Navigation Tabs
    document.querySelectorAll('.footer-nav .tab-item').forEach(tab => {
        tab.addEventListener('click', () => {
            const navTarget = tab.dataset.nav;
            if (!navTarget || navTarget === 'toko') return;
            if (window.parent) {
                window.parent.postMessage({ type: 'navigate', screen: navTarget }, '*');
            }
        });
    });

    // Render Initial State
    updateHeaderBalances();
    updateHeaderProfileBorder();
    renderShop();
}

// 5. Render Shop items based on current page
function renderShop() {
    const itemsPerPage = 6;
    const startIndex = (state.currentPage - 1) * itemsPerPage;
    const pageItems = bordersData.slice(startIndex, startIndex + itemsPerPage);

    const row1Items = pageItems.slice(0, 3);
    const row2Items = pageItems.slice(3, 6);

    shelfGridRow1.innerHTML = '';
    shelfGridRow2.innerHTML = '';

    row1Items.forEach(item => {
        shelfGridRow1.appendChild(createCard(item));
    });

    row2Items.forEach(item => {
        shelfGridRow2.appendChild(createCard(item));
    });

    pageIndicator.textContent = `${state.currentPage} / ${totalPages}`;
    btnPrev.disabled = state.currentPage === 1;
    btnNext.disabled = state.currentPage === totalPages;
}

// Helper to assign colorful badge background class
function getBadgeColorClass(item) {
    if (item.id === 99) return 'badge-cyan';
    if (item.id === 100) return 'badge-purple';
    if (item.tier === 'premium') return 'badge-yellow';
    if (item.tier === 'sangat bagus') return 'badge-pink';
    if (item.tier === 'bagus') return 'badge-cyan';
    return 'badge-green';
}

// Helper to create card element
function createCard(item) {
    const isOwned = state.purchasedIds.includes(item.id);
    const isEquipped = state.equippedId === item.id;
    const badgeColor = getBadgeColorClass(item);
    
    let previewHTML = '';
    if (item.id === 99 || item.id === 100) {
        previewHTML = `<img src="${item.image}" class="card-item-img" alt="${item.name}">`;
    } else {
        previewHTML = `<img src="${item.image}" class="card-border-img" style="filter: ${item.filter || 'none'};" alt="${item.name}">`;
    }

    let subtitleHTML = '&nbsp;';
    if (item.id === 99) {
        subtitleHTML = `Dimiliki: ${state.streakFreezeCount}`;
    }

    const card = document.createElement('div');
    card.className = `shop-card`;
    
    card.innerHTML = `
        <div class="card-preview-area ${badgeColor}">
            ${previewHTML}
        </div>
        <div class="card-name">${item.name}</div>
        <div class="card-subtitle">${subtitleHTML}</div>
        <div class="card-price">
            <img src="assets/coin.png" class="card-coin-icon" alt="Coin">
            <span>${item.price}</span>
        </div>
        <button class="btn-card-action"></button>
    `;

    const actionBtn = card.querySelector('.btn-card-action');
    if (item.id === 99 || item.id === 100) {
        actionBtn.textContent = "Beli";
        actionBtn.className += " btn-buy";
    } else if (isEquipped) {
        actionBtn.textContent = "✓ Dipakai";
        actionBtn.className += " btn-active";
    } else if (isOwned) {
        actionBtn.textContent = "Pasang";
        actionBtn.className += " btn-equip";
    } else {
        actionBtn.textContent = "Beli";
        actionBtn.className += " btn-buy";
    }

    card.addEventListener('click', (e) => {
        e.stopPropagation();
        handleItemClick(item.id);
    });

    return card;
}

// 6. Handle action clicks
function handleItemClick(itemId) {
    const isOwned = state.purchasedIds.includes(itemId);
    const isEquipped = state.equippedId === itemId;

    if (itemId === 99 || itemId === 100) {
        openModal(itemId);
    } else if (isEquipped) {
        state.equippedId = null;
        localStorage.setItem('thinkbin_equipped', 'null');
        updateHeaderProfileBorder();
        renderShop();
        showToast("Border dilepas!", true);
    } else if (isOwned) {
        state.equippedId = itemId;
        localStorage.setItem('thinkbin_equipped', itemId);
        updateHeaderProfileBorder();
        renderShop();
        showToast("Border berhasil dipasang!", true);
    } else {
        openModal(itemId);
    }
}

// 7. Modal Confirmation
function openModal(itemId) {
    const item = bordersData.find(b => b.id === itemId);
    if (!item) return;

    selectedBorderId = itemId;
    
    modalItemName.textContent = item.name;
    modalItemPriceVal.textContent = item.price;
    
    const placeholder = document.getElementById('modal-preview-placeholder');
    const borderImg = document.getElementById('modal-border-img');

    if (itemId === 99 || itemId === 100) {
        placeholder.innerHTML = `<img src="${item.image}" style="width: 80px; height: 80px; object-fit: contain;">`;
        borderImg.style.display = 'none';
    } else {
        placeholder.innerHTML = `
            <svg viewBox="0 0 100 100" style="width: 50%; height: 50%; opacity: 0.15;">
                <path d="M 50,20 L 75,35 L 75,65 L 50,80 L 25,65 L 25,35 Z" fill="none" stroke="#2B2D42" stroke-width="8" stroke-linejoin="round"/>
            </svg>
        `;
        borderImg.src = item.image;
        borderImg.style.filter = item.filter || 'none';
        borderImg.style.display = 'block';
    }

    purchaseModal.classList.add('active');
}

function closeModal() {
    purchaseModal.classList.remove('active');
    selectedBorderId = null;
}

// Process Confirmation Purchase
function confirmPurchase() {
    if (!selectedBorderId) return;

    const item = bordersData.find(b => b.id === selectedBorderId);
    if (!item) return;

    if (state.coins >= item.price) {
        if (item.id === 99) {
            // Purchase Streak Freeze
            state.coins -= item.price;
            state.streakFreezeCount += 1;
            
            localStorage.setItem('thinkbin_coins', state.coins);
            localStorage.setItem('thinkbin_streak_freeze', state.streakFreezeCount);
            
            updateHeaderBalances();
            renderShop();
            triggerCoinJiggle();
            closeModal();
            showToast("Streak Freeze berhasil dibeli!", true);
        } else if (item.id === 100) {
            // Purchase Mystery Box
            state.coins -= item.price;
            localStorage.setItem('thinkbin_coins', state.coins);
            
            updateHeaderBalances();
            triggerCoinJiggle();
            closeModal();
            
            openMysteryBoxOpening();
        } else {
            // Purchase Border
            state.coins -= item.price;
            state.purchasedIds.push(item.id);
            state.equippedId = item.id;

            localStorage.setItem('thinkbin_coins', state.coins);
            localStorage.setItem('thinkbin_purchased', JSON.stringify(state.purchasedIds));
            localStorage.setItem('thinkbin_equipped', item.id);

            updateHeaderBalances();
            updateHeaderProfileBorder();
            renderShop();
            triggerCoinJiggle();
            closeModal();
            showToast("Border berhasil dibeli!", true);
        }
    } else {
        closeModal();
        showToast("Coin kamu belum cukup!", false);
    }
}

// 8. Mystery Box Opening Sequence
function openMysteryBoxOpening() {
    currentMysteryReward = rollMysteryReward();
    
    mysteryTitle.textContent = "Mystery Box Diperoleh!";
    mysteryInstruction.textContent = "Ketuk peti untuk membukanya!";
    btnMysteryClaim.style.display = 'none';
    
    // Set Mystery Box Image
    mysteryBoxSprite.innerHTML = `<img src="assets/mystery_box.png" class="mystery-box-image" alt="Mystery Box">`;
    mysteryBoxSprite.className = "mystery-box-sprite";
    
    mysteryRewardShowcase.classList.remove('active');
    mysteryGlow.className = "mystery-glow";
    
    mysteryModal.classList.add('active');
    
    mysteryBoxSprite.onclick = startOpeningBox;
}

function startOpeningBox() {
    mysteryBoxSprite.onclick = null; // Disable clicks
    mysteryBoxSprite.classList.add('shaking');
    mysteryInstruction.textContent = "Membuka...";
    
    // Shake for 1.5 seconds, then reveal reward
    setTimeout(() => {
        revealMysteryReward();
    }, 1500);
}

function revealMysteryReward() {
    mysteryBoxSprite.classList.remove('shaking');
    mysteryBoxSprite.classList.add('open');
    
    const reward = currentMysteryReward;
    
    // Set Rarity Class styles for background beam and badge
    mysteryGlow.className = `mystery-glow active glow-${reward.tier}`;
    rewardTierBadge.className = `reward-tier-badge tier-${reward.tier}`;
    rewardTierBadge.textContent = reward.tierName;
    
    // Set up reward DOM inside showcase
    if (reward.type === 'coins') {
        rewardIconWrapper.innerHTML = `<img src="assets/coin.png" style="width: 70px; height: 70px; object-fit: contain;">`;
        rewardText.textContent = `Kamu mendapatkan ${reward.amount} Coin!`;
    } else if (reward.type === 'streak_freeze') {
        rewardIconWrapper.innerHTML = `<img src="assets/streak_freeze.png" style="width: 70px; height: 70px; object-fit: contain;">`;
        rewardText.textContent = `Kamu mendapatkan ${reward.amount} Streak Freeze!`;
    } else if (reward.type === 'border') {
        rewardIconWrapper.innerHTML = `
            <div class="reward-border-placeholder"></div>
            <img src="${reward.border.image}" class="reward-border-img" style="filter: ${reward.border.filter || 'none'};" alt="${reward.border.name}">
        `;
        rewardText.textContent = `Kamu mendapatkan ${reward.border.name}!`;
    }
    
    // Animate showcase scale-up
    mysteryRewardShowcase.classList.add('active');
    
    // Update texts and show claim button
    mysteryInstruction.textContent = "Hadiah berhasil ditemukan!";
    mysteryTitle.textContent = "Hadiah Terbuka!";
    
    btnMysteryClaim.style.display = 'block';
    btnMysteryClaim.onclick = claimMysteryReward;
}

function claimMysteryReward() {
    const reward = currentMysteryReward;
    if (!reward) return;
    
    if (reward.type === 'coins') {
        state.coins += reward.amount;
        localStorage.setItem('thinkbin_coins', state.coins);
        updateHeaderBalances();
        triggerCoinJiggle();
        showToast(`+${reward.amount} Coin berhasil diklaim!`, true);
    } else if (reward.type === 'streak_freeze') {
        state.streakFreezeCount += reward.amount;
        localStorage.setItem('thinkbin_streak_freeze', state.streakFreezeCount);
        updateHeaderBalances();
        showToast(`+${reward.amount} Streak Freeze diklaim!`, true);
    } else if (reward.type === 'border') {
        state.purchasedIds.push(reward.border.id);
        localStorage.setItem('thinkbin_purchased', JSON.stringify(state.purchasedIds));
        showToast(`Border ${reward.border.name} disimpan ke koleksi!`, true);
    }
    
    // Close modal
    mysteryModal.classList.remove('active');
    currentMysteryReward = null;
    
    // Re-render shop cards
    renderShop();
}

// Loot Table Random Roller based on Tier Percentages
function rollMysteryReward() {
    const rand = Math.random();
    
    const unownedBorders = bordersData.filter(item => item.id !== 99 && item.id !== 100 && !state.purchasedIds.includes(item.id));
    
    // Legendary tier (3% chance)
    if (rand < 0.03) {
        const itemRoll = Math.random();
        if (itemRoll < 0.5) {
            return { type: 'coins', amount: 1000, tier: 'legendary', tierName: 'Legendary' };
        } else {
            const premiumBorders = unownedBorders.filter(b => b.tier === 'premium');
            if (premiumBorders.length > 0) {
                const picked = premiumBorders[Math.floor(Math.random() * premiumBorders.length)];
                return { type: 'border', border: picked, tier: 'legendary', tierName: 'Legendary' };
            } else {
                return { type: 'coins', amount: 1000, tier: 'legendary', tierName: 'Legendary' };
            }
        }
    }
    
    // Rare tier (12% chance)
    if (rand < 0.15) {
        const itemRoll = Math.random();
        if (itemRoll < 0.33) {
            return { type: 'coins', amount: 500, tier: 'rare', tierName: 'Rare' };
        } else if (itemRoll < 0.66) {
            return { type: 'streak_freeze', amount: 3, tier: 'rare', tierName: 'Rare' };
        } else {
            const rareBorders = unownedBorders.filter(b => b.tier === 'sangat bagus');
            if (rareBorders.length > 0) {
                const picked = rareBorders[Math.floor(Math.random() * rareBorders.length)];
                return { type: 'border', border: picked, tier: 'rare', tierName: 'Rare' };
            } else {
                return { type: 'coins', amount: 500, tier: 'rare', tierName: 'Rare' };
            }
        }
    }
    
    // Uncommon tier (25% chance)
    if (rand < 0.40) {
        const itemRoll = Math.random();
        if (itemRoll < 0.3) {
            return { type: 'coins', amount: 300, tier: 'uncommon', tierName: 'Uncommon' };
        } else if (itemRoll < 0.6) {
            return { type: 'streak_freeze', amount: 2, tier: 'uncommon', tierName: 'Uncommon' };
        } else if (itemRoll < 0.8) {
            const simpleBorders = unownedBorders.filter(b => b.tier === 'sederhana');
            if (simpleBorders.length > 0) {
                const picked = simpleBorders[Math.floor(Math.random() * simpleBorders.length)];
                return { type: 'border', border: picked, tier: 'uncommon', tierName: 'Uncommon' };
            } else {
                return { type: 'coins', amount: 300, tier: 'uncommon', tierName: 'Uncommon' };
            }
        } else {
            const goodBorders = unownedBorders.filter(b => b.tier === 'bagus');
            if (goodBorders.length > 0) {
                const picked = goodBorders[Math.floor(Math.random() * goodBorders.length)];
                return { type: 'border', border: picked, tier: 'uncommon', tierName: 'Uncommon' };
            } else {
                return { type: 'coins', amount: 300, tier: 'uncommon', tierName: 'Uncommon' };
            }
        }
    }
    
    // Common tier (60% chance)
    const itemRoll = Math.random();
    if (itemRoll < 0.33) {
        return { type: 'coins', amount: 100, tier: 'common', tierName: 'Common' };
    } else if (itemRoll < 0.66) {
        return { type: 'coins', amount: 200, tier: 'common', tierName: 'Common' };
    } else {
        return { type: 'streak_freeze', amount: 1, tier: 'common', tierName: 'Common' };
    }
}

// 9. Helper updates
function updateHeaderBalances() {
    coinBalanceSpan.textContent = state.coins;
}

function updateHeaderProfileBorder() {
    if (!headerEquippedBorder) return;
    if (state.equippedId !== null) {
        const item = bordersData.find(b => b.id === state.equippedId);
        if (item) {
            headerEquippedBorder.src = item.image;
            headerEquippedBorder.style.filter = item.filter || 'none';
            headerEquippedBorder.style.display = 'block';
            return;
        }
    }
    headerEquippedBorder.style.display = 'none';
    headerEquippedBorder.src = '';
}

// Pagination page change
function changePage(direction) {
    const targetPage = state.currentPage + direction;
    if (targetPage >= 1 && targetPage <= totalPages) {
        const grids = [shelfGridRow1, shelfGridRow2];
        grids.forEach(grid => {
            grid.style.opacity = '0.3';
            grid.style.transform = 'scale(0.98)';
            grid.style.transition = 'all 0.15s ease';
        });

        setTimeout(() => {
            state.currentPage = targetPage;
            renderShop();
            grids.forEach(grid => {
                grid.style.opacity = '1';
                grid.style.transform = 'scale(1)';
            });
        }, 150);
    }
}

// Jiggle animations
function triggerCoinJiggle() {
    coinDisplayContainer.classList.remove('coin-jiggle');
    void coinDisplayContainer.offsetWidth;
    coinDisplayContainer.classList.add('coin-jiggle');
}

// 10. Custom Toast Notifications
function showToast(message, isSuccess) {
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    toastMessage.textContent = message;
    
    if (isSuccess) {
        toastIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        toastNotification.className = "toast-container toast-success";
    } else {
        toastIcon.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="#C62828" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
        toastNotification.className = "toast-container toast-error";
    }

    toastNotification.classList.add('active');

    toastTimeout = setTimeout(() => {
        toastNotification.classList.remove('active');
    }, 2800);
}

// Start application
window.addEventListener('DOMContentLoaded', init);
