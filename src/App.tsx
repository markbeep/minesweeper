import { useEffect } from 'react';
import Sweeper from './props/sweeper';

function App() {

  useEffect(() => {
    document.addEventListener("contextmenu", event => event.preventDefault());
  }, []);

  return (
    <div className="App" style={{ display: "flex", justifyContent: "center", marginTop: "5%" }}>
      <Sweeper />
    </div>
  );
}

export default App;
