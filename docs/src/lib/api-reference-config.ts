import { mergeSpecs } from './merge-specs.js'
import scalarSidebarCss from '../styles/scalar-api-reference.css?raw'

export interface ScalarPageConfig {
  content: string
  hideClientButton: boolean
  hideTestRequestButton: boolean
  isEditable: boolean
  mcp: { disabled: boolean }
  agent: { disabled: boolean }
  documentDownloadType: 'none'
  customCss: string
}

export function getApiReferenceConfig(): ScalarPageConfig {
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
