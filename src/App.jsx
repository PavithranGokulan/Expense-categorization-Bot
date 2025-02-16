import React,  { useEffect }  from 'react';
import {BrowserRouter,Route,Routes,Link} from 'react-router-dom';
import Expensecategorize from './expensecategorize_page/expensecategorize';
import HomePage from './Home_Page/HomePage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import './App.css';

function App(){
  useEffect(() => {
    document.title = "Expense Categorization Support";
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
  const handleLogin = () =>{
    window.location.href ='/login';
  };
  const handleRegister =() =>{
    window.location.href ='/';
  };
  const isAuthenticated = !!localStorage.getItem('token');
  return (
    <BrowserRouter>
      <div className='app-container'>
      <nav>
        {/* <Link to="/">Register</Link>
        <Link to="/login">Login</Link> */}
        {!isAuthenticated && <button onClick={handleLogin}>Login</button>}
        {!isAuthenticated && <button onClick={handleRegister}>Register</button>}
        {isAuthenticated && <button onClick={handleLogout}>Logout</button>}
      </nav>
        <Routes>
          <Route path='/HomePage' element={<HomePage/>} />
          <Route path='/Expensecategorize' element={<Expensecategorize/>} />
          <Route path="/" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;