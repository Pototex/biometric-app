import './App.css';
import Login from './screens/Login';
import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './screens/Register';

function Loading() {
  return 'Loading...'
}

function App() {
  return (
    <div className="App">
      <BrowserRouter basename={process.env.REACT_APP_HOME_PATH}>
        <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" exact element={<Login/>} />
              <Route path="/register" exact element={<Register/>} />
            </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
