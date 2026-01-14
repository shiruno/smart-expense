import React from "react";
import "./Navbar.css";

export default function Navbar({ currentPage, setCurrentPage }) {
  return (
    <nav className="navbar">
      <h2 className="nav-title">Expense Tracker</h2>
      <div className="nav-links">
        {["dashboard", "calendar", "categories", "insights"].map(page => (
          <button
            key={page}
            className={currentPage === page ? "nav-btn active" : "nav-btn"}
            onClick={() => setCurrentPage(page)}
          >
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </button>
        ))}
      </div>
    </nav>
  );
}
