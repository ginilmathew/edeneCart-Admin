import { getApiBaseUrl } from "../api/api-base-url";

/**
 * When true, India Post mutations use same-origin `/v1/api/india-post/*` which Vite
 * rewrites to `https://test.cept.gov.in/beextcustomer/v1/*` (no Nest hop, no Eden JWT).
 * Requires `VITE_API_BASE_URL` unset and `import.meta.env.DEV`.
 */
export function isIndiaPostDirectDevProxy(): boolean {
  return Boolean(import.meta.env.DEV && !getApiBaseUrl().trim());
}
