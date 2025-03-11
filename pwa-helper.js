/**
 * PWA Home Screen Launch Helper
 * This script detects standalone mode and ensures resources are cached
 */

(function() {
    // Check if we're running in standalone mode (home screen)
    const isInStandaloneMode = () => 
      (window.matchMedia('(display-mode: standalone)').matches) || 
      (window.navigator.standalone) || 
      document.referrer.includes('android-app://');
  
    // Log launch mode for debugging
    if (isInStandaloneMode()) {
      console.log('App running in standalone/PWA mode');
      localStorage.setItem('pwa_mode', 'standalone');
      document.documentElement.classList.add('pwa-mode');
    } else {
      console.log('App running in browser mode');
      localStorage.setItem('pwa_mode', 'browser');
      document.documentElement.classList.remove('pwa-mode');
    }
  
    // Check if this is first launch from home screen
    if (isInStandaloneMode() && !localStorage.getItem('pwa_launched_before')) {
      console.log('First launch from home screen detected');
      localStorage.setItem('pwa_launched_before', 'true');
      localStorage.setItem('pwa_first_launch', new Date().toISOString());
    }
  
    // For standalone mode, ensure we have a recent cache
    if (isInStandaloneMode()) {
      // Check if we need to refresh the cache (e.g., if it's older than 1 day)
      const lastCacheCheck = localStorage.getItem('pwa_cache_check');
      const now = new Date().getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      if (!lastCacheCheck || (now - new Date(lastCacheCheck).getTime()) > oneDayMs) {
        console.log('Refreshing PWA cache');
        localStorage.setItem('pwa_cache_check', new Date().toISOString());
        
        // Request cache update from service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'REFRESH_CACHE'
          });
        }
      }
    }
  
    // Add home screen installation instructions if not already installed
    const showInstallPrompt = () => {
      // Only show in browser mode, not when already installed
      if (isInStandaloneMode() || localStorage.getItem('pwa_install_prompted')) {
        return;
      }
      
      // Create the install banner
      const banner = document.createElement('div');
      banner.className = 'pwa-install-banner';
      banner.innerHTML = `
        <div style="display: flex; align-items: center; padding: 12px; background: #2196F3; color: white; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; box-shadow: 0px -2px 10px rgba(0,0,0,0.2);">
          <div style="flex: 1; margin-right: 16px;">
            <p style="margin: 0; font-weight: bold;">Add to Home Screen</p>
            <p style="margin: 4px 0 0 0; font-size: 14px;">For better offline access</p>
          </div>
          <button id="pwa-install-later" style="background: transparent; border: 1px solid white; color: white; padding: 8px 16px; margin-right: 8px; border-radius: 4px;">Later</button>
          <button id="pwa-install-now" style="background: white; border: none; color: #2196F3; padding: 8px 16px; border-radius: 4px; font-weight: bold;">Install</button>
        </div>
      `;
      document.body.appendChild(banner);
      
      // Handle "Later" button
      document.getElementById('pwa-install-later').addEventListener('click', () => {
        banner.remove();
        // Remember choice for 3 days
        const threeDay = 3 * 24 * 60 * 60 * 1000;
        localStorage.setItem('pwa_install_prompted', (new Date().getTime() + threeDay).toString());
      });
      
      // Handle "Install" button - display installation instructions
      document.getElementById('pwa-install-now').addEventListener('click', () => {
        banner.innerHTML = `
          <div style="padding: 20px; background: white; color: #333; position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; box-shadow: 0px -2px 10px rgba(0,0,0,0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="margin: 0; color: #2196F3;">How to Install</h3>
              <button id="pwa-close-instructions" style="background: none; border: none; font-size: 20px; cursor: pointer;">&times;</button>
            </div>
            <p><b>For iPhone/iPad:</b> Tap the share icon <span style="border: 1px solid #ccc; padding: 2px 6px; border-radius: 4px;">⇧</span> then select "Add to Home Screen"</p>
            <p><b>For Android:</b> Tap the menu icon <span style="border: 1px solid #ccc; padding: 2px 6px; border-radius: 4px;">⋮</span> then select "Install App" or "Add to Home Screen"</p>
          </div>
        `;
        
        document.getElementById('pwa-close-instructions').addEventListener('click', () => {
          banner.remove();
          // Remember user saw instructions
          localStorage.setItem('pwa_install_prompted', 'true');
        });
      });
    };
    
    // Show install instructions after a 3-second delay
    if (!isInStandaloneMode() && !localStorage.getItem('pwa_install_prompted')) {
      setTimeout(showInstallPrompt, 3000);
    } else if (localStorage.getItem('pwa_install_prompted') && 
              !isNaN(localStorage.getItem('pwa_install_prompted'))) {
      // Check if the remembered time has passed
      const promptTime = parseInt(localStorage.getItem('pwa_install_prompted'));
      if (new Date().getTime() > promptTime) {
        localStorage.removeItem('pwa_install_prompted');
      }
    }
  
    // Monitor connectivity status
    const updateConnectionStatus = () => {
      const isOnline = navigator.onLine;
      document.documentElement.classList.toggle('is-offline', !isOnline);
      
      if (isInStandaloneMode()) {
        // In standalone mode, show a more prominent offline indicator
        let offlineIndicator = document.getElementById('pwa-offline-indicator');
        
        if (!isOnline) {
          if (!offlineIndicator) {
            offlineIndicator = document.createElement('div');
            offlineIndicator.id = 'pwa-offline-indicator';
            offlineIndicator.innerHTML = `
              <div style="position: fixed; top: 0; left: 0; right: 0; background: #FF9800; color: white; text-align: center; padding: 6px; z-index: 10000; font-weight: bold;">
                You are offline. Some features may be limited.
              </div>
            `;
            document.body.appendChild(offlineIndicator);
            
            // Adjust content to make room for the indicator
            document.body.style.paddingTop = '36px';
          }
        } else if (offlineIndicator) {
          offlineIndicator.remove();
          document.body.style.paddingTop = '';
        }
      }
    };
    
    // Initialize connection status
    updateConnectionStatus();
    
    // Listen for connection changes
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    // Save the current page to cache for offline access
    const cacheCurrentPage = () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_CURRENT_PAGE',
          url: window.location.href
        });
      }
    };
    
    // Cache current page when loaded
    window.addEventListener('load', cacheCurrentPage);
    
    // Make helper functions available globally for debugging
    window.pwaHelper = {
      isStandalone: isInStandaloneMode,
      cacheCurrentPage: cacheCurrentPage,
      showInstallPrompt: showInstallPrompt,
      refreshCache: () => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'REFRESH_CACHE'
          });
          return 'Cache refresh requested';
        }
        return 'No service worker controller available';
      }
    };
  })();