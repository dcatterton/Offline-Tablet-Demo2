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
      const spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      document.body.appendChild(spinner);
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