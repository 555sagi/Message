import React from "react";
import SingleViewerFlow from "./components/SingleViewerSecret";
import "./App.css"
//import LoveMessage from "./components/ShowMessage";
//import Message from "./components/Message";
import HeadCounter from "./components/HeadCounter";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FinalMessage from "./components/FinalMessage";
import Welcome from "./components/Welcome";
function App(){
  
  return (
    <BrowserRouter  >
      <Routes>
        {/* Route 1: The main head counting page */}
        <Route path="/" element={<Welcome />} />
        <Route path='/headcounter' element={<HeadCounter/>}/>

        {/* Route 2: The final message page (separate URL) */}
        <Route path="/final-message" element={<FinalMessage isSeparateRoute={true} />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;
