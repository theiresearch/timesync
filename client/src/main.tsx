import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./theme-override.css";

// Handle WebSocket connection errors for HMR
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('WebSocket')) {
    event.preventDefault();
    console.log('WebSocket connection error handled');
  }
});

createRoot(document.getElementById("root")!).render(<App />);
