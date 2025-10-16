import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ClerkProviderComponent from "./lib/clerk-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProviderComponent>
      <App />
    </ClerkProviderComponent>
  </StrictMode>
);
