import { createRoot } from "react-dom/client";

import "../../shared/global.css";
import { Chat } from "./chat";

export function App() {
  // const [show, setShow] = useState(false);
  const url = new URL(window.location.href);
  const query = Array.from(url.searchParams.keys()).reduce((prev, curr) => {
    prev[curr] = url.searchParams.get(curr);
    return prev;
  }, {});

  // return (
  //   <div
  //     className="w-16 h-16 flex items-center justify-center fixed bottom-6 right-6 z-auto"
  //     style={{ zIndex: 99999 }}
  //   >
  //     <div
  //       className="w-full h-full rounded-full shadow cursor-pointer bg-blue-600 text-white flex items-center justify-center"
  //       onClick={() => setShow(!show)}
  //     >
  //       {show ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
  //     </div>
  //     {show && <Chat {...props} />}
  //   </div>
  // );

  return <Chat {...query} />;
}

export function init() {
  createRoot(document.getElementById("root")).render(<App />);
}
