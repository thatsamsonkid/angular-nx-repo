export interface DataAttribute {
  name: string;
  value: string;
}

export function camelCaseAttribute(attribute: string): string {
  const attr = attribute.replace(/^data-/, '');
  const chunks = attr.split('-');

  if (chunks.length > 1) {
    return (
      chunks[0] +
      chunks
        .slice(1)
        .map((chunk) => chunk.replace(/^\w/, (char) => char.toUpperCase()))
        .join('')
    );
  }

  return attr;
}

export function readDataAttributes(element: HTMLElement): DataAttribute[] {
  return Array.from(element.attributes)
    .filter((attribute) => attribute.name.startsWith('data-'))
    .map((attribute) => ({
      name: camelCaseAttribute(attribute.name),
      value: attribute.value,
    }));
}
