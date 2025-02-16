import React from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ["#FF4D4D", "#FF772A", "#C9E84D", "#FF33A1", "#e32320", "#ed7811", "#f5af2f", "#f5eb2f", "#eb1c1c", "#728bb3", "#636d7d"];

const PieChartComponent = ({ categorizedExpenses }) => {
  // Aggregate categorized expenses by category
  const aggregatedExpenses = categorizedExpenses.reduce((accumulator, currentExpense) => {
    const category = currentExpense.category;
    const price = parseFloat(currentExpense.price);
    if (accumulator[category]) {
      accumulator[category].value += price;
    } else {
      accumulator[category] = {
        name: category,
        value: price,
      };
    }
    return accumulator;
  }, {});

  // Transform aggregated data into array for PieChart
  const transformedData = Object.values(aggregatedExpenses);

  // Calculate total expense
  const totalExpense = transformedData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="graph-wrapper" style={{ backgroundColor: '#2e2e2e', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
      <h2 style={{ color: '#FFFFFF', textAlign: 'center', marginBottom: '20px', fontSize: '24px', fontWeight: '600' }}>
        Visualizer<span className="total-expense-value" style={{ marginLeft: '10px', fontSize: '20px', fontWeight: '400', color: '#C9E84D' }}>₹ {totalExpense}</span>
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={transformedData}
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            label={({ name, value}) => `${name}: ₹${value}`}
            labelLine={false}
            style={{ fontSize: '14px', fontWeight: '500', color: '#FFFFFF' }}
            onMouseEnter={(e) => e.target.style.opacity = 0.8}
            onMouseLeave={(e) => e.target.style.opacity = 1}
          >
            {transformedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px', color: '#FFFFFF' }} />
          {/* <Legend layout="horizontal" align="center" verticalAlign="bottom" iconType="circle" wrapperStyle={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500' }} /> */}
        </PieChart>
      </ResponsiveContainer>
      <div className="expense-details" style={{ marginTop: '20px', color: '#FFFFFF' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {transformedData.map((entry, index) => (
            <li key={index} style={{ '--bullet-color': COLORS[index % COLORS.length], display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px' }}>
              <span className="category-name" style={{ fontWeight: 'bold', color: COLORS[index % COLORS.length] }}>{entry.name}</span>
              <span className="category-value" style={{ marginRight: '10px' }}>₹ {entry.value.toFixed(2)}</span>
              <span className="category-percentage" style={{ fontStyle: 'italic' }}>{((entry.value / totalExpense) * 100).toFixed(2)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PieChartComponent;
