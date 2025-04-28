
import { useEffect, useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import './App.css';

// Main application component
function App() {
  const [isElectron, setIsElectron] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if running in Electron environment
    setIsElectron(window.electron !== undefined);
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div className="app-container">
            <h1>Fever Audio Studio</h1>
            <p>Welcome to Fever - {isElectron ? 'Electron App' : 'Web App'}</p>
            <button onClick={() => {
              toast({
                title: "Fever Studio",
                description: "Welcome to Fever Audio Studio!",
              });
            }}>Show Toast</button>
          </div>} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
