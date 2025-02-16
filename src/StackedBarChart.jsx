import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StackedBarChart = ({ data }) => {
  const colors = {
    Technology: '#FF4D4D',
    'Office Supplies': '#FF772A',
    Travel: '#C9E84D',
    Food: '#FF33A1',
    Miscellaneous:'#e32320',
    Communication:'#ed7811',
    Utilities:'#f5af2f',
    Transportation:'#f5eb2f',
    Meals:'#eb1c1c',
    'Rent/Lease':'#728bb3',
    Maintenance:'#636d7d',
    // Add more categories and colors as needed
  };

  const transformedData = [];
  const categories = {};
  let totalExpense = 0;

  data.forEach(expense => {
    const price = parseInt(expense.price, 10);
    if (!categories[expense.category]) {
      categories[expense.category] = price;
    } else {
      categories[expense.category] += price;
    }
    totalExpense += price;
  });

  Object.keys(categories).forEach(category => {
    transformedData.push({ name: category, value: categories[category] });
  });

  // Sort transformedData in ascending order based on value
  transformedData.sort((a, b) => a.value - b.value);

  return (
    <div className="graph-wrapper">
      <h2>Total Expense <span className="total-expense-value">₹ {totalExpense}</span></h2>
      
      <ResponsiveContainer width="100%" height={45}>
        <BarChart
          width={532}
          height={23}
          data={[{ ...categories, total: totalExpense }]}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="0 3" />
          <XAxis type="number" domain={[0, totalExpense]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip />
          {transformedData.map((entry, index) => (
            <Bar
              key={index}
              dataKey={entry.name}
              stackId="a"
              fill={colors[entry.name]}
              barSize={50}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="expense-details">
        <ul>
          {transformedData.map((entry, index) => (
            <li key={index} style={{'--bullet-color': colors[entry.name] }}>
              <span className="category-name">{entry.name}</span>
              <span className="category-value">₹ {entry.value}</span>
              <span className="category-percentage">{((entry.value / totalExpense) * 100).toFixed(2)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StackedBarChart;
