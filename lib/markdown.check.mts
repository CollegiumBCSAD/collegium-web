// Runnable check for the markdown subset parser: `node lib/markdown.check.ts`
// (Node >= 22.18 strips the types natively, so this needs no test framework).
import assert from "node:assert/strict";
import { parseMarkdown, parseSpans, readTimeFromBody } from "./markdown.ts";

assert.deepEqual(parseMarkdown("# Title"), [
  { kind: "heading", level: 1, text: "Title" },
]);
assert.deepEqual(parseMarkdown("### Deep"), [
  { kind: "heading", level: 3, text: "Deep" },
]);
assert.deepEqual(parseMarkdown("#### Too deep"), [
  { kind: "paragraph", text: "#### Too deep" },
]);

assert.deepEqual(parseMarkdown("- one\n- two"), [
  { kind: "list", items: ["one", "two"] },
]);
assert.deepEqual(parseMarkdown("* one\n* two"), [
  { kind: "list", items: ["one", "two"] },
]);

assert.deepEqual(parseMarkdown("> quoted"), [
  { kind: "quote", text: "quoted" },
]);

// A blank line separates paragraphs; a soft wrap does not.
assert.deepEqual(parseMarkdown("one\ntwo"), [
  { kind: "paragraph", text: "one two" },
]);
assert.deepEqual(parseMarkdown("one\n\ntwo"), [
  { kind: "paragraph", text: "one" },
  { kind: "paragraph", text: "two" },
]);

// A list ends at a blank line and does not swallow what follows.
assert.deepEqual(parseMarkdown("- a\n\nafter"), [
  { kind: "list", items: ["a"] },
  { kind: "paragraph", text: "after" },
]);
// A list ends at a heading too, and the heading is not folded into it.
assert.deepEqual(parseMarkdown("- a\n## Next"), [
  { kind: "list", items: ["a"] },
  { kind: "heading", level: 2, text: "Next" },
]);

assert.deepEqual(parseMarkdown(""), []);
assert.deepEqual(parseMarkdown("\n\n  \n"), []);

assert.deepEqual(parseSpans("plain"), [{ kind: "text", text: "plain" }]);
assert.deepEqual(parseSpans("a **b** c"), [
  { kind: "text", text: "a " },
  { kind: "bold", text: "b" },
  { kind: "text", text: " c" },
]);
assert.deepEqual(parseSpans("a *b* c"), [
  { kind: "text", text: "a " },
  { kind: "italic", text: "b" },
  { kind: "text", text: " c" },
]);
assert.deepEqual(parseSpans("see [docs](https://x.test/a)"), [
  { kind: "text", text: "see " },
  { kind: "link", text: "docs", href: "https://x.test/a" },
]);
assert.deepEqual(parseSpans("[home](/rules)"), [
  { kind: "link", text: "home", href: "/rules" },
]);

// Dangerous schemes must never become a link. What matters is that no link
// span is produced and the raw text survives, not how the text is segmented.
for (const unsafe of [
  "[x](javascript:alert(1))",
  "[x](data:text/html,y)",
  "[x](vbscript:msgbox)",
  "[x](JAVASCRIPT:alert(1))",
]) {
  const spans = parseSpans(unsafe);
  assert.equal(
    spans.some((s) => s.kind === "link"),
    false,
    `unsafe href became a link: ${unsafe}`,
  );
  assert.equal(spans.map((s) => s.text).join(""), unsafe);
}

// Unclosed emphasis stays literal instead of eating the rest of the line.
assert.deepEqual(parseSpans("a ** b"), [{ kind: "text", text: "a ** b" }]);

assert.equal(readTimeFromBody(""), "1 MIN READ");
assert.equal(readTimeFromBody("word ".repeat(200)), "1 MIN READ");
assert.equal(readTimeFromBody("word ".repeat(600)), "3 MIN READ");

console.log("markdown.check.ts: all assertions passed");
