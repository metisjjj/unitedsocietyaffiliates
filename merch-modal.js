(function () {
    const STORAGE_KEY = 'usa-merch-modal-dismissed';
    const SHOW_DELAY_MS = 1500;

    function hasBeenDismissed() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch (e) {
            return false; // if storage is unavailable, fail open (show once, not persisted)
        }
    }

    function markDismissed() {
        try {
            localStorage.setItem(STORAGE_KEY, 'true');
        } catch (e) {
            // ignore — worst case the modal reappears next visit
        }
    }

    function closeModal(overlay) {
        markDismissed();
        overlay.classList.remove('merch-modal-open');
        setTimeout(() => overlay.remove(), 300);
    }

    function buildModal() {
        const overlay = document.createElement('div');
        overlay.className = 'merch-modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'merch-modal-heading');
        overlay.innerHTML = `
            <div class="merch-modal">
                <button type="button" class="merch-modal-close" aria-label="Close">&times;</button>
                <img src="images/big-cuzin-merch-jersey-hoodie.PNG" alt="Big Cuzin' jersey raglan hoodies in blue, black, and green" class="merch-modal-img">
                <div class="merch-modal-body">
                    <h2 id="merch-modal-heading" data-i18n="merchmodal.heading">Shop Cuzin' Merchandise</h2>
                    <p data-i18n="merchmodal.body">Hoodies, hats, sweatsuits, and more. Wear the name. Represent the movement. A portion of proceeds supports the Big Cuzin' Program.</p>
                    <div class="merch-modal-actions">
                        <a href="https://shop.unitedsocietyaffiliates.org" target="_blank" rel="noopener" class="btn btn-shop merch-modal-shop-btn" data-i18n="merchmodal.shop-now">Shop Now</a>
                        <button type="button" class="merch-modal-dismiss" data-i18n="merchmodal.no-thanks">No thanks</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => overlay.classList.add('merch-modal-open'), SHOW_DELAY_MS);

        overlay.querySelector('.merch-modal-close').addEventListener('click', () => closeModal(overlay));
        overlay.querySelector('.merch-modal-dismiss').addEventListener('click', () => closeModal(overlay));
        overlay.querySelector('.merch-modal-shop-btn').addEventListener('click', () => markDismissed());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay);
        });
        document.addEventListener('keydown', function onKeydown(e) {
            if (e.key === 'Escape' && overlay.isConnected) {
                closeModal(overlay);
                document.removeEventListener('keydown', onKeydown);
            }
        });

        return overlay;
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (hasBeenDismissed()) return;

        // Wait for i18n.js's initial dictionary load (if present) so the modal renders
        // already translated instead of flashing English first on non-English visits.
        const i18nReady = (window.usaI18n && window.usaI18n.ready) || Promise.resolve();
        i18nReady.then(() => {
            if (hasBeenDismissed()) return; // re-check in case the user dismissed via another tab/action meanwhile
            const overlay = buildModal();
            if (window.usaI18n && typeof window.usaI18n.translateSubtree === 'function') {
                window.usaI18n.translateSubtree(overlay);
            }
        });
    });
})();
