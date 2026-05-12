import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { storage } from "./storage/actions";

storage.ensureSettings();

createRoot(document.getElementById("root")!).render(<App />);
