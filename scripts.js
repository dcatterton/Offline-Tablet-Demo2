(function () {

    var clockElement = document.getElementById( "clock" );
  
    function updateClock ( clock ) {
      clock.innerHTML = new Date().toLocaleTimeString();
    }
  
    setInterval(function () {
        updateClock( clockElement );
    }, 1000);
  
  }());

// Wai for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Target the buttons using more specific selectors
    const scrollUpButton = document.querySelector('.scrollUp forge-button-area button');
    const scrollDownButton = document.querySelector('.scrollDown forge-button-area button');
    
    // Get the main scrollable content area
    const mainContent = document.querySelector('.rightBody');
    
    // Define how many pixels to scroll each time a button is clicked
    const scrollAmount = 300;
    
    console.log('Scroll buttons initialized:', {
        upButton: scrollUpButton,
        downButton: scrollDownButton,
        content: mainContent
    });
    
    // Add click event listener for the scroll up button
    if (scrollUpButton) {
        scrollUpButton.addEventListener('click', function(e) {
            console.log('Scroll up button clicked');
            e.preventDefault();
            window.scrollBy({
                top: -scrollAmount,
                behavior: 'smooth'
            });
        });
    }
    
    // Add click event listener for the scroll down button
    if (scrollDownButton) {
        scrollDownButton.addEventListener('click', function(e) {
            console.log('Scroll down button clicked');
            e.preventDefault();
            window.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });
        });
    }
    
    // Alternative method - target the entire button area
    const scrollUpArea = document.querySelector('.scrollUp forge-button-area');
    const scrollDownArea = document.querySelector('.scrollDown forge-button-area');
    
    if (scrollUpArea) {
        scrollUpArea.addEventListener('click', function(e) {
            console.log('Scroll up area clicked');
            window.scrollBy({
                top: -scrollAmount,
                behavior: 'smooth'
            });
        });
    }
    
    if (scrollDownArea) {
        scrollDownArea.addEventListener('click', function(e) {
            console.log('Scroll down area clicked');
            window.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });
        });
    }
});

// Add fullscreen functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create a fullscreen button
    const fullscreenButton = document.createElement('forge-card');
    fullscreenButton.className = 'actionBtn fullscreenBtn';
    fullscreenButton.innerHTML = `
        <forge-button-area>
            <button slot="button" aria-labelledby="button-heading"></button>
            <div class="content">
                <forge-icon external external-type="standard" slot="start" role="img" name="fullscreen" 
                    aria-label="Fullscreen icon"></forge-icon>
            </div>
        </forge-button-area>
    `;
    
    // Add the button to the DOM - you can adjust where it appears
    const headerElement = document.querySelector('.logoHeader');
    if (headerElement) {
        headerElement.appendChild(fullscreenButton);
    }
    
    // Add click event to toggle fullscreen
    fullscreenButton.addEventListener('click', function() {
        toggleFullScreen();
    });
    
    // Function to toggle fullscreen mode
    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) { // Firefox
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
                document.documentElement.msRequestFullscreen();
            }
            
            // Change icon to exit fullscreen if desired
            const icon = fullscreenButton.querySelector('forge-icon');
            if (icon) {
                icon.setAttribute('name', 'fullscreen_exit');
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
            
            // Change icon back to fullscreen
            const icon = fullscreenButton.querySelector('forge-icon');
            if (icon) {
                icon.setAttribute('name', 'fullscreen');
            }
        }
    }
    
    // Listen for fullscreen change events to update button appearance
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
    
    function updateFullscreenButton() {
        const icon = fullscreenButton.querySelector('forge-icon');
        if (icon) {
            if (document.fullscreenElement) {
                icon.setAttribute('name', 'fullscreen_exit');
            } else {
                icon.setAttribute('name', 'fullscreen');
            }
        }
    }
    
    // Optional: Allow keyboard shortcut for fullscreen (F11)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFullScreen();
        }
    });
    
    
    document.body.addEventListener('click', function autoFullscreen() {
        toggleFullScreen();
        document.body.removeEventListener('click', autoFullscreen);
    }, { once: true });

});

