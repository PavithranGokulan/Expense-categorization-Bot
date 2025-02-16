import React, { useEffect, useState } from 'react';
import './HomePage.css';
import { AiOutlineDelete } from 'react-icons/ai';
import axios from 'axios';
import StackedBarChart from '/src/StackedBarChart.jsx';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [showCategorizedBox, setShowCategorizedBox] = useState(true);
  const [categorizedExpenses, setCategorizedExpenses] = useState([]);
  const [allexpense, setexpense] = useState([]);
  const [newdesc, setnewdesc] = useState("");
  const [newprice, setnewprice] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleexpense = () => {
    let newexpense = {
      description: newdesc,
      price: newprice,
      isNew: true,
      isStored: false,
    };
    // console.log(newexpense);
    let updatednewexpense = [...allexpense];
    updatednewexpense.push(newexpense);
    setexpense(updatednewexpense);
    localStorage.setItem('expenses', JSON.stringify(updatednewexpense));

    setnewdesc("");
    setnewprice("");
  };

  useEffect(() => {
    let savedexpense = JSON.parse(localStorage.getItem('expenses'));
    if (savedexpense) {
      setexpense(savedexpense);
    }
  }, []);

  const handledeleteexpense = (index) => {
    let reducedexpense = [...allexpense];
    let expenseToDelete = reducedexpense[index];

    if (expenseToDelete.isStored) {
      axios.post('http://localhost:5000/delete', expenseToDelete,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          console.log(response.data);
        })
        .catch(error => {
          console.error('There was an error!', error);
        });
    }

    reducedexpense.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(reducedexpense));
    setexpense(reducedexpense);
  };

  const handleCategorizeClick = () => {
    const expenses = JSON.parse(localStorage.getItem('expenses'));
    console.log(expenses);
    const newExpenses = expenses.filter(expense => expense.isNew);

    axios.post('http://localhost:5000/categorize', { expenses: newExpenses }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        console.log(response.data);

        // Update the localStorage to mark the new expenses as categorized and stored
        const updatedExpenses = expenses.map(expense => {
          if (expense.isNew) {
            return { ...expense, isNew: false, isStored: true, category: response.data.categorizedExpenses.find(e => e.description === expense.description).category };
          }
          return expense;
        });
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
        setexpense(updatedExpenses);

        // Fetch all categorized expenses from the backend
        axios.get('http://localhost:5000/get_all_expenses_present', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => {
            setCategorizedExpenses(res.data.categorizedExpenses);
            setShowCategorizedBox(true);
          })
          .catch(err => {
            console.error('There was an error fetching all expenses!', err);
          });
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  };

  useEffect(() => {
    document.title = "Expense Categorization Support";
    console.log(token);
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
      setexpense(JSON.parse(storedExpenses));
    }
  }, []);

  // const deleteAll = () =>{
    
  // }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = () => {
    const formData = new FormData();
    formData.append('file', file);
    axios.post('http://localhost:5000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      console.log('File uploaded successfully');
      console.log(response.data);
      let exp = response.data;
      let updatednewexpense = [...allexpense];
        for(let i=0; i<exp.length; i++){
          let newexpense = {
            description: exp[i].description,
            price: exp[i].price,
            isNew: true,
            isStored: false
          };
          updatednewexpense.push(newexpense);
        }
      console.log(updatednewexpense);
      setexpense(updatednewexpense);
      localStorage.setItem('expenses', JSON.stringify(updatednewexpense));

      setFile(null);
      document.getElementById('fileInput').value = null;
    })
    .catch(error => {
      console.error('There was an error uploading the file!', error);
    });
  };

  const handleButtonClick = () => {
    navigate('/Expensecategorize');
    window.location.reload();
  };
  
  return (
    <div className='App'>
      <h1 className='HomePageH'>Expense Categorize Support</h1>

      <div className='container'>
        <div className='Box-1'>
          <div className='expense-input'>
            <div className='expense-input-item'>
              <label>Expense Description</label>
              <input type='text' value={newdesc} onChange={(e) => setnewdesc(e.target.value)} placeholder='Enter Expense Description' />
            </div>
            <div className='expense-input-item'>
              <label>Price</label>
              <input type='text' value={newprice} onChange={(e) => setnewprice(e.target.value)} placeholder='Enter the price' />
            </div>
            <div className='expense-input-button'>
              <button type='button' onClick={handleexpense} className='primarybtn'>
                Add
              </button>
              <button type='button' onClick={handleButtonClick} className='primarybtn'>
                Analyze
              </button>
            </div>
          </div>

          <div className='file-upload'>
            <input id="fileInput" type='file' onChange={handleFileChange} />
            <div className='file-upload-btn'>
              <button type='button' onClick={handleFileUpload} className='primarybtn' disabled={!file}>
                Upload File
              </button>
            </div>
          </div>

          <div className='categorize-btn'>
            <button className='secondary-btn' onClick={handleCategorizeClick}>Categorize</button>
          </div>

          <div className='expense-list'>
            {allexpense.map((item, index) => (
              <div className='expense-list-item' key={index}>
                <div>
                  <h3>{item.description}</h3>
                  <p>Rs.{item.price}</p>
                </div>
                <div>
                  <AiOutlineDelete className='icon' onClick={() => handledeleteexpense(index)} title="Delete?" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {showCategorizedBox && (
          <div className='categorized-expenses-box'>
            <div className='graph-container'>
              <StackedBarChart data={categorizedExpenses} />
            </div>
            <div className='categorized-expenses-list'>
              <h2>Categorized Expenses</h2>
              <ul>
                {categorizedExpenses.map((expense, index) => (
                  <li key={index} className='categorized-expense-list-item'>
                    <div>
                      <h5><span className='expense-number'>{index + 1}.</span> {expense.description}</h5>
                    </div>
                    <div className='categorized-expense-list-category'><p>{expense.category}</p></div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
