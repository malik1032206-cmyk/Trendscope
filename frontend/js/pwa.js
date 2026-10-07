// ─── PWA Registration & Install Prompt System ──────────────────────────────
(function () {
    'use strict';

    let deferredPrompt = null;

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    console.log('✅ TrendScope PWA registered with scope:', registration.scope);
                })
                .catch((error) => {
                    console.warn('⚠️ PWA Service Worker registration failed:', error.message);
                });
        });
    }

    // Capture beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default browser banner
        e.preventDefault();
        deferredPrompt = e;

        // Show custom install prompt in UI if user hasn't dismissed it
        if (!localStorage.getItem('pwa_dismissed')) {
            showInstallBanner();
        }
    });

    // Detect when PWA has been installed
    window.addEventListener('appinstalled', () => {
        console.log('🎉 TrendScope PWA was installed successfully!');
        hideInstallBanner();
        deferredPrompt = null;
    });

    function showInstallBanner() {
        if (document.getElementById('pwa-install-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="pwa-banner-left">
                <img src="/favicon.svg" alt="TrendScope App Icon" class="pwa-app-icon" />
                <div class="pwa-text">
                    <strong class="pwa-title">Install TrendScope App</strong>
                    <span class="pwa-subtitle">Fast, standalone access with instant trend alerts</span>
                </div>
            </div>
            <div class="pwa-banner-actions">
                <button class="pwa-install-btn" id="pwa-install-btn">Install App</button>
                <button class="pwa-dismiss-btn" id="pwa-dismiss-btn" title="Dismiss" aria-label="Dismiss">&times;</button>
            </div>
        `;

        document.body.appendChild(banner);

        document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('User response to install prompt:', outcome);
            deferredPrompt = null;
            hideInstallBanner();
        });

        document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
            localStorage.setItem('pwa_dismissed', 'true');
            hideInstallBanner();
        });
    }

    function hideInstallBanner() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.classList.add('closing');
            setTimeout(() => banner.remove(), 300);
        }
    }

    // Expose prompt trigger globally (e.g. for a sidebar / settings button)
    window.triggerPWAInstall = function () {
        if (deferredPrompt) {
            deferredPrompt.prompt();
        } else {
            alert('To install TrendScope, tap your browser menu (⋮ or Share) and select "Add to Home Screen" or "Install App".');
        }
    };
})();
