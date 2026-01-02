import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ServerErrorModal from '../components/ui/ServerErrorModal';
import '../css/global.css';

// Componente wrapper para incluir el modal de errores
function AppWithErrorHandler() {
    return (
        <>
            <App />
            <ServerErrorModal />
        </>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AppWithErrorHandler />
    </React.StrictMode>
);
