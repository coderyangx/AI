import { useRef } from "react";
import ReactMarkdown from "react-markdown";
import { getComponents } from "../../markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";
import remarkParse from "remark-parse";

const rehypePlugins = [rehypeRaw, rehypeKatex];
const remarkPlugins = [
  remarkMath,
  remarkGfm,
  remarkParse,
  remarkDirective,
  remarkDirectiveRehype,
];

export function TextMessagePart({ message, part }) {
  const components = useRef(getComponents(message));
  return (
    <ReactMarkdown
      components={components.current}
      rehypePlugins={rehypePlugins}
      remarkPlugins={remarkPlugins}
    >
      {part.text}
    </ReactMarkdown>
  );
}