// PWA registration code - add this to your scripts.js file
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
          // Optional: Create an install button for the PWA
          let deferredPrompt;
          const installButton = document.createElement('forge-card');
          installButton.className = 'actionBtn pwaInstallBtn';
          installButton.style.display = 'none';
          installButton.innerHTML = `
            <forge-button-area>
              <button slot="button" aria-labelledby="button-heading"></button>
              <div class="content">
                <forge-icon external external-type="standard" slot="start" role="img" name="get_app" 
                  aria-label="Install app icon"></forge-icon>
                <p class="forge-typography--heading3">Install App</p>
              </div>
            </forge-button-area>
          `;
          
          // Add the install button to the header
          const headerElement = document.querySelector('.logoHeader');
          if (headerElement) {
            headerElement.appendChild(installButton);
          }
          
          // Show the install button when the PWA can be installed
          window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            deferredPrompt = e;
            // Show the install button
            installButton.style.display = 'block';
          });
          
          // Handle the install button click
          installButton.addEventListener('click', () => {
            // Hide the install button
            installButton.style.display = 'none';
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
              } else {
                console.log('User dismissed the install prompt');
              }
              deferredPrompt = null;
            });
          });
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  }

  // Add this to your scripts.js file

// Offline handling and PWA enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Network status monitoring
    function updateOnlineStatus() {
      const status = navigator.onLine ? 'online' : 'offline';
      console.log('Network status changed to:', status);
      
      if (navigator.onLine) {
        document.body.classList.remove('is-offline');
        // Show a quick toast or notification that we're back online
        showToast('You are back online!', 'success');
      } else {
        document.body.classList.add('is-offline');
        // Show an offline notification
        showToast('You are offline. Some features may be limited.', 'warning');
      }
    }
  
    // Initial check
    updateOnlineStatus();
    
    // Add event listeners for network status changes
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Simple toast notification system
    function showToast(message, type = 'info') {
      // Check if we already have a toast container
      let toastContainer = document.querySelector('.toast-container');
      
      if (!toastContainer) {
        // Create a container for toast messages
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
        
        // Add some basic styling
        const style = document.createElement('style');
        style.textContent = `
          .toast-container {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .toast {
            padding: 10px 20px;
            margin: 5px;
            border-radius: 4px;
            color: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            max-width: 300px;
            text-align: center;
          }
          .toast.show {
            opacity: 1;
            transform: translateY(0);
          }
          .toast.info {
            background-color: #2196F3;
          }
          .toast.success {
            background-color: #4CAF50;
          }
          .toast.warning {
            background-color: #FF9800;
          }
          .toast.error {
            background-color: #F44336;
          }
        `;
        document.head.appendChild(style);
      }
      
      // Create the toast element
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      
      // Add to the container
      toastContainer.appendChild(toast);
      
      // Trigger animation
      setTimeout(() => {
        toast.classList.add('show');
      }, 10);
      
      // Remove after 3 seconds
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 3000);
    }
    
    // Force service worker update and registration on each page load
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Check for updates to the service worker
          registration.update();
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
        
      // Create a loading spinner that appears during service worker operations
    //   const spinner = document.createElement('div');
    //   spinner.className = 'loading-spinner';
    //   document.body.appendChild(spinner);
    }
    
    // Check if content fails to load and offer refresh
    window.addEventListener('error', function(e) {
      // Only handle resource loading errors
      if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
        console.warn('Resource failed to load:', e.target.src || e.target.href);
        
        // If we're online but resources fail, it might be a caching issue
        if (navigator.onLine && !document.body.classList.contains('resource-error-shown')) {
          showToast('Some resources failed to load. Try refreshing the page.', 'warning');
          document.body.classList.add('resource-error-shown');
        }
      }
    }, true); // Use capturing to catch all resource errors
    
    // Add a helper function to check cache health
    window.checkCacheHealth = async function() {
      try {
        if ('caches' in window) {
          // Get all cache names
          const cacheNames = await caches.keys();
          console.log('Available caches:', cacheNames);
          
          // Check what's in each cache
          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            console.log(`Cache "${cacheName}" contains ${requests.length} items`);
            
            // Log the first 5 items
            console.log('Sample items:', requests.slice(0, 5).map(req => req.url));
          }
          
          return 'Cache inspection complete. See console for details.';
        } else {
          return 'Cache API not available in this browser.';
        }
      } catch (error) {
        console.error('Error checking cache:', error);
        return 'Error checking cache: ' + error.message;
      }
    };
    
    // Periodically check for service worker updates (every 30 minutes)
    setInterval(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.update();
          console.log('Service worker update check');
        });
      }
    }, 30 * 60 * 1000);
  });

  // Enhanced PWA Installation Prompt
