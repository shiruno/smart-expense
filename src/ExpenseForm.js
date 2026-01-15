import React, { useState, useEffect } from 'react';

function ExpenseForm({ expenseCategories, addExpense, totalExpenses, totalIncome, editingExpense, setEditingExpense, updateExpense, expenses, month, year }) {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [frequency, setFrequency] = useState('monthly');
  const [incomeMonth, setIncomeMonth] = useState(month);
  const [incomeYear, setIncomeYear] = useState(year);
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
      setIncomeMonth(typeof editingExpense.month === 'number' ? editingExpense.month : month);
      setIncomeYear(typeof editingExpense.year === 'number' ? editingExpense.year : year);
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
      // attach month/year to income entries so incomes can be tracked per-month
      entry.month = typeof incomeMonth === 'number' ? incomeMonth : month;
      entry.year = typeof incomeYear === 'number' ? incomeYear : year;
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
              <label style={{ marginRight: '6px' }}>Month:</label>
              <select value={incomeMonth} onChange={(e) => setIncomeMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>{new Date(0, i).toLocaleString(undefined, { month: 'long' })}</option>
                ))}
              </select>

              <label style={{ margin: '0 6px' }}>Year:</label>
              <select value={incomeYear} onChange={(e) => setIncomeYear(Number(e.target.value))}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = new Date().getFullYear() - 2 + i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
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