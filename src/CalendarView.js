import React from 'react';

function CalendarView({ expenses, month, year, setMonth, setYear, setEditingExpense, deleteExpense }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const changeMonth = (direction) => {
    if (direction === 'prev') {
      if (month === 0) {
        setMonth(11);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
      }
    } else {
      if (month === 11) {
        setMonth(0);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    }
  };

  // NEW: Start adding a NEW expense for selected day
  const startAddExpense = (day) => {
  const selectedDate = new Date(year, month, day)
    .toLocaleDateString('en-CA'); // FIX: no timezone issue
    setEditingExpense({
      type: "expense",
      date: selectedDate,
      amount: "",
      category: "",
      isNew: true
    });
  };

  // Handle clicking a calendar cell: set editing expense, then pulse and focus the date input
  const handleDayClick = (e, day) => {
    if (!(day > 0 && day <= daysInMonth)) return;
    startAddExpense(day);

    // Slight delay to allow ExpenseForm to render/receive the date value
    setTimeout(() => {
      const dateInput = document.getElementById('expense-date');
      if (dateInput) {
        dateInput.classList.add('pulse-border');
        dateInput.focus();
        // remove the class after the animation finishes
        setTimeout(() => dateInput.classList.remove('pulse-border'), 700);
      }
    }, 60);
  };

  const getExpensesForDay = (day) => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return (
        expDate.getDate() === day &&
        expDate.getMonth() === month &&
        expDate.getFullYear() === year &&
        exp.type === 'expense'
      );
    });
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={() => changeMonth('prev')}>Prev Month</button>
        <h2>{new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => changeMonth('next')}>Next Month</button>
      </div>

      <table className="calendar-table">
        <thead>
          <tr>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <th key={day}>{day}</th>)}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: Math.ceil((daysInMonth + firstDay) / 7) }, (_, week) => (
            <tr key={week}>
              {Array.from({ length: 7 }, (_, dayOfWeek) => {
                const day = week * 7 + dayOfWeek - firstDay + 1;
                const dayExpenses = getExpensesForDay(day);

                return (
                  <td
                    key={dayOfWeek}
                    onClick={(e) => handleDayClick(e, day)}
                    style={{ cursor: day > 0 && day <= daysInMonth ? "pointer" : "default" }}
                  >
                    {day > 0 && day <= daysInMonth ? (
                      <div>
                        <strong>{day}</strong>
                        <div className="day-expenses">
                          {dayExpenses.map((exp, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                              <span>{exp.category}: ₱{exp.amount}</span>
                              <div>
                                <button onClick={(e) => { e.stopPropagation(); setEditingExpense(exp); }} style={{ fontSize: '12px', padding: '2px 5px' }}>Edit</button>
                                <button onClick={(e) => { e.stopPropagation(); deleteExpense(expenses.indexOf(exp)); }} style={{ fontSize: '12px', padding: '2px 5px', marginLeft: '5px', backgroundColor: 'red', color: 'white' }}>Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CalendarView;
