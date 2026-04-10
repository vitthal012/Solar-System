import './App.css'
import {useEffect,useState} from 'react';
import CBE from './components/cube';

function App() {
  const ev=import.meta.env;
  const[data,setdata]=useState("Loading...");

  useEffect(()=>{
    fetch(ev.VITE_BACKEND_URL).then(res=>res.json()).then(d=>setdata(d));
  },[]);
  console.log(data);

    return(
    <>
    <CBE/>
    </>
  );
}

export default App;
