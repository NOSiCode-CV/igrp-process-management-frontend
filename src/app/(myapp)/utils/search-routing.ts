/**
 * Routes the single free-text search box to the correct typed filter.
 *
 * The tasks/instances search endpoints have no combined "search" param — only
 * separate `name` and `processNumber` filters (which AND together server-side).
 * So a single box must pick ONE: a value that looks like a process number
 * (has digits, no spaces, e.g. "CV-24509202511" or "P3.6.1") goes to
 * `processNumber`; anything else is treated as a name (task or instance).
 * The other field is always cleared so the two never AND together.
 */
export function looksLikeProcessNumber(term: string): boolean {
  const t = term.trim();
  if (!t) return false;
  return /\d/.test(t) && !/\s/.test(t) && /^[\p{L}\d._\-/]+$/u.test(t);
}

export function routeSearchTerm(term: string): {
  name: string;
  processNumber: string;
} {
  const t = (term ?? "").trim();
  if (!t) return { name: "", processNumber: "" };
  return looksLikeProcessNumber(t)
    ? { name: "", processNumber: t }
    : { name: t, processNumber: "" };
}
