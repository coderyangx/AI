import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export const CodeBlock = ({ children, className, node, inline }: any) => {
  const language = className?.split("-")[1];
  if (inline !== false) {
    return (
      <span className="px-1 py-0.5 rounded bg-muted text-sm">{children}</span>
    );
  }
  return (
    <SyntaxHighlighter language={language || ""} style={dracula}>
      {children}
    </SyntaxHighlighter>
  );
};
