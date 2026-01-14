import React from 'react';

function MonthlySummary({ expenses, month, year }) {
  const monthlyExpenses = expenses.filter(exp => {
    if (exp.type === 'expense') {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === month && expDate.getFullYear() === year;
    }
    return false;
  });

  const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => {
      const adjustedAmount = e.frequency === 'bi-weekly' ? e.amount * 2 : e.amount;
      return sum + adjustedAmount;
    }, 0);

  const net = totalIncome - totalExpenses;

  // Warnings: At 30% and 15% of income
  const showWarning30 = totalIncome > 0 && net <= totalIncome * 0.3;
  const showWarning15 = totalIncome > 0 && net <= totalIncome * 0.15;

  return (
    <div className="monthly-summary">
      <div className="summary-item">
        <p>Total Expenses: ₱{totalExpenses.toFixed(2)}</p>
      </div>
      <div className="summary-item">
        <p>Total Income: ₱{totalIncome.toFixed(2)}</p>
      </div>
      <div className="summary-item">
        <p>Net: ₱{net.toFixed(2)}</p>
      </div>
      {showWarning30 && !showWarning15 && (
        <div style={{ color: 'orange', marginTop: '10px', padding: '10px', border: '1px solid orange', borderRadius: '4px', backgroundColor: '#fff3cd' }}>
          <p><strong>Caution:</strong> Your net balance is low (₱{net.toFixed(2)}, ≤30% of income). Consider reviewing expenses.</p>
        </div>
      )}
      {showWarning15 && (
        <div style={{ color: 'red', marginTop: '10px', padding: '10px', border: '1px solid red', borderRadius: '4px', backgroundColor: '#ffe6e6' }}>
          <p><strong>Alert:</strong> Your net balance is very low (₱{net.toFixed(2)}, ≤15% of income). Reduce expenses or increase income immediately.</p>
        </div>
      )}
    </div>
  );
}

export default MonthlySummary;