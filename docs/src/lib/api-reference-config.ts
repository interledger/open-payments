import type { createApiReference } from '@scalar/api-reference'
import { mergeSpecs } from './merge-specs.js'
import scalarSidebarCss from '../styles/scalar-api-reference.css?raw'

// Derived from the function this config is passed to. `@scalar/api-reference`
// re-exports `ApiReferenceConfiguration`, but some keys used here (`agent`)
// live on the source-aware variant that it does not re-export.
type ScalarConfiguration = Parameters<typeof createApiReference>[1]

export function getApiReferenceConfig(): ScalarConfiguration {
  return {
    content: mergeSpecs(),
    hideClientButton: true,
    hideTestRequestButton: true,
    isEditable: false,
    mcp: { disabled: true },
    agent: { disabled: true },
    documentDownloadType: 'none',
    // Defaults to 'localhost', which puts a Configure/Share/Deploy bar over
    // the reference during local development. Those controls drive Scalar's
    // hosted platform, which this published reference does not use.
    showDeveloperTools: 'never',
    // Scalar otherwise loads Inter and JetBrains Mono from fonts.scalar.com at
    // runtime. The docs set no webfont of their own, so turning this off both
    // drops the third-party request and matches the type on the two sites.
    withDefaultFonts: false,
    customCss: scalarSidebarCss
  }
}
