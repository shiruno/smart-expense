import React, { useState } from 'react';

function IncomeManager({ expenses, setEditingExpense, deleteExpense, resetIncome, deductIncome }) {
  const [deductAmount, setDeductAmount] = useState('');
  const incomeEntries = expenses.filter(exp => exp.type === 'income');

  const handleDeduct = () => {
    if (parseFloat(deductAmount) > 0) {
      deductIncome(parseFloat(deductAmount));
      setDeductAmount('');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all income?')) {
      resetIncome();
    }
  };

  return (
    <div className="income-manager" style={{ marginTop: '20px' }}>
      <h3>Income Entries</h3>
      <div style={{ marginBottom: '10px' }}>
        <input 
          type="number" 
          placeholder="Deduct Amount" 
          value={deductAmount} 
          onChange={(e) => setDeductAmount(e.target.value)} 
          style={{ marginRight: '10px' }} 
        />
        <button onClick={handleDeduct}>Deduct from Income</button>
        <button onClick={handleReset} style={{ marginLeft: '10px', backgroundColor: 'orange', color: 'white' }}>Reset All Income</button>
      </div>
      {incomeEntries.length === 0 ? (
        <p>No income added yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {incomeEntries.map((income, idx) => (
            <li key={idx} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p>Amount: ₱{income.amount} | Frequency: {income.frequency}</p>
              <button onClick={() => setEditingExpense(income)} style={{ marginRight: '10px' }}>Edit</button>
              <button onClick={() => deleteExpense(expenses.indexOf(income))} style={{ backgroundColor: 'red', color: 'white' }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default IncomeManager;
