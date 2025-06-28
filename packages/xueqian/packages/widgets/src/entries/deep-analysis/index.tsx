import { createRoot } from "react-dom/client";
import { Chat } from "./chat";
import "../../shared/global.css";

export function App() {
  const url = new URL(window.location.href);
  const query = Array.from(url.searchParams.keys()).reduce((prev, curr) => {
    prev[curr] = url.searchParams.get(curr);
    return prev;
  }, {});

  return <Chat {...query} />;
}

export function init() {
  createRoot(document.getElementById("root")).render(<App />);
}
