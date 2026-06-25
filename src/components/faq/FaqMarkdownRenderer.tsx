/**
 * Renderiza o fullAnswer do FAQ (markdown simples) como JSX.
 * Suporta: ## headings, **bold**, - listas, | tabelas |, parágrafos.
 * Não usa react-markdown para não adicionar dependência.
 */

interface FaqMarkdownRendererProps {
  content: string;
  className?: string;
}

type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; items: InlineNode[][] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "paragraph"; nodes: InlineNode[] };

type InlineNode =
  | { type: "bold"; text: string }
  | { type: "text"; text: string };

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push({ type: "text", text: text.slice(last, match.index) });
    nodes.push({ type: "bold", text: match[1] });
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push({ type: "text", text: text.slice(last) });
  return nodes;
}

function renderInline(nodes: InlineNode[], key: string) {
  return nodes.map((n, i) =>
    n.type === "bold"
      ? <strong key={`${key}-b${i}`} className="font-semibold text-foreground">{n.text}</strong>
      : <span key={`${key}-t${i}`}>{n.text}</span>
  );
}

function parseBlocks(raw: string): Block[] {
  const lines = raw.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) { blocks.push({ type: "heading", level: 2, text: h2[1].trim() }); i++; continue; }
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) { blocks.push({ type: "heading", level: 3, text: h3[1].trim() }); i++; continue; }

    // Table
    if (line.startsWith("|") && line.endsWith("|")) {
      const headers = line.split("|").slice(1, -1).map(h => h.trim());
      const rows: string[][] = [];
      i++;
      // skip separator row (|---|---|)
      if (i < lines.length && /^\|[-| :]+\|$/.test(lines[i])) i++;
      while (i < lines.length && lines[i].startsWith("|") && lines[i].endsWith("|")) {
        rows.push(lines[i].split("|").slice(1, -1).map(c => c.trim()));
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // List block — accumulate consecutive list items
    if (line.match(/^[-*]\s+/)) {
      const items: InlineNode[][] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(parseInline(lines[i].replace(/^[-*]\s+/, "")));
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    // Empty line — skip
    if (line.trim() === "") { i++; continue; }

    // Paragraph — accumulate non-empty non-special lines
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^#+\s/) &&
      !lines[i].match(/^[-*]\s/) &&
      !lines[i].startsWith("|")
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    if (paragraphLines.length > 0) {
      blocks.push({ type: "paragraph", nodes: parseInline(paragraphLines.join(" ")) });
    }
  }

  return blocks;
}

export function FaqMarkdownRenderer({ content, className }: FaqMarkdownRendererProps) {
  const blocks = parseBlocks(content);

  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        if (block.type === "heading") {
          return block.level === 2
            ? <h3 key={bi} className="text-sm font-bold text-foreground mt-5 mb-2 first:mt-0 pb-1 border-b border-border/50">{block.text}</h3>
            : <h4 key={bi} className="text-sm font-semibold text-foreground mt-3 mb-1">{block.text}</h4>;
        }

        if (block.type === "list") {
          return (
            <ul key={bi} className="space-y-1 my-2 ml-1">
              {block.items.map((item, ii) => (
                <li key={ii} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                  <span>{renderInline(item, `${bi}-${ii}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "table") {
          return (
            <div key={bi} className="my-3 overflow-x-auto rounded-md border text-sm">
              <table className="w-full text-left">
                <thead className="bg-muted/50">
                  <tr>
                    {block.headers.map((h, hi) => (
                      <th key={hi} className="px-3 py-2 font-semibold text-foreground text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri} className="border-t border-border/50 even:bg-muted/20">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 text-muted-foreground">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // paragraph
        return (
          <p key={bi} className="text-sm text-muted-foreground leading-relaxed my-2">
            {renderInline(block.nodes, `${bi}`)}
          </p>
        );
      })}
    </div>
  );
}