// Add this to your scripts.js file

document.addEventListener('DOMContentLoaded', function() {
  // Track installation state
  let deferredPrompt;
  let installPromptShown = false;
  
  // Create the install promotion banner
  const createInstallBanner = () => {
    const banner = document.createElement('forge-card');
    banner.className = 'pwa-install-banner';
    banner.style.display = 'none';
    banner.style.position = 'fixed';
    banner.style.bottom = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.padding = '12px';
    banner.style.backgroundColor = '#2196F3';
    banner.style.color = 'white';
    banner.style.zIndex = '9999';
    banner.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.2)';
    
    banner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <forge-icon external external-type="standard" slot="start" role="img" name="get_app" 
            aria-label="Install app icon" style="margin-right: 12px; color: white;"></forge-icon>
          <div>
            <p class="forge-typography--heading3" style="margin: 0; color: white;">Install Tyler Inmate System</p>
            <p class="forge-typography--body1" style="margin: 0; color: white;">Add this app to your home screen for easy access</p>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <forge-button>
            <button slot="button" class="pwa-install-later">Later</button>
          </forge-button>
          <forge-button variant="unelevated">
            <button slot="button" class="pwa-install-now">Install Now</button>
          </forge-button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    return banner;
  };
  
  // Create floating install button (appears in bottom right corner)
  const createFloatingInstallButton = () => {
    const button = document.createElement('div');
    button.className = 'pwa-floating-install-button';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.backgroundColor = '#2196F3';
    button.style.color = 'white';
    button.style.width = '56px';
    button.style.height = '56px';
    button.style.borderRadius = '50%';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
    button.style.cursor = 'pointer';
    button.style.zIndex = '999';
    button.style.display = 'none';
    
    button.innerHTML = `
      <forge-icon external external-type="standard" role="img" name="get_app" 
        aria-label="Install app icon" style="color: white;"></forge-icon>
    `;
    
    document.body.appendChild(button);
    return button;
  };
  
  // Create elements for installation
  const installBanner = createInstallBanner();
  const floatingButton = createFloatingInstallButton();
  
  // Create menu option for installation
  const addInstallMenuItem = () => {
    const menuElement = document.querySelector('.leftMenu');
    
    if (menuElement) {
      const installOption = document.createElement('forge-card');
      installOption.className = 'menuCard';
      installOption.style.marginTop = '16px';
      installOption.innerHTML = `
        <forge-button-area>
          <button slot="button" class="pwa-menu-install-button" aria-labelledby="button-heading"></button>
          <div style="padding: 12px; display: flex; align-items: center;">
            <forge-icon external external-type="standard" slot="start" role="img" name="get_app" 
              aria-label="Install app icon" style="margin-right: 12px;"></forge-icon>
            <p class="forge-typography--heading3" style="margin: 0;">Install this app</p>
          </div>
        </forge-button-area>
      `;
      
      menuElement.appendChild(installOption);
      
      const menuInstallButton = installOption.querySelector('.pwa-menu-install-button');
      menuInstallButton.addEventListener('click', () => {
        if (deferredPrompt) {
          showInstallPrompt();
        } else {
          showManualInstallInstructions();
        }
      });
      
      // Hide initially if the app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        installOption.style.display = 'none';
      }
    }
  };
  
  // Add installation menu item
  addInstallMenuItem();
  
  // Function to show installation prompt
  const showInstallPrompt = () => {
    if (!deferredPrompt) {
      console.log('No installation prompt available');
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    installPromptShown = true;
    
    // Hide the banner and button
    installBanner.style.display = 'none';
    floatingButton.style.display = 'none';
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        
        // Show a success message
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#4CAF50';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '4px';
        toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        toast.style.zIndex = '9999';
        toast.textContent = 'App installation started!';
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.remove();
        }, 3000);
        
      } else {
        console.log('User dismissed the install prompt');
        
        // Show the floating button again after a delay
        setTimeout(() => {
          floatingButton.style.display = 'flex';
        }, 300000); // Show again after 5 minutes
      }
      
      // Reset the deferred prompt variable
      deferredPrompt = null;
    });
  };
  
  // Function to show manual installation instructions
  const showManualInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isIOS) {
      instructions = `
        <p>To install this app on iOS:</p>
        <ol>
          <li>Tap the Share button <forge-icon external external-type="standard" name="share"></forge-icon> in Safari</li>
          <li>Scroll down and tap "Add to Home Screen"</li>
          <li>Tap "Add" in the upper right corner</li>
        </ol>
      `;
    } else if (isAndroid) {
      instructions = `
        <p>To install this app on Android:</p>
        <ol>
          <li>Tap the menu button <forge-icon external external-type="standard" name="more_vert"></forge-icon> in Chrome</li>
          <li>Tap "Add to Home screen"</li>
          <li>Follow the on-screen instructions</li>
        </ol>
      `;
    } else {
      instructions = `
        <p>To install this app:</p>
        <ol>
          <li>Open this website in Chrome, Edge, or Firefox</li>
          <li>Click the install icon <forge-icon external external-type="standard" name="get_app"></forge-icon> in the address bar</li>
          <li>Follow the on-screen instructions</li>
        </ol>
      `;
    }
    
    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10000';
    
    modal.innerHTML = `
      <forge-card style="max-width: 400px; width: 90%;">
        <div style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <p class="forge-typography--heading2" style="margin: 0;">Install this app</p>
            <forge-icon external external-type="standard" name="close" class="close-modal" 
              style="cursor: pointer;"></forge-icon>
          </div>
          <div>${instructions}</div>
          <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
            <forge-button variant="unelevated">
              <button slot="button" class="close-modal">Got it</button>
            </forge-button>
          </div>
        </div>
      </forge-card>
    `;
    
    document.body.appendChild(modal);
    
    // Add close functionality
    const closeButtons = modal.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        modal.remove();
      });
    });
  };
  
  // Listen for before install prompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Only show installation prompt if user has been on the site for a while
    // or has visited multiple pages
    setTimeout(() => {
      if (!installPromptShown) {
        // Show the install banner
        installBanner.style.display = 'block';
        
        // Add event listeners for the banner buttons
        const installNowButton = document.querySelector('.pwa-install-now');
        const installLaterButton = document.querySelector('.pwa-install-later');
        
        if (installNowButton) {
          installNowButton.addEventListener('click', showInstallPrompt);
        }
        
        if (installLaterButton) {
          installLaterButton.addEventListener('click', () => {
            installBanner.style.display = 'none';
            // Show the floating button instead
            floatingButton.style.display = 'flex';
          });
        }
      }
    }, 30000); // Wait 30 seconds before showing
  });
  
  // Add click event to the floating button
  floatingButton.addEventListener('click', () => {
    if (deferredPrompt) {
      showInstallPrompt();
    } else {
      showManualInstallInstructions();
    }
  });
  
  // Check if app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator.standalone === true)) {
    console.log('App is already installed');
    // Hide install elements if already installed
    installBanner.style.display = 'none';
    floatingButton.style.display = 'none';
  }
  
  // Add a special initialization for iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS && !window.navigator.standalone) {
    // iOS doesn't support beforeinstallprompt, so we'll show a hint after a delay
    setTimeout(() => {
      if (!document.cookie.includes('ios-install-hint-shown')) {
        const iosHint = document.createElement('forge-card');
        iosHint.className = 'ios-install-hint';
        iosHint.style.position = 'fixed';
        iosHint.style.bottom = '0';
        iosHint.style.left = '0';
        iosHint.style.right = '0';
        iosHint.style.backgroundColor = '#2196F3';
        iosHint.style.color = 'white';
        iosHint.style.padding = '12px';
        iosHint.style.zIndex = '9999';
        
        iosHint.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <p class="forge-typography--heading3" style="margin: 0; color: white;">Install this app on your iPhone</p>
              <p class="forge-typography--body1" style="margin: 0; color: white;">Tap <forge-icon external external-type="standard" name="share"></forge-icon> then "Add to Home Screen"</p>
            </div>
            <forge-button>
              <button slot="button" class="ios-hint-close">Got it</button>
            </forge-button>
          </div>
        `;
        
        document.body.appendChild(iosHint);
        
        const closeButton = iosHint.querySelector('.ios-hint-close');
        closeButton.addEventListener('click', () => {
          iosHint.remove();
          // Set a cookie to remember that we've shown the hint
          document.cookie = 'ios-install-hint-shown=true; max-age=604800'; // 1 week
        });
      }
    }, 60000); // Show after 1 minute
  }
});