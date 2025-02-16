import React, { useEffect, useState } from 'react';
import styles from './expensecategorize.module.css';
import axios from 'axios';
import StackedBarChart from '../StackedBarChart';
import PieChartComponent from '../PieChartComponent';
import { useNavigate } from 'react-router-dom';

function Expensecategorize() {
  const [categorizedExpenses, setCategorizedExpenses] = useState([]);
  const navigate = useNavigate(); 
  const token = localStorage.getItem('token');

  const historydata = () => {
    console.log("yes1");
    axios.get('http://localhost:5000/get_all_expenses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        console.log(res.data.categorizedExpenses);
        setCategorizedExpenses(res.data.categorizedExpenses);
        setShowCategorizedBox(true);
      })
      .catch(err => {
        console.error('There was an error fetching all expenses!', err);
      });
  }

  useEffect(() => {
    document.title = "Expense Categorization Analytics";
    historydata();
  }, []);

  const BackPage = () => {
    navigate('/HomePage');
  };

  return (
    <div className='Analyze-page'>
      {/* Container for title and button */}
      <div className={styles['header-container']}>
        <h1 className={styles['ExpH']}>Expense Categorize Analytics</h1>
        <button className={styles['home-button']} onClick={BackPage}>Home</button>
      </div>

      <div className={styles['container']}>
        <div className={styles['Box-1']}>
          {/* Render the PieChartComponent with categorizedExpenses data */}
          <PieChartComponent categorizedExpenses={categorizedExpenses} />
        </div>
        <div className={styles['categorized-expenses-box']}>
          {/* Render the StackedBarChart component with categorizedExpenses data */}
          <StackedBarChart data={categorizedExpenses} />
          {/* Render the categorized expense list */}
          <div className={styles['categorized-expenses-list']}>
            <h2>Categorized Expenses</h2>
            <ul>
              {categorizedExpenses.map((expense, index) => (
                <li key={index} className={styles['categorized-expense-list-item']}>
                  <div>
                    <h5><span className={styles['expense-number']}>{index + 1}.</span> {expense.description}</h5>
                    <p>{expense.category}</p>
                  </div>
                  <div className={styles['categorized-expense-list-category']}>
                    <p>₹{expense.price}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Expensecategorize;
