// Colors are stored either as a plain hex string ("#000000")
// or as "Name|#hex" so admins can set a custom color name manually.

export const presetColorNames: Record<string, string> = {
  "#000000": "Black",
  "#FFFFFF": "White",
  "#1B2A4A": "Navy",
  "#6B7280": "Grey",
  "#556B2F": "Olive",
  "#800000": "Maroon",
  "#D4C5A9": "Beige",
  "#8B4513": "Brown",
  "#87CEEB": "Sky Blue",
  "#DC2626": "Red",
  "#0D9488": "Teal",
  "#FFFDD0": "Cream",
  "#C0C0C0": "Silver",
  "#F5F5DC": "Ivory",
  "#1E3A8A": "Blue",
};

export type ParsedColor = { raw: string; hex: string; name: string };

export const parseColor = (raw: string): ParsedColor => {
  if (raw?.includes("|")) {
    const [name, hex] = raw.split("|");
    return { raw, hex: (hex || "#000000").trim(), name: (name || hex || "").trim() };
  }
  const hex = (raw || "").trim();
  return { raw, hex, name: presetColorNames[hex.toUpperCase()] || presetColorNames[hex] || hex };
};

export const buildColor = (name: string, hex: string) =>
  name.trim() ? `${name.trim()}|${hex}` : hex;

export const colorName = (raw: string) => parseColor(raw).name;
export const colorHex = (raw: string) => parseColor(raw).hex;
