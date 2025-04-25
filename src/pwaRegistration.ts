
/**
 * TEMPORARILY DISABLED FOR TESTING
 * 
 * The service worker has been disabled to prevent fetch errors
 * while testing the application locally.
 * 
 * TO RESTORE: Uncomment the original implementation below.
 */
export function registerServiceWorker() {
  console.log('Service worker registration temporarily disabled for testing');
  
  // Unregister any existing service workers to prevent issues
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('ServiceWorker unregistered for testing');
      }
    });
  }
}

/* ORIGINAL IMPLEMENTATION - UNCOMMENT TO RESTORE
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/serviceWorker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
}
*/
