// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes'; // Import the new routing logic

function App() {
    return (
        <Router>
            <AppRoutes /> {/* All routing logic is now inside AppRoutes */}
        </Router>
    );
}

export default App;