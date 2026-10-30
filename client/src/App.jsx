
import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [apiMessage, setApiMessage] = useState("Connecting to backend...");

    useEffect(() => {
        fetch('/api/health')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                console.log("Backend response:", data);
                setApiMessage(data.message);
            })
            .catch(error => {
                console.error("Backend connection failed:", error);
                setApiMessage("Could not connect to the backend.");
            });
    }, []);

    return (
        <div className="app">
            <h1>My Blog Application</h1>
            <h2>React + Express Integration</h2>

            <p>{apiMessage}</p>
        </div>
    );
}

export default App;
