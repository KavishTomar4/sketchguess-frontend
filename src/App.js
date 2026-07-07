import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router';
import Createpage from './Components/Createpage';
import Joinroom from './Components/Joinroom';
import Titlepage from './Components/Titlepage';
import Room from './Components/Room';
import Navbar from './Components/Navbar'


function App() {
  return (
    <div>
        <Navbar/>
        <BrowserRouter>
            <Routes>
              <Route path = "/" element={<Titlepage/>}/>
              <Route path = "/createroom" element={<Createpage/>}/>
              <Route path = "/joinroom" element={<Joinroom/>}/>
              <Route path = "/room/:roomid" element={<Room/>}/>
            </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
