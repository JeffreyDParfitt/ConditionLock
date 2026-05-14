import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { storage } from "./storage/actions";
import { initTrial } from "./hooks/useTrial";

// Initialize settings row if missing
storage.ensureSettings();

// Start 3-day trial on first app open (no-op if already started)
initTrial();

createRoot(document.getElementById("root")!).render(<App />);
