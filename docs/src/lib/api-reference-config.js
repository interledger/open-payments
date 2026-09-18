import { mergeSpecs } from './merge-specs.js'
import scalarSidebarCss from '../styles/scalar-api-reference.css?raw'

export function getApiReferenceConfig() {
  return {
    content: mergeSpecs(),
    hideClientButton: true,
    hideTestRequestButton: true,
    isEditable: false,
    mcp: { disabled: true },
    agent: { disabled: true },
    documentDownloadType: 'none',
    customCss: scalarSidebarCss
  }
}
