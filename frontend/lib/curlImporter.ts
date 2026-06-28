import type { KeyValueItem, HttpMethod, BodyType, AuthType, AuthData } from '@/types/request';

interface ParsedCurl {
  method: HttpMethod;
  url: string;
  params: KeyValueItem[];
  headers: KeyValueItem[];
  body_type: BodyType;
  body_content: string | null;
  auth_type: AuthType;
  auth_data: AuthData;
}

/**
 * Tokenize a cURL string into an array of tokens, respecting single/double quotes.
 * Handles escaped quotes and line continuations (\ at end of line).
 */
function tokenize(input: string): string[] {
  // Normalize line continuations: "\ \n" → single space
  const normalized = input.replace(/\\\s*\n\s*/g, ' ').trim();

  const tokens: string[] = [];
  let i = 0;

  while (i < normalized.length) {
    // Skip whitespace
    if (/\s/.test(normalized[i])) { i++; continue; }

    if (normalized[i] === "'" ) {
      // Single-quoted token — read until closing '
      let token = '';
      i++; // skip opening quote
      while (i < normalized.length && normalized[i] !== "'") {
        token += normalized[i++];
      }
      i++; // skip closing quote
      tokens.push(token);
    } else if (normalized[i] === '"') {
      // Double-quoted token — handle \" escapes
      let token = '';
      i++; // skip opening quote
      while (i < normalized.length && normalized[i] !== '"') {
        if (normalized[i] === '\\' && i + 1 < normalized.length) {
          i++; // skip backslash
          token += normalized[i++];
        } else {
          token += normalized[i++];
        }
      }
      i++; // skip closing quote
      tokens.push(token);
    } else {
      // Unquoted token — read until whitespace
      let token = '';
      while (i < normalized.length && !/\s/.test(normalized[i])) {
        token += normalized[i++];
      }
      tokens.push(token);
    }
  }

  return tokens;
}

/**
 * Parse a cURL command string into request parameters.
 * Handles: -X METHOD, -H header, -d/-data/--data-raw body, -u user:pass
 * Supports single-quoted, double-quoted, and unquoted arguments.
 * Supports multi-line cURL with backslash continuations.
 */
export function parseCurl(curlStr: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    body_type: 'none',
    body_content: null,
    auth_type: 'none',
    auth_data: {},
  };

  const tokens = tokenize(curlStr);

  // First token should be 'curl'
  let i = 0;
  if (tokens[i]?.toLowerCase() === 'curl') i++;

  let hasExplicitMethod = false;

  while (i < tokens.length) {
    const token = tokens[i];

    // -X METHOD or --request METHOD
    if (token === '-X' || token === '--request') {
      const method = tokens[++i];
      if (method) {
        result.method = method.toUpperCase() as HttpMethod;
        hasExplicitMethod = true;
      }
    }
    // -X METHOD combined (e.g. -XPOST)
    else if (/^-X([A-Z]+)$/i.test(token)) {
      const method = token.slice(2).toUpperCase();
      result.method = method as HttpMethod;
      hasExplicitMethod = true;
    }
    // -H "Key: Value" or --header
    else if (token === '-H' || token === '--header') {
      const headerStr = tokens[++i];
      if (headerStr) {
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx !== -1) {
          const key = headerStr.slice(0, colonIdx).trim();
          const value = headerStr.slice(colonIdx + 1).trim();
          if (key.toLowerCase() === 'authorization') {
            if (value.startsWith('Bearer ')) {
              result.auth_type = 'bearer';
              result.auth_data = { token: value.slice(7).trim() };
            } else if (value.startsWith('Basic ')) {
              const decoded = atob(value.slice(6).trim());
              const [username, ...rest] = decoded.split(':');
              result.auth_type = 'basic';
              result.auth_data = { username, password: rest.join(':') };
            } else {
              result.headers.push({ key, value, enabled: true });
            }
          } else {
            result.headers.push({ key, value, enabled: true });
          }
        }
      }
    }
    // -d, --data, --data-raw, --data-binary
    else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
      const body = tokens[++i];
      if (body !== undefined) {
        try {
          JSON.parse(body);
          result.body_type = 'json';
          result.body_content = body;
          if (!hasExplicitMethod) result.method = 'POST';
        } catch {
          // Check if it looks like form-encoded (key=value&key=value)
          if (/^[^=&]+=[^&]*(&[^=&]+=[^&]*)*$/.test(body) && !body.includes('\n')) {
            result.body_type = 'x-www-form-urlencoded';
            try {
              const params = new URLSearchParams(body);
              const items: KeyValueItem[] = [];
              params.forEach((value, key) => items.push({ key, value, enabled: true }));
              result.body_content = JSON.stringify(items);
            } catch {
              result.body_content = body;
            }
          } else {
            result.body_type = 'text';
            result.body_content = body;
          }
          if (!hasExplicitMethod) result.method = 'POST';
        }
      }
    }
    // -F, --form (multipart/form-data)
    else if (token === '-F' || token === '--form') {
      const field = tokens[++i];
      if (field !== undefined) {
        const eqIdx = field.indexOf('=');
        if (eqIdx !== -1) {
          const key = field.slice(0, eqIdx);
          const value = field.slice(eqIdx + 1);
          
          if (result.body_type !== 'form-data') {
            result.body_type = 'form-data';
            result.body_content = '[]';
          }
          
          try {
            const items: KeyValueItem[] = JSON.parse(result.body_content || '[]');
            items.push({ key, value, enabled: true });
            result.body_content = JSON.stringify(items);
          } catch {
            // ignore
          }
        }
        if (!hasExplicitMethod) result.method = 'POST';
      }
    }
    // -u user:pass (basic auth)
    else if (token === '-u' || token === '--user') {
      const userPass = tokens[++i];
      if (userPass) {
        const colonIdx = userPass.indexOf(':');
        if (colonIdx !== -1) {
          result.auth_type = 'basic';
          result.auth_data = {
            username: userPass.slice(0, colonIdx),
            password: userPass.slice(colonIdx + 1),
          };
        }
      }
    }
    // --url or bare URL (starts with http)
    else if (token === '--url') {
      const url = tokens[++i];
      if (url) setUrl(result, url);
    }
    else if (!token.startsWith('-') && (token.startsWith('http://') || token.startsWith('https://'))) {
      setUrl(result, token);
    }
    // Skip other flags like -s, -v, -L, --compressed, --max-time N, etc.
    else if (token === '--max-time' || token === '--connect-timeout' || token === '-m') {
      i++; // skip the value
    }

    i++;
  }

  return result;
}

function setUrl(result: ParsedCurl, rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    result.url = `${url.origin}${url.pathname}`;
    url.searchParams.forEach((value, key) => {
      result.params.push({ key, value, enabled: true });
    });
  } catch {
    result.url = rawUrl;
  }
}
