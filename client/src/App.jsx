import './App.css'
import { useEffect, useState } from 'react';
import CBE from './components/cube';

function App() {
  const ev = import.meta.env;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(ev.VITE_BACKEND_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load solar system data.');
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message || 'Fetch failed.'));
  }, []);

  return (
    <>
      <CBE data={data} error={error} />
    </>
  );
}

export default App;
