/**
 * DocumentCache — In-memory cache for fetched and parsed OSCAL documents.
 *
 * Stores OscalDocument instances keyed by normalized URL.
 * URL normalization: strip fragment (#...), lowercase.
 * Domain Layer: no Preact imports, no fetch, no side effects.
 */
import type { OscalDocument } from '@/types/oscal'

/** Normalize a URL for cache keying: strip fragment, lowercase. */
export function normalizeUrl(url: string): string {
  // Strip fragment
  const hashIndex = url.indexOf('#')
  const base = hashIndex === -1 ? url : url.slice(0, hashIndex)
  return base.toLowerCase()
}

/** In-memory cache for fetched OSCAL documents, keyed by normalized URL. */
export class DocumentCache {
  private cache = new Map<string, OscalDocument>()

  /** Retrieve a cached document by URL. Returns undefined if not cached. */
  get(url: string): OscalDocument | undefined {
    return this.cache.get(normalizeUrl(url))
  }

  /** Store a parsed document in the cache, keyed by normalized URL. */
  set(url: string, doc: OscalDocument): void {
    this.cache.set(normalizeUrl(url), doc)
  }

  /** Check whether a document for the given URL is in the cache. */
  has(url: string): boolean {
    return this.cache.has(normalizeUrl(url))
  }

  /** Remove all cached documents. */
  clear(): void {
    this.cache.clear()
  }

  /** Number of cached documents. */
  get size(): number {
    return this.cache.size
  }
}
