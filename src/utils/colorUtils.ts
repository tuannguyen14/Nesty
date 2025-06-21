/**
 * Maps Vietnamese color names to hex colors
 */
export function getColorStyle(color: string): string {
  const colorMap: Record<string, string> = {
    'đỏ': '#ef4444',
    'red': '#ef4444',
    'xanh': '#3b82f6',
    'blue': '#3b82f6',
    'xanh lá': '#22c55e',
    'green': '#22c55e',
    'vàng': '#eab308',
    'yellow': '#eab308',
    'đen': '#1f2937',
    'black': '#1f2937',
    'trắng': '#f9fafb',
    'white': '#f9fafb',
    'hồng': '#ec4899',
    'pink': '#ec4899',
    'tím': '#8b5cf6',
    'purple': '#8b5cf6',
    'cam': '#f97316',
    'orange': '#f97316',
    'nâu': '#a3a3a3',
    'brown': '#a3a3a3',
    'xám': '#6b7280',
    'gray': '#6b7280',
    'grey': '#6b7280'
  };

  const normalizedColor = color.toLowerCase().trim();
  
  // Try exact match first
  if (colorMap[normalizedColor]) {
    return colorMap[normalizedColor];
  }

  // Try partial match
  for (const [key, value] of Object.entries(colorMap)) {
    if (normalizedColor.includes(key)) {
      return value;
    }
  }

  // Default color
  return '#6b7280';
}