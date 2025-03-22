import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

/**
 * Component that shows a notification when a new service worker is available
 * and allows the user to refresh to update the app
 */
const PWAUpdateNotification: React.FC = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    // Skip if service worker is not supported
    if (!('serviceWorker' in navigator)) return;

    // Function to handle new service worker
    const onServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
      setWaitingWorker(registration.waiting);
      setShowReload(true);
    };

    // Check for existing service worker registration
    navigator.serviceWorker.ready.then((registration) => {
      // If there's already a waiting worker, show update notification
      if (registration.waiting) {
        onServiceWorkerUpdate(registration);
      }

      // Listen for new updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (!newWorker) return;
        
        // Listen for state changes on the new worker
        newWorker.addEventListener('statechange', () => {
          // When the new service worker is installed (waiting)
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            onServiceWorkerUpdate(registration);
          }
        });
      });
    });

    // Listen for controller change to reload the page
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  // Function to update the service worker
  const updateServiceWorker = () => {
    if (!waitingWorker) return;
    
    // Send skip-waiting message to the waiting service worker
    waitingWorker.postMessage({ action: 'skipWaiting' });
    
    // Hide the notification
    setShowReload(false);

    // Show toast notification
    toast({
      title: "Updating application",
      description: "The application is updating to the latest version...",
      duration: 3000
    });
  };

  // Only show notification if there's a new version
  if (!showReload) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-card rounded-lg shadow-lg border border-border max-w-sm">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="font-medium">New version available</h3>
          <p className="text-sm text-muted-foreground">
            A new version of Budget Sage is available. Update now for the latest features and improvements.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="default" 
            onClick={updateServiceWorker}
          >
            Update Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;
