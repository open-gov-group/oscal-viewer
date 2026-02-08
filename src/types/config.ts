/**
 * Configuration types for the OSCAL Viewer app.
 * Loaded from `public/config.json` at runtime for preset quick-load buttons.
 */

/** A preset entry displayed as a quick-load button on the dropzone. */
export interface PresetEntry {
  title: string
  url: string
}

/** Root config object loaded from config.json. */
export interface AppConfig {
  presets?: PresetEntry[]
}
