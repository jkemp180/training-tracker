(() => {
  const originalBind = bind;

  bind = function fixedBind(view) {
    document.querySelectorAll('[data-start]').forEach(button => {
      button.onclick = () => openWorkout(+button.dataset.start);
    });
    document.querySelectorAll('[data-history]').forEach(button => {
      button.onclick = () => openHistory(button.dataset.history);
    });

    if (view !== 'settings') return;

    const startDateInput = document.getElementById('startDate');
    const bodyWeightInput = document.getElementById('bodyWeight');
    const exportButton = document.getElementById('exportBtn');
    const importButton = document.getElementById('importBtn');
    const resetButton = document.getElementById('resetBtn');
    const importFileInput = document.getElementById('importInput');

    if (startDateInput) {
      startDateInput.onchange = event => {
        state.startDate = event.target.value;
        save();
        render('today');
      };
    }

    if (bodyWeightInput) {
      bodyWeightInput.onchange = event => {
        state.weight = +event.target.value;
        save();
      };
    }

    if (exportButton) exportButton.onclick = () => exportData();
    if (importButton && importFileInput) importButton.onclick = () => importFileInput.click();
    if (resetButton) {
      resetButton.onclick = () => {
        if (confirm('Delete all training data?')) {
          localStorage.removeItem(STORAGE);
          location.reload();
        }
      };
    }
  };
})();
