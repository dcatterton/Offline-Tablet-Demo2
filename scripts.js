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

  // Fixed PWA Installation Prompt
// Replace the previous installation code with this version

document.addEventListener('DOMContentLoaded', function() {
  // Store the installation event for later use
  let deferredPrompt = null;
  let installButtonAdded = false;
  
  // Create an installation button directly in the header
  function createInstallButton() {
    if (installButtonAdded) return;
    
    const headerElement = document.querySelector('.logoHeader');
    if (!headerElement) return;
    
    const installButton = document.createElement('forge-button');
    installButton.setAttribute('variant', 'unelevated');
    installButton.style.marginLeft = 'auto';
    installButton.style.marginRight = '12px';
    installButton.innerHTML = `
      <button slot="button" id="pwaInstallButton">
        <span style="display: flex; align-items: center;">
          <forge-icon external external-type="standard" name="get_app" 
            style="margin-right: 8px;"></forge-icon>
          Install App
        </span>
      </button>
    `;
    
    headerElement.appendChild(installButton);
    installButtonAdded = true;
    
    // Add click event listener
    document.getElementById('pwaInstallButton').addEventListener('click', function() {
      console.log('Install button clicked');
      if (deferredPrompt) {
        // Show the installation prompt
        console.log('Showing installation prompt');
        deferredPrompt.prompt();
        
        // Wait for the user's choice
        deferredPrompt.userChoice.then(function(choiceResult) {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the installation');
            showToast('Installation started!');
          } else {
            console.log('User declined the installation');
            showToast('Installation canceled');
          }
          // Reset the deferred prompt variable
          deferredPrompt = null;
        });
      } else {
        console.log('No installation prompt available');
        showManualInstallInstructions();
      }
    });
  }
  
  // Show a toast message
  function showToast(message) {
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
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(function() {
      toast.remove();
    }, 3000);
  }
  
  // Show manual installation instructions
  function showManualInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructionText = '';
    if (isIOS) {
      instructionText = `
        <p>To install this app on your iOS device:</p>
        <ol>
          <li>Tap the Share button at the bottom of your screen</li>
          <li>Scroll down and tap "Add to Home Screen"</li>
          <li>Tap "Add" in the top right corner</li>
        </ol>
      `;
    } else if (isAndroid) {
      instructionText = `
        <p>To install this app on your Android device:</p>
        <ol>
          <li>Tap the menu icon (three dots) in the top right</li>
          <li>Tap "Install app" or "Add to Home screen"</li>
          <li>Follow the on-screen instructions</li>
        </ol>
      `;
    } else {
      instructionText = `
        <p>To install this app on your device:</p>
        <ol>
          <li>Look for the install icon in your browser's address bar</li>
          <li>Click the install button when prompted</li>
          <li>Follow the on-screen instructions</li>
        </ol>
      `;
    }
    
    // Create a simple modal with instructions
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    modal.innerHTML = `
      <div style="background: white; padding: 20px; max-width: 80%; border-radius: 8px; position: relative;">
        <h3>Install This Application</h3>
        ${instructionText}
        <button id="closeInstructionsBtn" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 18px; cursor: pointer;">✕</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeInstructionsBtn').addEventListener('click', function() {
      modal.remove();
    });
  }
  
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', function(e) {
    console.log('beforeinstallprompt event fired');
    
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Store the event for later use
    deferredPrompt = e;
    
    // Create the install button if it doesn't exist
    createInstallButton();
  });
  
  // Check if the app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    console.log('App is already installed');
  } else {
    console.log('App is not installed');
    
    // If on iOS Safari, which doesn't support beforeinstallprompt
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.navigator.standalone) {
      createInstallButton(); // Create button that will show manual instructions
    }
  }
  
  // Alternative basic approach - add a direct button that calls prompt()
  // This is a more direct approach that might work better in some cases
  setTimeout(function() {
    if (!document.getElementById('pwaInstallButton') && !installButtonAdded) {
      const headerElement = document.querySelector('.logoHeader');
      if (headerElement) {
        const directInstallButton = document.createElement('button');
        directInstallButton.id = 'directInstallButton';
        directInstallButton.textContent = 'Install App';
        directInstallButton.style.marginLeft = 'auto';
        directInstallButton.style.marginRight = '12px';
        directInstallButton.style.padding = '8px 16px';
        directInstallButton.style.backgroundColor = '#2196F3';
        directInstallButton.style.color = 'white';
        directInstallButton.style.border = 'none';
        directInstallButton.style.borderRadius = '4px';
        directInstallButton.style.cursor = 'pointer';
        
        headerElement.appendChild(directInstallButton);
        
        directInstallButton.addEventListener('click', function() {
          console.log('Direct install button clicked');
          if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choiceResult) {
              console.log('User choice:', choiceResult.outcome);
              deferredPrompt = null;
            });
          } else {
            showManualInstallInstructions();
          }
        });
      }
    }
  }, 2000);
  
  // Debug logging to help understand installation state
  console.log('PWA install conditions:');
  console.log('- navigator.serviceWorker enabled:', 'serviceWorker' in navigator);
  console.log('- window.matchMedia standalone:', window.matchMedia('(display-mode: standalone)').matches);
  console.log('- navigator.standalone (iOS):', window.navigator.standalone);
});