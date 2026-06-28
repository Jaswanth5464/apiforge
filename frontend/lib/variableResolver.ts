/**
 * Resolves {{variable}} placeholders using provided variable map.
 * Safe against missing vars (leaves them as-is) and circular refs.
 */
export function resolveVariables(
  text: string,
  variables: Record<string, string>,
  depth = 0
): string {
  if (!text || depth > 5) return text;
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmed = key.trim();
    const value = variables[trimmed];
    if (value === undefined) return match;
    return resolveVariables(value, variables, depth + 1);
  });
}

/**
 * Highlights {{variable}} placeholders in a URL string.
 * Returns segments with resolved/unresolved flags.
 */
export function highlightVariables(
  text: string,
  variables: Record<string, string>
): Array<{ text: string; isVar: boolean; resolved: boolean }> {
  const parts: Array<{ text: string; isVar: boolean; resolved: boolean }> = [];
  const pattern = /(\{\{[^}]+\}\})/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isVar: false, resolved: true });
    }
    const key = match[1].slice(2, -2).trim();
    parts.push({ text: match[1], isVar: true, resolved: key in variables });
    lastIndex = match.index + match[1].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isVar: false, resolved: true });
  }

  return parts;
}
