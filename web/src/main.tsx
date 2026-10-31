import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import App from './App.tsx'

const root = createRoot(document.getElementById('root')!)

const strict: boolean = import.meta.env.VITE_STRICT_MODE == "true";

if (strict) {
    root.render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
} else {
    root.render(
        <App />
    );
}
