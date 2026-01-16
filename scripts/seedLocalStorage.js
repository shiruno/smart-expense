// Seed script for localStorage test data
// Usage: open your app in the browser, open DevTools Console and paste the
// contents of this file, or run it as a Snippet. It will append 6 months of
// data (configurable) to localStorage key `expenses` and ensure categories.

(function seedLocalStorage(opts = {}) {
  const monthsToSeed = opts.months || 6;
  const startOffset = typeof opts.startOffset === 'number' ? opts.startOffset : 0; // 0 = current month
  const incomeAmount = typeof opts.incomeAmount === 'number' ? opts.incomeAmount : 12000;
  const foodAmount = typeof opts.foodAmount === 'number' ? opts.foodAmount : 100;
  const transportAmount = typeof opts.transportAmount === 'number' ? opts.transportAmount : 60;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + startOffset, 1);

  const seeded = [];
  for (let i = 0; i < monthsToSeed; i++) {
    const m = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const y = m.getFullYear();
    const mm = m.getMonth();
    const monthStr = String(mm + 1).padStart(2, '0');

    // Food on 5th, Transport on 15th
    const foodDate = `${y}-${monthStr}-05`;
    const transportDate = `${y}-${monthStr}-15`;

    seeded.push({ type: 'expense', amount: foodAmount, date: foodDate, category: 'Food' });
    seeded.push({ type: 'expense', amount: transportAmount, date: transportDate, category: 'Transport' });
    // Income entry for the viewed month
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

  try {
    const existing = JSON.parse(localStorage.getItem('expenses') || '[]');
    const merged = Array.isArray(existing) ? existing.concat(seeded) : seeded;
    localStorage.setItem('expenses', JSON.stringify(merged));
    console.log(`Seeded ${seeded.length} entries into localStorage (expenses).`);
  } catch (e) {
    console.error('Failed to write expenses to localStorage:', e);
  }

  return seeded;
})();

// End of seedLocalStorage.js
