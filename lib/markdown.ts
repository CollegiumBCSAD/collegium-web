import type { MarkdownBlock, MarkdownSpan } from "@/types";

// ponytail: markdown subset only (headings, lists, quotes, bold/italic/links) —
// swap in react-markdown if admins need tables, code fences or inline images.

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;

export function parseSpans(text: string): MarkdownSpan[] {
  const spans: MarkdownSpan[] = [];

  for (const part of text.split(INLINE)) {
    if (!part) continue;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      spans.push({ kind: "bold", text: part.slice(2, -2) });
      continue;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      spans.push({ kind: "italic", text: part.slice(1, -1) });
      continue;
    }

    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    // Only http(s) and same-origin links survive; anything else (javascript:,
    // data:) renders as plain text rather than a clickable href.
    if (link && /^(https?:\/\/|\/)/.test(link[2])) {
      spans.push({ kind: "link", text: link[1], href: link[2] });
      continue;
    }

    spans.push({ kind: "text", text: part });
  }

  return spans;
}

export function parseMarkdown(src: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let list: string[] = [];
  let paragraph: string[] = [];

  const flushList = () => {
    if (list.length) blocks.push({ kind: "list", items: list });
    list = [];
  };

  // Consecutive plain lines belong to one paragraph, the way markdown treats a
  // soft wrap; a blank line is what ends it.
  const flushParagraph = () => {
    if (paragraph.length)
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };

  const flush = () => {
    flushList();
    flushParagraph();
  };

  for (const raw of (src || "").replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();

    if (!line) {
      flush();
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2],
      });
      continue;
    }

    const quote = /^>\s*(.*)$/.exec(line);
    if (quote) {
      flush();
      blocks.push({ kind: "quote", text: quote[1] });
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flush();
  return blocks;
}

export function readTimeFromBody(body: string): string {
  const words = (body || "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} MIN READ`;
}
