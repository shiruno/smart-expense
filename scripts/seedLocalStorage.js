// Seed script for localStorage test data
// Usage: paste into the browser console (DevTools) while your app is open.
// This defines `window.seedLocalStorage(opts)` and auto-runs it with defaults.

(function registerAndRunSeeder() {
  window.seedLocalStorage = function seedLocalStorage(opts = {}) {
    const monthsToSeed = typeof opts.months === 'number' ? opts.months : 6;
    const includeCurrent = !!opts.includeCurrent; // default: false => previous months
    const startOffset = typeof opts.startOffset === 'number' ? opts.startOffset : 0; // additional shift
    const incomeAmount = typeof opts.incomeAmount === 'number' ? opts.incomeAmount : 12000;
    const foodAmount = typeof opts.foodAmount === 'number' ? opts.foodAmount : 100;
    const transportAmount = typeof opts.transportAmount === 'number' ? opts.transportAmount : 60;

    const now = new Date();
    const seeded = [];

    const startIndex = includeCurrent ? 0 : 1;
    const endIndex = startIndex + monthsToSeed - 1;
    for (let j = startIndex; j <= endIndex; j++) {
      const m = new Date(now.getFullYear(), now.getMonth() - j + startOffset, 1);
      const y = m.getFullYear();
      const mm = m.getMonth();
      const monthStr = String(mm + 1).padStart(2, '0');

      // Add Food and Transport every day except Sundays
      const lastDay = new Date(y, mm + 1, 0).getDate();
      for (let d = 1; d <= lastDay; d++) {
        const dayDate = new Date(y, mm, d);
        const dayOfWeek = dayDate.getDay(); // 0 = Sunday
        if (dayOfWeek === 0) continue; // skip Sundays
        const dd = String(d).padStart(2, '0');
        const dateStr = `${y}-${monthStr}-${dd}`;
        seeded.push({ type: 'expense', amount: foodAmount, date: dateStr, category: 'Food' });
        seeded.push({ type: 'expense', amount: transportAmount, date: dateStr, category: 'Transport' });
      }
      // Income entry for the month
      seeded.push({ type: 'income', amount: incomeAmount, frequency: 'monthly', month: mm, year: y });
    }

    // Ensure categories exist
    try {
      const existingCats = JSON.parse(localStorage.getItem('expenseCategories') || '[]');
      const cats = new Set(Array.isArray(existingCats) ? existingCats : []);
      cats.add('Food');
      cats.add('Transport');
      localStorage.setItem('expenseCategories', JSON.stringify(Array.from(cats)));
    } catch (e) {
      console.warn('Failed to set categories:', e);
    }

    // Merge with existing expenses
    try {
      const existing = JSON.parse(localStorage.getItem('expenses') || '[]');
      const merged = Array.isArray(existing) ? existing.concat(seeded) : seeded;
      localStorage.setItem('expenses', JSON.stringify(merged));
      console.log(`Seeded ${seeded.length} entries into localStorage (expenses).`);
    } catch (e) {
      console.error('Failed to write expenses to localStorage:', e);
    }

    return seeded;
  };

  // Auto-run with defaults: 6 previous months (exclude current)
  try {
    const result = window.seedLocalStorage();
    console.log('Auto-seeded entries:', result.length);
  } catch (e) {
    console.warn('Seeder defined but auto-run failed:', e);
  }
})();

// End of seedLocalStorage.js
