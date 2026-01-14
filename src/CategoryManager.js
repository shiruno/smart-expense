import React, { useState } from 'react';

function CategoryManager({ expenseCategories, addExpenseCategory }) {
  const [newExpenseCategory, setNewExpenseCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newExpenseCategory && !expenseCategories.includes(newExpenseCategory)) {
      addExpenseCategory(newExpenseCategory);
      setNewExpenseCategory('');
    }
  };

  return (
    <div className="category-manager">
      <h3>Expense Categories</h3>
      <ul className="category-list">
        {expenseCategories.map(cat => <li key={cat}>{cat}</li>)}
      </ul>
      <form onSubmit={handleSubmit}>
        <input placeholder="New Expense Category" value={newExpenseCategory} onChange={(e) => setNewExpenseCategory(e.target.value)} />
        <button type="submit">Add Expense Category</button>
      </form>
    </div>
  );
}

export default CategoryManager;