export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": "'",
    };
    return entities[character] ?? character;
  });
}