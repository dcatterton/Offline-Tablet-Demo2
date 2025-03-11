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


  // Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Cart items array to store purchases
  let cartItems = [];
  
  // Store original balance value when page loads
  const originalBalance = document.getElementById('inmateBalance').textContent;
  
  // Function to show order confirmation dialog
  function showOrderConfirmationDialog(subtotal, salesTax, totalCartValue) {
    // Create dialog if it doesn't exist
    let dialogElement = document.querySelector('.orderConfirmationDialog');
    if (!dialogElement) {
      dialogElement = document.createElement('forge-dialog');
      dialogElement.className = 'orderConfirmationDialog';
      document.body.appendChild(dialogElement);
    }
    
    // Set dialog content
    dialogElement.innerHTML = `
      <forge-scaffold>
        <forge-toolbar slot="header">
          <h1 class="forge-typography--heading4" id="confirmation-title" slot="start">
            Order Confirmation
          </h1>
          <forge-icon-button slot="end" aria-label="Close dialog" class="confirm-close-btn">
            <forge-icon name="close"></forge-icon>
          </forge-icon-button>
        </forge-toolbar>
        <div slot="body" class="dialog-content">
          <forge-card style="margin-bottom: 16px;">
            <div style="padding: 16px;">
              <p class="forge-typography--heading1" style="color: green; text-align: center; margin-bottom: 16px;">
                Order Submitted Successfully
              </p>
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <p class="forge-typography--heading3 noMargin">Subtotal:</p>
                  <p class="forge-typography--heading3 noMargin">$${subtotal.toFixed(2)}</p>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <p class="forge-typography--heading3 noMargin">Sales Tax (9%):</p>
                  <p class="forge-typography--heading3 noMargin">$${salesTax.toFixed(2)}</p>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #eee;">
                  <p class="forge-typography--heading2 noMargin">Total:</p>
                  <p class="forge-typography--heading2 noMargin">$${totalCartValue.toFixed(2)}</p>
                </div>
              </div>
              <p class="forge-typography--subheading1" style="text-align: center;">
                Your order has been submitted. Thank you for your purchase!
              </p>
            </div>
          </forge-card>
        </div>
        <forge-toolbar slot="footer" inverted>
          <forge-button slot="end" variant="filled" class="confirm-done-btn">Done</forge-button>
        </forge-toolbar>
      </forge-scaffold>
    `;
    
    // Show dialog
    dialogElement.open = true;
    
    // Add event listeners to close and done buttons
    const closeBtn = dialogElement.querySelector('.confirm-close-btn');
    const doneBtn = dialogElement.querySelector('.confirm-done-btn');
    
    const closeDialog = () => {
      dialogElement.open = false;
    };
    
    closeBtn.addEventListener('click', closeDialog);
    doneBtn.addEventListener('click', closeDialog);
  }
  
  // Function to show quantity selection dialog
  function showQuantityDialog(itemName, price) {
    // Create dialog if it doesn't exist
    let dialogElement = document.querySelector('.selectQuantityDialog');
    if (!dialogElement) {
      dialogElement = document.createElement('forge-dialog');
      dialogElement.className = 'selectQuantityDialog';
      document.body.appendChild(dialogElement);
    }
    
    // Generate quantities (1-12)
    const quantities = Array.from({ length: 12 }, (_, i) => i + 1);
    
    // Generate HTML for quantity buttons
    let quantityButtonsHTML = '';
    quantities.forEach(qty => {
      const totalPrice = (price * qty).toFixed(2);
      quantityButtonsHTML += `
        <forge-card class="quantityBtn" data-quantity="${qty}" data-price="${totalPrice}">
          <div class="quantityFlex">
            <p class="forge-typography--heading1 quantity">${qty}</p>
            <p class="forge-typography--subheading1 pricePerQuantity">$${totalPrice}</p>
          </div>
        </forge-card>
      `;
    });
    
    // Set dialog content
    dialogElement.innerHTML = `
      <forge-scaffold>
        <forge-toolbar slot="header">
          <h1 class="forge-typography--heading4" id="dialog-title" slot="start">
            Select quantity
          </h1>
          <forge-icon-button slot="end" aria-label="Close dialog" class="dialog-close-btn">
            <forge-icon name="close"></forge-icon>
          </forge-icon-button>
        </forge-toolbar>
        <div slot="body" class="dialog-content">
          <p class="forge-typography--subheading2 itemName" style="margin-bottom:20px;">${itemName}</p>
          <forge-stack inline gap="16" stretch wrap>
            ${quantityButtonsHTML}
          </forge-stack>
        </div>
        <forge-toolbar slot="footer" inverted>
          <forge-button slot="end" variant="outlined" class="cancel-btn">Cancel</forge-button>
        </forge-toolbar>
      </forge-scaffold>
    `;
    
    // Show dialog
    dialogElement.open = true;
    
    // Add event listeners to quantity buttons
    const quantityButtons = dialogElement.querySelectorAll('.quantityBtn');
    quantityButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const quantity = parseInt(this.dataset.quantity);
        const totalPrice = parseFloat(this.dataset.price);
        
        // Add to cart
        addToCart(itemName, quantity, price, totalPrice);
        
        // Close dialog
        dialogElement.open = false;
      });
    });
    
    // Add event listeners to close and cancel buttons
    const closeBtn = dialogElement.querySelector('.dialog-close-btn');
    const cancelBtn = dialogElement.querySelector('.cancel-btn');
    
    closeBtn.addEventListener('click', () => {
      dialogElement.open = false;
    });
    
    cancelBtn.addEventListener('click', () => {
      dialogElement.open = false;
    });
  }
  
  // Function to add item to cart
  function addToCart(itemName, quantity, unitPrice, totalPrice) {
    // Create cart item object
    const cartItem = {
      name: itemName,
      quantity: quantity,
      unitPrice: unitPrice,
      totalPrice: totalPrice
    };
    
    // Add to cart items array
    cartItems.push(cartItem);
    
    // Update cart display
    updateCartDisplay();
  }
  
  // Function to update cart display
  function updateCartDisplay() {
    const cartContainer = document.querySelector('.cartItems');
    
    if (cartItems.length === 0) {
      cartContainer.innerHTML = '<p class="forge-typography--heading1">No items added to cart</p>';
      return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    
    cartItems.forEach((item, index) => {
      subtotal += item.totalPrice;
      cartHTML += `
        <forge-card class="cartItemCard" style="margin-bottom: 8px;">
          <div style="padding: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p class="forge-typography--heading1 noMargin">${item.name}</p>
              <forge-icon-button class="remove-item-btn" data-index="${index}" aria-label="Remove item">
                <forge-icon name="close"></forge-icon>
              </forge-icon-button>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 4px;">
              <p class="forge-typography--subheading1 noMargin">Qty: ${item.quantity}</p>
              <p class="forge-typography--subheading1 noMargin">$${item.totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </forge-card>
      `;
    });
    
    // Calculate tax and total
    const salesTax = subtotal * 0.09;
    const totalCartValue = subtotal + salesTax;
    
    // Add subtotal, tax, and total to cart
    cartHTML += `
      <forge-card style="margin-bottom: 8px;">
        <div style="padding: 8px; display: flex; justify-content: space-between; align-items: center;">
          <p class="forge-typography--heading1 noMargin">Subtotal:</p>
          <p class="forge-typography--heading1 noMargin">$${subtotal.toFixed(2)}</p>
        </div>
      </forge-card>
      <forge-card style="margin-bottom: 8px;">
        <div style="padding: 8px; display: flex; justify-content: space-between; align-items: center;">
          <p class="forge-typography--heading1 noMargin">Sales Tax (9%):</p>
          <p class="forge-typography--heading1 noMargin">$${salesTax.toFixed(2)}</p>
        </div>
      </forge-card>
      <forge-card style="margin-bottom: 16px;">
        <div style="padding: 8px; display: flex; justify-content: space-between; align-items: center;">
          <p class="forge-typography--heading1 noMargin">Total:</p>
          <p class="forge-typography--heading1 noMargin">$${totalCartValue.toFixed(2)}</p>
        </div>
      </forge-card>
      <forge-card class="actionBtn">
        <forge-button-area>
          <button slot="button" aria-labelledby="checkout-btn"></button>
          <div class="content">
            <forge-icon external external-type="extended" slot="start" role="img" name="shopping_cart" aria-label="Shopping cart"></forge-icon>
            <p class="forge-typography--heading1">Checkout</p>
          </div>
        </forge-button-area>
      </forge-card>
    `;
    
    cartContainer.innerHTML = cartHTML;
    
    // Important: NO balance updates here! Balance only changes on checkout
    
    // Add event listeners to remove buttons
    const removeButtons = cartContainer.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(button => {
      button.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent bubbling to parent elements
        const index = parseInt(this.dataset.index);
        removeCartItem(index);
      });
    });
    
    // Add event listener to checkout button
    const checkoutButton = cartContainer.querySelector('.actionBtn');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', function() {
        // Calculate final values for checkout
        const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const salesTax = subtotal * 0.09;
        const totalCartValue = subtotal + salesTax;
        
        // Update inmate balance only at checkout
        const initialBalance = parseFloat(originalBalance.replace('$', ''));
        const remainingBalance = initialBalance - totalCartValue;
        document.getElementById('inmateBalance').textContent = `$${remainingBalance.toFixed(2)}`;
        
        // Show confirmation dialog instead of alert
        showOrderConfirmationDialog(subtotal, salesTax, totalCartValue);
        
        // Clear cart after checkout
        cartItems = [];
        updateCartDisplay();
      });
    }
  }
  
  // Function to remove item from cart
  function removeCartItem(index) {
    if (index >= 0 && index < cartItems.length) {
      cartItems.splice(index, 1);
      updateCartDisplay();
    }
  }

  // Add CSS for quantity dialog
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    
    .quantityBtn {
      cursor: pointer;
    }
    
    .quantityBtn:hover {
      background-color: #f0f0f0;
    }
    
    .dialog-content {
      padding: 16px;
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .cartItemCard {
      margin-bottom: 8px;
    }
    
    .noMargin {
      margin: 0;
    }
  `;
  document.head.appendChild(styleElement);
  
  // Get all category buttons
  const categoryButtons = document.querySelectorAll('.categoriesContainer .actionBtn');
  
  // Get the items container and categories container
  const itemsContainer = document.querySelector('.itemsContainer');
  const categoriesContainer = document.querySelector('.categoriesContainer');
  
  // Define products by category
  const productsByCategory = {
    "Food": [
      { name: "Cheesy Gordita Crunch", price: 4.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Doritos Locos Taco", price: 5.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Beef Burrito", price: 3.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Crunchwrap Supreme", price: 4.75, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Candy": [
      { name: "Snickers Bar", price: 1.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "M&Ms", price: 1.25, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Reese's Peanut Butter Cups", price: 1.75, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Twix", price: 1.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Indigent": [
      { name: "Basic Toiletry Kit", price: 0.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Soap", price: 0.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Toothbrush", price: 0.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Toothpaste", price: 0.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Apparel": [
      { name: "T-Shirt", price: 10.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Socks (3 Pack)", price: 5.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Underwear", price: 4.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Thermal Undershirt", price: 8.75, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Beverages": [
      { name: "Bottled Water", price: 1.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Orange Juice", price: 2.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Soda (Can)", price: 1.75, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Gatorade", price: 2.25, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Chips/Crackers/Nuts": [
      { name: "Doritos", price: 1.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Cheez-It Crackers", price: 1.25, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Peanuts", price: 1.75, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Potato Chips", price: 1.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Coffee/Drinks": [
      { name: "Instant Coffee Packets", price: 0.75, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Hot Chocolate Mix", price: 0.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Powdered Lemonade", price: 0.75, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Tea Bags", price: 0.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Conditments/Cheese": [
      { name: "Hot Sauce Packets", price: 0.25, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Cheese Spread", price: 1.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Ketchup Packets", price: 0.25, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Mayonnaise Packets", price: 0.25, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Cookies/Pastries": [
      { name: "Chocolate Chip Cookies", price: 2.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Honey Bun", price: 1.75, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Oatmeal Cookies", price: 2.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Vanilla Wafers", price: 1.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Gift Baskets": [
      { name: "Snack Bundle", price: 15.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Comfort Package", price: 20.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Hygiene Kit", price: 12.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Sweet Treats Pack", price: 18.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Hair products": [
      { name: "Shampoo", price: 3.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Conditioner", price: 3.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Hair Gel", price: 2.75, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Comb", price: 1.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Leisure": [
      { name: "Playing Cards", price: 3.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Puzzle Book", price: 4.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Word Search Book", price: 3.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Checkers Set", price: 5.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Medical": [
      { name: "Pain Reliever", price: 2.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Antacid", price: 2.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Bandages", price: 1.75, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Cough Drops", price: 1.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ],
    "Nicotine": [
      { name: "Nicotine Patches", price: 8.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Nicotine Gum", price: 7.50, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Nicotine Lozenges", price: 7.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" },
      { name: "Smoking Cessation Guide", price: 1.00, image: "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" }
    ]
  };
  
  // Initially hide the items container
  itemsContainer.style.display = 'none';
  
  // Function to generate HTML for product items
  function generateProductHTML(products) {
    // Create an array to hold pairs of products for each row
    const productRows = [];
    for (let i = 0; i < products.length; i += 2) {
      const row = [products[i]];
      if (i + 1 < products.length) {
        row.push(products[i + 1]);
      }
      productRows.push(row);
    }
    
    // Generate HTML for each row of products
    let html = '';
    productRows.forEach(row => {
      html += '<forge-stack inline stretch gap="16">';
      
      row.forEach(product => {
        html += `
          <forge-card class="itemBtn">
            <div class="itemFlex">
              <div class="itemNamePrice">
                <p class="forge-typography--heading3 itemName">${product.name}</p>
                <p class="forge-typography--heading3 price">$${product.price.toFixed(2)}</p>
              </div>
              <img src="${product.image}" class="productImg" />
            </div>
          </forge-card>
        `;
      });
      
      // If there's only one product in the row, add an empty placeholder
      if (row.length === 1) {
        html += '<div style="flex: 1;"></div>';
      }
      
      html += '</forge-stack>';
    });
    
    return html;
  }
  
  // Add click event listener to each category button
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Get the category name from the button
      const categoryName = this.querySelector('.forge-typography--heading1').textContent;
      
      // Update the category name in the items container header
      document.querySelector('.categoryName').textContent = categoryName;
      
      // Get products for this category
      const products = productsByCategory[categoryName] || [];
      
      // Generate HTML for the products
      const productsHTML = generateProductHTML(products);
      
      // Update the items container content (keeping the toolbar at the top)
      const toolbar = itemsContainer.querySelector('.categoriesToolbar').outerHTML;
      itemsContainer.innerHTML = toolbar + productsHTML;
      
      // Reattach event listener to the close button
      const closeButton = itemsContainer.querySelector('.categoriesToolbar forge-icon[name="close"]');
      closeButton.addEventListener('click', function() {
        // Hide the items container
        itemsContainer.style.display = 'none';
        
        // Scroll back to categories container
        categoriesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      
      // Show the items container
      itemsContainer.style.display = 'block';
      
      // Add click event listeners to item buttons
      const itemButtons = itemsContainer.querySelectorAll('.itemBtn');
      itemButtons.forEach(itemButton => {
        itemButton.addEventListener('click', function() {
          const itemName = this.querySelector('.itemName').textContent;
          const priceText = this.querySelector('.price').textContent;
          const price = parseFloat(priceText.replace('$', ''));
          
          // Show quantity selection dialog
          showQuantityDialog(itemName, price);
        });
      });
      
      // Scroll to the items container with smooth behavior
      itemsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});


// Enhanced PWA support for style updates
document.addEventListener('DOMContentLoaded', function() {
  // Register and manage service worker
  if ('serviceWorker' in navigator) {
    let refreshing = false;

    // Handle service worker updates more gracefully
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('Service Worker controller changed - refreshing page');
        window.location.reload();
      }
    });

    // Updated registration with better error handling and update detection
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope:', registration.scope);
          
          // Check for updates immediately
          registration.update();
          
          // Watch for updates to the service worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('Service Worker update found!');
            
            // We have an updated service worker
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is installed but waiting
                console.log('New Service Worker installed and waiting');
                
                // Show refresh notification to user
                showToast('New version available! Refresh the page to update.', 'info', true);
                
                // Add refresh button to toast
                const refreshButton = document.createElement('forge-button');
                refreshButton.setAttribute('variant', 'outlined');
                refreshButton.style.marginTop = '8px';
                refreshButton.textContent = 'Update Now';
                
                const toast = document.querySelector('.toast.info.show');
                if (toast) {
                  toast.appendChild(refreshButton);
                  
                  refreshButton.addEventListener('click', () => {
                    // Tell the service worker to skipWaiting
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  });
                }
              }
            });
          });
          
          // Add PWA install button functionality
          // ... (existing install button code)
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error);
          showToast('Error setting up offline capabilities. Some features may not work.', 'error');
        });
    });
    
    // Add a force refresh function for style issues
    window.forceStyleRefresh = function() {
      // Clear caches and reload page
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_CACHE'
        });
        
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data && event.data.type === 'CACHE_CLEARED') {
            window.location.reload(true); // Force reload from server
          }
        }, { once: true });
      } else {
        // No controller yet, just reload
        window.location.reload(true);
      }
    }; 
  }
  
  // Enhanced toast function (with optional persistence)
  function showToast(message, type = 'info', persistent = false) {
    // Check if we already have a toast container
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
      // Create a container for toast messages
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
      
      // Add some basic styling if not already present
      if (!document.querySelector('style[data-for="toast"]')) {
        const style = document.createElement('style');
        style.setAttribute('data-for', 'toast');
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
    
    // Only auto-remove if not persistent
    if (!persistent) {
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 3000);
    } else {
      // Add a close button for persistent toast
      const closeBtn = document.createElement('forge-icon-button');
      closeBtn.style.marginLeft = '8px';
      closeBtn.style.color = 'white';
      closeBtn.innerHTML = '<forge-icon name="close"></forge-icon>';
      toast.appendChild(closeBtn);
      
      closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.remove();
        }, 300);
      });
    }
    
    return toast; // Return the toast element for potential further manipulation
  }
});

// Service Worker Registration - Add this to your scripts.js file
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Check for updates every hour
        setInterval(() => {
          registration.update();
          console.log('Checking for service worker updates');
        }, 60 * 60 * 1000);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });

  // Add offline/online detection
  window.addEventListener('online', () => {
    console.log('App is online');
    document.body.classList.remove('is-offline');
    // Show a notification that we're back online
    if (window.showToast) {
      window.showToast('You are back online!', 'success');
    }
  });

  window.addEventListener('offline', () => {
    console.log('App is offline');
    document.body.classList.add('is-offline');
    // Show an offline notification
    if (window.showToast) {
      window.showToast('You are offline. Some features may be limited.', 'warning');
    }
  });

  // Add a helper function to test offline functionality
  window.testOfflineMode = function() {
    document.body.classList.add('is-offline');
    if (window.showToast) {
      window.showToast('Offline test mode activated. Refresh to restore.', 'info', true);
    }
    return 'App is now in offline test mode. Refresh to restore normal operation.';
  };
}