import React, { useState, useEffect } from 'react';
import CalendarView from './CalendarView';
import ExpenseForm from './ExpenseForm';
import CategoryManager from './CategoryManager';
import MonthlySummary from './MonthlySummary';
import Insights from './Insights';

import './App.css';

function Navbar({ currentPage, setCurrentPage }) {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2d2f39', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px' }}>
      <h2 style={{ color: 'white', margin: 0 }}>Smart Expense</h2>
      <div style={{ display: 'flex', gap: '10px' }}>
        {['dashboard', 'calendar'].map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              background: currentPage === page ? '#1fa2ff' : '#4a4d59',
              color: 'white',
              padding: '8px 14px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: currentPage === page ? 'bold' : 'normal'
            }}
          >
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </button>
        ))}
      </div>
    </nav>
  );
}

function App() {
  const [expenses, setExpenses] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState(['Food', 'Transport']);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [editingExpense, setEditingExpense] = useState(null);
  const [lookbackMonths, setLookbackMonths] = useState(6);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    try {
      const savedExpensesRaw = localStorage.getItem('expenses');
      const savedCategoriesRaw = localStorage.getItem('expenseCategories');
      const savedExpenses = savedExpensesRaw ? JSON.parse(savedExpensesRaw) : [];
      const savedExpenseCategories = savedCategoriesRaw ? JSON.parse(savedCategoriesRaw) : expenseCategories;
      setExpenses(Array.isArray(savedExpenses) ? savedExpenses : []);
      setExpenseCategories(Array.isArray(savedExpenseCategories) ? savedExpenseCategories : expenseCategories);

      const savedMonth = localStorage.getItem('currentMonth');
      const savedYear = localStorage.getItem('currentYear');
      const savedLookback = localStorage.getItem('lookbackMonths');
      const savedPage = localStorage.getItem('currentPage');

      if (savedMonth !== null) setCurrentMonth(Number(savedMonth));
      if (savedYear !== null) setCurrentYear(Number(savedYear));
      if (savedLookback !== null) setLookbackMonths(Number(savedLookback));
      if (savedPage) setCurrentPage(savedPage);
    } catch (e) {
      // If parsing fails, fall back to defaults
      console.warn('Failed to load saved state:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('expenses', JSON.stringify(expenses));
      localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));
    } catch (e) {
      console.warn('Failed to save expenses/categories:', e);
    }
  }, [expenses, expenseCategories]);

  useEffect(() => {
    try {
      localStorage.setItem('currentMonth', String(currentMonth));
      localStorage.setItem('currentYear', String(currentYear));
      localStorage.setItem('lookbackMonths', String(lookbackMonths));
      localStorage.setItem('currentPage', currentPage);
    } catch (e) {
      console.warn('Failed to save UI state:', e);
    }
  }, [currentMonth, currentYear, lookbackMonths, currentPage]);

  const addExpense = (expense) => setExpenses([...expenses, expense]);
  const addExpenseCategory = (category) => setExpenseCategories([...expenseCategories, category]);

  const updateExpense = (index, updatedExpense) => {
    const newExpenses = [...expenses];
    newExpenses[index] = updatedExpense;
    setExpenses(newExpenses);
    setEditingExpense(null);
  };

  const deleteExpense = (index) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter((_, i) => i !== index));
    }
  };

  const monthlyExpenses = expenses.filter(exp => {
    if (exp.type === 'expense') {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    }
    return false;
  });

  const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + (e.frequency === 'bi-weekly' ? e.amount * 2 : e.amount), 0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {currentPage === 'dashboard' && (
        <>
          

          <div style={{ margin: '10px 0' }}>
            <label style={{ marginRight: '10px' }}>Lookback window: </label>
            <select
              value={lookbackMonths}
              onChange={(e) => setLookbackMonths(Number(e.target.value))}
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={9}>Last 9 months</option>
              <option value={12}>Last 12 months</option>
            </select>
          </div>

          <Insights
            expenses={expenses}
            month={currentMonth}
            year={currentYear}
            lookbackMonths={lookbackMonths}
          />
        </>
      )}

      {currentPage === 'calendar' && (
        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* Left side: Calendar */}
          <div style={{ flex: 2 }}>
            <MonthlySummary expenses={expenses} month={currentMonth} year={currentYear} />
            <CalendarView
              expenses={expenses}
              month={currentMonth}
              year={currentYear}
              setMonth={setCurrentMonth}
              setYear={setCurrentYear}
              setEditingExpense={setEditingExpense}
              deleteExpense={deleteExpense}
            />
          </div>

          {/* Right side: Add Form + Categories */}
          <div
            style={{
              flex: 1,
              background: '#f5f5f5',
              padding: '20px',
              borderRadius: '10px',
              height: 'fit-content'
            }}
          >
            <h3 style={{ marginBottom: '10px' }}>
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>

            {/* Add/Edit Expense Form */}
            <ExpenseForm
              expenseCategories={expenseCategories}
              addExpense={addExpense}
              totalExpenses={totalExpenses}
              totalIncome={totalIncome}
              editingExpense={editingExpense}
              setEditingExpense={setEditingExpense}
              updateExpense={updateExpense}
              expenses={expenses}
            />

            {/* Divider */}
            <hr style={{ margin: '20px 0' }} />

            {/* Categories Section */}
            <h3>Manage Categories</h3>
            <CategoryManager
              expenseCategories={expenseCategories}
              addExpenseCategory={addExpenseCategory}
            />
          </div>

        </div>
      )}




    </div>
  );
}

export default App;