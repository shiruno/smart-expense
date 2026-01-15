## [Smart Expense Webpage](https://shiruno.github.io/smart-expense/)
---
# Project Overview
This project is a personal expense tracking system with intelligent spending insights. Its main purpose is to help users understand their spending behavior by analyzing past expenses and automatically generating monthly insights, trends, and warnings for each expense category.
Instead of only displaying totals, the system uses machine learning to predict expected expenses and compare them with actual spending, allowing the user to identify unusual or excessive expenses.

### How the Project Works
1. Expense Data Collection
The user records daily expenses with:
•	Amount
•	Category (e.g., Food, Transportation, Utilities)
•	Date
All expense data is stored and grouped by month and category.

2. Monthly Category Analysis
For each expense category:
•	The system computes total monthly expenses
•	A rolling average based on the previous months is calculated
•	Percentage change from the average is determined
This allows the system to detect whether spending increased or decreased.

3. Machine Learning-Based Prediction
For categories with enough historical data:
•	The system trains a neural network model directly in the browser using TensorFlow.js
•	Past monthly expenses are used as input to predict the expected spending for the current month
•	The prediction is compared with the actual expense value
If the difference is significant, the system flags the category as:
•	Overspending
•	Underspending
•	Normal spending

4. Visualization and Insights
For better understanding:
•	Each category displays a short insight message
•	Users can toggle a chart showing monthly spending trends
•	Categories with unusual changes are highlighted visually
This helps users quickly identify problem areas in their budget.

Why Machine Learning Is Used
Traditional expense trackers only show totals and averages.
This project goes further by:
•	Learning spending patterns from past data
•	Predicting expected future expenses
•	Detecting anomalies automatically
This makes the system adaptive and personalized for each user.

Key Features of the Project
•	Category-based expense tracking
•	Monthly spending comparison
•	Machine learning prediction per category
•	Automatic overspending detection
•	Interactive charts and insights
