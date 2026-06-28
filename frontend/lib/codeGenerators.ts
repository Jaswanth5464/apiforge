import type { KeyValueItem, HttpMethod, BodyType, AuthType, AuthData } from '@/types/request';

interface CurlOptions {
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
 * Generate a cURL command from request parameters.
 */
export function generateCurl(opts: CurlOptions): string {
  const parts: string[] = ['curl'];

  // Method
  if (opts.method !== 'GET') {
    parts.push(`-X ${opts.method}`);
  }

  // URL with params
  let url = opts.url;
  const enabledParams = opts.params.filter((p) => p.enabled && p.key);
  if (enabledParams.length > 0) {
    const qs = enabledParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
    url = `${url}${url.includes('?') ? '&' : '?'}${qs}`;
  }
  parts.push(`'${url}'`);

  // Auth headers
  if (opts.auth_type === 'bearer' && opts.auth_data.token) {
    parts.push(`-H 'Authorization: Bearer ${opts.auth_data.token}'`);
  } else if (opts.auth_type === 'basic' && opts.auth_data.username) {
    parts.push(`-u '${opts.auth_data.username}:${opts.auth_data.password || ''}'`);
  }

  // Headers
  const enabledHeaders = opts.headers.filter((h) => h.enabled && h.key);
  for (const h of enabledHeaders) {
    parts.push(`-H '${h.key}: ${h.value}'`);
  }

  // Body
  if (opts.body_content && opts.body_type !== 'none') {
    if (opts.body_type === 'json') {
      parts.push(`-H 'Content-Type: application/json'`);
      parts.push(`-d '${opts.body_content.replace(/'/g, "\\'")}'`);
    } else if (opts.body_type === 'text') {
      parts.push(`-d '${opts.body_content.replace(/'/g, "\\'")}'`);
    } else if (opts.body_type === 'x-www-form-urlencoded') {
      parts.push(`--data-urlencode '${opts.body_content}'`);
    }
  }

  return parts.join(' \\\n  ');
}

/**
 * Generate a JavaScript Fetch API snippet.
 */
export function generateFetchCode(opts: CurlOptions): string {
  const enabledHeaders = opts.headers.filter((h) => h.enabled && h.key);
  const headersObj: Record<string, string> = {};

  for (const h of enabledHeaders) {
    headersObj[h.key] = h.value;
  }

  if (opts.auth_type === 'bearer' && opts.auth_data.token) {
    headersObj['Authorization'] = `Bearer ${opts.auth_data.token}`;
  } else if (opts.auth_type === 'basic' && opts.auth_data.username) {
    const creds = btoa(`${opts.auth_data.username}:${opts.auth_data.password || ''}`);
    headersObj['Authorization'] = `Basic ${creds}`;
  }

  let url = opts.url;
  const enabledParams = opts.params.filter((p) => p.enabled && p.key);
  if (enabledParams.length > 0) {
    const qs = new URLSearchParams(
      Object.fromEntries(enabledParams.map((p) => [p.key, p.value]))
    ).toString();
    url = `${url}${url.includes('?') ? '&' : '?'}${qs}`;
  }

  const fetchOptions: Record<string, unknown> = {
    method: opts.method,
    headers: headersObj,
  };

  if (opts.body_content && opts.body_type !== 'none') {
    if (opts.body_type === 'json') {
      headersObj['Content-Type'] = 'application/json';
      fetchOptions.body = opts.body_content;
    } else {
      fetchOptions.body = opts.body_content;
    }
  }

  return `const response = await fetch('${url}', ${JSON.stringify(fetchOptions, null, 2)});
const data = await response.json();
console.log(data);`;
}

/**
 * Generate a Python requests snippet.
 */
export function generatePythonCode(opts: CurlOptions): string {
  const enabledHeaders = opts.headers.filter((h) => h.enabled && h.key);
  const headersObj: Record<string, string> = {};
  const paramsObj: Record<string, string> = {};

  for (const h of enabledHeaders) {
    headersObj[h.key] = h.value;
  }
  for (const p of opts.params.filter((p) => p.enabled && p.key)) {
    paramsObj[p.key] = p.value;
  }

  if (opts.auth_type === 'bearer' && opts.auth_data.token) {
    headersObj['Authorization'] = `Bearer ${opts.auth_data.token}`;
  }

  let bodyPart = '';
  if (opts.body_content && opts.body_type === 'json') {
    headersObj['Content-Type'] = 'application/json';
    bodyPart = `json=${opts.body_content}`;
  } else if (opts.body_content) {
    bodyPart = `data="${opts.body_content}"`;
  }

  const authPart =
    opts.auth_type === 'basic' && opts.auth_data.username
      ? `auth=('${opts.auth_data.username}', '${opts.auth_data.password || ''}')`
      : '';

  const args = [
    `'${opts.url}'`,
    Object.keys(headersObj).length ? `headers=${JSON.stringify(headersObj, null, 4)}` : '',
    Object.keys(paramsObj).length ? `params=${JSON.stringify(paramsObj, null, 4)}` : '',
    bodyPart,
    authPart,
  ]
    .filter(Boolean)
    .join(',\n    ');

  return `import requests

response = requests.${opts.method.toLowerCase()}(
    ${args}
)
print(response.status_code)
print(response.json())`;
}
