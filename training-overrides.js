(() => {
  const triceps = strength.push.find(exercise => exercise.name === 'Triceps pressdown');
  if (!triceps) return;

  if (triceps.sets.length === 3) {
    triceps.sets.push([...triceps.sets[triceps.sets.length - 1]]);
  }

  const savedPrescription = state.prescriptions[triceps.name];
  if (Array.isArray(savedPrescription) && savedPrescription.length === 3) {
    savedPrescription.push({ ...savedPrescription[savedPrescription.length - 1] });
    save();
  }

  render();
})();
