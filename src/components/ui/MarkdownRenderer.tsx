import { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='bg-accent/60 px-1 rounded text-[13px] font-mono'>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-primary underline'>$1</a>");
}

function renderBlock(text: string): string {
  const lines = text.split("\n");
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      const code = escapeHtml(codeLines.join("\n"));
      html.push(`<pre class="bg-accent/40 rounded-lg p-3 overflow-x-auto text-sm font-mono leading-relaxed my-2"><code>${code}</code></pre>`);
      i++;
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      html.push(`<h3 class="text-base font-semibold mt-4 mb-1">${renderInline(line.slice(4))}</h3>`);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      html.push(`<h2 class="text-lg font-semibold mt-5 mb-1">${renderInline(line.slice(3))}</h2>`);
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      html.push(`<h1 class="text-xl font-bold mt-5 mb-2">${renderInline(line.slice(2))}</h1>`);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(renderInline(lines[i].slice(2)));
        i++;
      }
      html.push(`<blockquote class="border-l-2 border-primary/40 pl-3 my-2 text-foreground/70 italic">${quoteLines.join("<br/>")}</blockquote>`);
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        listItems.push(`<li>${renderInline(lines[i].replace(/^[-*]\s/, ""))}</li>`);
        i++;
      }
      html.push(`<ul class="list-disc pl-5 my-2 space-y-0.5">${listItems.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        listItems.push(`<li>${renderInline(lines[i].replace(/^\d+\.\s/, ""))}</li>`);
        i++;
      }
      html.push(`<ol class="list-decimal pl-5 my-2 space-y-0.5">${listItems.join("")}</ol>`);
      continue;
    }

    // Horizontal rule
    if (line.match(/^---$/)) {
      html.push(`<hr class="my-3 border-border" />`);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      html.push(`<div class="h-2"></div>`);
      i++;
      continue;
    }

    // Paragraph
    html.push(`<p class="my-1 leading-relaxed">${renderInline(line)}</p>`);
    i++;
  }

  return html.join("\n");
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const html = useMemo(() => renderBlock(content), [content]);

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
