import { describe, it, expect } from 'vitest'

describe('OSCAL Parser', () => {
  it('should detect catalog document type', () => {
    const json = {
      catalog: {
        uuid: '123',
        metadata: {
          title: 'Test Catalog',
          'oscal-version': '1.1.2'
        }
      }
    }

    expect(detectDocumentType(json)).toBe('catalog')
  })

  it('should detect profile document type', () => {
    const json = {
      profile: {
        uuid: '123',
        metadata: {
          title: 'Test Profile',
          'oscal-version': '1.1.2'
        }
      }
    }

    expect(detectDocumentType(json)).toBe('profile')
  })

  it('should detect OSCAL version from metadata', () => {
    const json = {
      catalog: {
        uuid: '123',
        metadata: {
          title: 'Test Catalog',
          'oscal-version': '1.1.2'
        }
      }
    }

    expect(detectVersion(json)).toBe('1.1.2')
  })

  it('should handle unknown document types', () => {
    const json = { unknown: {} }
    expect(detectDocumentType(json)).toBe('unknown')
  })
})

// Temporary implementations for testing
function detectDocumentType(json: unknown): string {
  if (typeof json !== 'object' || json === null) return 'unknown'

  const obj = json as Record<string, unknown>

  if ('catalog' in obj) return 'catalog'
  if ('profile' in obj) return 'profile'
  if ('component-definition' in obj) return 'component-definition'
  if ('system-security-plan' in obj) return 'system-security-plan'

  return 'unknown'
}

function detectVersion(json: unknown): string {
  if (typeof json !== 'object' || json === null) return 'unknown'

  const obj = json as Record<string, unknown>

  for (const key of ['catalog', 'profile', 'component-definition', 'system-security-plan']) {
    const doc = obj[key] as Record<string, unknown> | undefined
    if (doc?.metadata) {
      const metadata = doc.metadata as Record<string, unknown>
      if (metadata['oscal-version']) {
        return String(metadata['oscal-version'])
      }
    }
  }

  return 'unknown'
}
