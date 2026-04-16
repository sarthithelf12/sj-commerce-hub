import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { seedMasterData } from "./utils/seedData";

seedMasterData();

createRoot(document.getElementById("root")!).render(<App />);
