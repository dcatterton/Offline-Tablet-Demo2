if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
    });
}

(function () {

    var clockElement = document.getElementById( "clock" );
  
    function updateClock ( clock ) {
      clock.innerHTML = new Date().toLocaleTimeString();
    }
  
    setInterval(function () {
        updateClock( clockElement );
    }, 1000);
  
  }());

// Wait for the DOM to be fully loaded
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