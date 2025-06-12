import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Registration from './pages/Registration';
import MainAdmin from './pages/MainAdmin';
import People from './pages/People';
import Person from './pages/Person';
import DevicesAdmin from './pages/DevicesAdmin';
import Main from './pages/Main';
import Devices from './pages/Devices';
import InfoDevice from './pages/InfoDevice';
import Logs from './pages/Logs';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/main/admin" element={<MainAdmin />} />
        <Route path="/people" element={<People />} />
        <Route path="/people/:id" element={<Person />} />
        <Route path="/devices/admin" element={<DevicesAdmin />} />
        <Route path="/main" element={<Main />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/device/:id" element={<InfoDevice />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Router>
  );
};

export default App;