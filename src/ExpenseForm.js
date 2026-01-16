import React, { useState, useEffect } from 'react';

function ExpenseForm({ expenseCategories, addExpense, totalExpenses, totalIncome, editingExpense, setEditingExpense, updateExpense, expenses, month, year }) {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [frequency, setFrequency] = useState('monthly');
  const [warning, setWarning] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // NEW: Detect if this is an edit or a new calendar-click add
  useEffect(() => {
    if (editingExpense) {
      setDate(editingExpense.date || '');
      setAmount(editingExpense.amount || '');
      setCategory(editingExpense.category || '');
      setType(editingExpense.type || 'expense');
      setFrequency(editingExpense.frequency || 'monthly');
      setIsEditing(!editingExpense.isNew); // TRUE only for real edits
    } else {
      // Load saved draft if present
      try {
        const draftRaw = localStorage.getItem('expenseFormDraft');
        if (draftRaw) {
          const d = JSON.parse(draftRaw);
          setDate(d.date || '');
          setAmount(d.amount || '');
          setCategory(d.category || '');
          setType(d.type || 'expense');
          setFrequency(d.frequency || 'monthly');
        } else {
          setDate('');
          setAmount('');
          setCategory('');
          setType('expense');
          setFrequency('monthly');
        }
      } catch (e) {
        setDate('');
        setAmount('');
        setCategory('');
        setType('expense');
        setFrequency('monthly');
      }
      setIsEditing(false);
    }
  }, [editingExpense]);

  // Autosave draft when user changes fields and not editing an existing expense
  useEffect(() => {
    if (!editingExpense) {
      try {
        const draft = { date, amount, category, type, frequency };
        localStorage.setItem('expenseFormDraft', JSON.stringify(draft));
      } catch (e) {
        console.warn('Failed to save expense draft:', e);
      }
    }
  }, [date, amount, category, type, frequency, editingExpense]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const entry = { amount: parseFloat(amount), type };

    if (type === 'expense') {
      entry.date = date;
      entry.category = category;

      if (!isEditing) {
        const newTotalExpenses = totalExpenses + parseFloat(amount);
        const newNet = totalIncome - newTotalExpenses;

        if (newNet <= 0) {
          setWarning(`Warning: This expense will make your net balance ₱${newNet.toFixed(2)}. Proceed?`);
          return;
        }
      }
    } else {
      entry.frequency = frequency;
      // automatically attach the currently viewed month/year to income entries
      entry.month = month;
      entry.year = year;
    }

    if (isEditing) {
      const index = expenses.indexOf(editingExpense);
      updateExpense(index, entry);
    } else {
      addExpense(entry);
    }
    resetForm();
  };

  const resetForm = () => {
    setDate('');
    setAmount('');
    setCategory('');
    setFrequency('monthly');
    setWarning('');
    setEditingExpense(null);
    try {
      localStorage.removeItem('expenseFormDraft');
    } catch (e) {
      // ignore
    }
  };

  const confirmWarning = () => {
    const entry = { amount: parseFloat(amount), type, date, category };
    addExpense(entry);
    resetForm();
  };

  const cancelEdit = () => setEditingExpense(null);

  return (
    <div className="expense-form">
      <h3>{isEditing ? 'Edit Expense or Income' : 'Add Expense or Income'}</h3>

      <form onSubmit={handleSubmit}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        {type === 'expense' && (
          <>
            <input id="expense-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="">Select Category</option>
              {expenseCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </>
        )}

        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />

        {type === 'income' && (
          <>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="bi-weekly">Bi-Weekly</option>
            </select>

            <div style={{ marginTop: '8px' }}>
              <span>Income will be recorded for the currently viewed month.</span>
            </div>
          </>
        )}

        <button type="submit">{isEditing ? 'Update' : 'Add'}</button>

        {isEditing && (
          <button type="button" onClick={cancelEdit} style={{ marginLeft: '10px' }}>
            Cancel Edit
          </button>
        )}
      </form>

      {warning && (
        <div style={{ color: 'red', marginTop: '10px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          <p>{warning}</p>
          <button onClick={confirmWarning} style={{ backgroundColor: 'red', color: 'white' }}>Proceed Anyway</button>
          <button onClick={() => setWarning('')} style={{ marginLeft: '10px' }}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default ExpenseForm;