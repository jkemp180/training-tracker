(() => {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      await registration.update();

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state !== 'activated' || !navigator.serviceWorker.controller) return;
          const dialog = document.getElementById('workoutDialog');
          if (dialog?.open) {
            const reloadAfterClose = () => window.location.reload();
            dialog.addEventListener('close', reloadAfterClose, {once:true});
            return;
          }
          window.location.reload();
        });
      });
    } catch (error) {
      console.warn('Service worker update failed', error);
    }
  });
})();
