## [Smart Expense Webpage](https://shiruno.github.io/smart-expense/)

# Project Overview
This project is a personal expense tracking system with intelligent spending insights. Its main purpose is to help users understand their spending behavior by analyzing past expenses and automatically generating monthly insights, trends, and warnings for each expense category.
Instead of only displaying totals, the system uses machine learning to predict expected expenses and compare them with actual spending, allowing the user to identify unusual or excessive expenses.

### How the Project Works
1. Expense Data Collection
The user records daily expenses with:
<ul>
    <li>Amount</li>
    <li>Category (e.g., Food, Transportation, Utilities)</li>
    <li>Date</li>
</ul>
All expense data is stored and grouped by month and category.

2. Monthly Category Analysis
For each expense category:
<ul>
    <li>The system computes total monthly expenses</li>
    <li>A rolling average based on the previous months is calculated</li>
    <li>Percentage change from the average is determined</li>
</ul>
This allows the system to detect whether spending increased or decreased.

3. Machine Learning-Based Prediction
For categories with enough historical data:
<ul>
    <li>The system trains a neural network model directly in the browser using TensorFlow.js</li>
    <li>Past monthly expenses are used as input to predict the expected spending for the current month</li>
    <li>The prediction is compared with the actual expense value</li>
</ul>
If the difference is significant, the system flags the category as:
<ul>
    <li>Overspending</li>
    <li>Underspending</li>
    <li>Normal spending</li>
</ul>

4. Visualization and Insights
For better understanding:
<ul>
    <li>Each category displays a short insight message</li>
    <li>Users can toggle a chart showing monthly spending trends</li>
    <li>Categories with unusual changes are highlighted visually</li>
</ul>
This helps users quickly identify problem areas in their budget.

Why Machine Learning Is Used
Traditional expense trackers only show totals and averages.
This project goes further by:
<ul>
    <li>Learning spending patterns from past data</li>
    <li>Predicting expected future expenses</li>
    <li>Detecting anomalies automatically</li>
</ul>
This makes the system adaptive and personalized for each user.

Key Features of the Project
<ul>
    <li>Category-based expense tracking</li>
    <li>Monthly spending comparison</li>
    <li>Machine learning prediction per category</li>
    <li>Automatic overspending detection</li>
    <li>Interactive charts and insights</li>
</ul>

