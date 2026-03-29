export interface ParsedItem {
  name: string;
  quantity: number;
}

export function parseEveItemText(text: string): ParsedItem[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const items: ParsedItem[] = [];

  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed) {
      const existing = items.find(
        (i) => i.name.toLowerCase() === parsed.name.toLowerCase(),
      );
      if (existing) {
        existing.quantity += parsed.quantity;
      } else {
        items.push(parsed);
      }
    }
  }

  return items;
}

function parseLine(line: string): ParsedItem | null {
  const tabParts = line.split("\t");

  if (tabParts.length >= 2) {
    const name = tabParts[0].trim();
    const qtyStr = tabParts[1].trim().replace(/[,.\s]/g, "");
    const quantity = parseInt(qtyStr, 10);
    if (name && !isNaN(quantity) && quantity > 0) {
      return { name, quantity };
    }
  }

  const multMatch = line.match(/^(.+?)\s+x\s*(\d[\d,]*)\s*$/i);
  if (multMatch) {
    const name = multMatch[1].trim();
    const quantity = parseInt(multMatch[2].replace(/,/g, ""), 10);
    if (name && !isNaN(quantity) && quantity > 0) {
      return { name, quantity };
    }
  }

  const trailingMatch = line.match(/^(.+?)\s+(\d[\d,]*)\s*$/);
  if (trailingMatch) {
    const name = trailingMatch[1].trim();
    const quantity = parseInt(trailingMatch[2].replace(/,/g, ""), 10);
    if (name && !isNaN(quantity) && quantity > 0) {
      return { name, quantity };
    }
  }

  return null;
}
