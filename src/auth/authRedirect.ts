/**
 * Auth redirect helpers.
 *
 * The app is a static SPA that can live at a subpath on GitHub Pages
 * (https://user.github.io/repo/), so we build redirect URLs from the current
 * location instead of hard-coding them. Every URL returned here must also be
 * present in the Supabase "Redirect URLs" allow list.
 */

export function getRedirectUrl(): string {
  const { origin, pathname } = window.location
  const cleanPath = pathname.replace(/index\.html$/, '')
  return origin + cleanPath
}

/** Reads an OAuth / email-link error out of the URL fragment or query string. */
export function readAuthError(): string | null {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  const hashParams = new URLSearchParams(hash)
  const queryParams = new URLSearchParams(window.location.search)

  const description =
    hashParams.get('error_description') ?? queryParams.get('error_description')
  const code = hashParams.get('error_code') ?? queryParams.get('error_code')

  if (!description && !code) return null
  return (description ?? `Authentication error (${code})`).replace(/\+/g, ' ')
}

/** Removes auth tokens / errors from the address bar after they are consumed. */
export function clearAuthParams(): void {
  window.history.replaceState(null, '', window.location.pathname)
}
