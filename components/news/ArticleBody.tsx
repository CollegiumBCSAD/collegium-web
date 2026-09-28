import { parseMarkdown, parseSpans } from "@/lib/markdown";
import { ArticleBodyProps, MarkdownSpan } from "@/types";

function Spans({ text }: { text: string }) {
  return (
    <>
      {parseSpans(text).map((span: MarkdownSpan, i) => {
        if (span.kind === "bold")
          return (
            <strong key={i} className="font-bold text-white">
              {span.text}
            </strong>
          );
        if (span.kind === "italic")
          return (
            <em key={i} className="italic text-slate-200">
              {span.text}
            </em>
          );
        if (span.kind === "link")
          return (
            <a
              key={i}
              href={span.href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary-brand underline decoration-primary-brand/40 hover:decoration-primary-brand"
            >
              {span.text}
            </a>
          );
        return <span key={i}>{span.text}</span>;
      })}
    </>
  );
}

export default function ArticleBody({ body }: ArticleBodyProps) {
  const blocks = parseMarkdown(body);

  if (blocks.length === 0) return null;

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          const size =
            block.level === 1
              ? "text-xl sm:text-2xl"
              : block.level === 2
                ? "text-lg sm:text-xl"
                : "text-base sm:text-lg";
          return (
            <h2
              key={i}
              className={`font-display font-black uppercase tracking-tight text-white ${size} pt-2`}
            >
              <Spans text={block.text} />
            </h2>
          );
        }

        if (block.kind === "quote")
          return (
            <blockquote
              key={i}
              className="border-l-2 border-primary-brand pl-4 font-sans text-sm italic leading-relaxed text-slate-300"
            >
              <Spans text={block.text} />
            </blockquote>
          );

        if (block.kind === "list")
          return (
            <ul key={i} className="space-y-2 pl-1">
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="flex gap-3 font-sans text-sm leading-relaxed text-slate-300"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-primary-brand" />
                  <span>
                    <Spans text={item} />
                  </span>
                </li>
              ))}
            </ul>
          );

        return (
          <p
            key={i}
            className="font-sans text-sm sm:text-[15px] leading-relaxed text-slate-300"
          >
            <Spans text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
