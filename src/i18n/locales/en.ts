export interface Locale {
  badge: string
  heroTitle: string
  heroTitleAccent: string
  heroSubtitle: string
  pickFolder: string
  uploadZip: string
  browserWarning: string
  dragHint: string
  dragActive: string
  dropOverlay: string
  featureBrowserOnly: string
  featureBrowserOnlyDesc: string
  featureOutput: string
  featureOutputDesc: string
  featureWorkflow: string
  featureWorkflowDesc: string
  changeFolder: string
  changeZip: string
  parsing: string
  parsingSplash: string
  clear: string
  smartCollapse: string
  nodeConfig: string
  live: string
  copyText: string
  copied: string
  exportFile: string
  exportTxt: string
  exportMd: string
  exportJson: string
  sendToDiff: string
  asciiPreviewPlaceholder: string
  typewriterCaption: string
  langSwitcherAria: string
}

const en: Locale = {
  badge: 'Project Structure Tool',
  heroTitle: 'Turn your project structure into',
  heroTitleAccent: 'a shareable text summary',
  heroSubtitle: 'From folder to README in seconds. Analyze project structure entirely in the browser and export a clean TXT or Markdown.',
  pickFolder: '📂 Pick folder',
  uploadZip: '📦 Upload ZIP',
  browserWarning: '⚠️ Please use Chrome / Edge (folder picker required)',
  dragHint: 'Drop a ZIP file anywhere on the page',
  dragActive: '✦ Release to load ZIP',
  dropOverlay: 'Release to load ZIP',
  featureBrowserOnly: 'Browser Only',
  featureBrowserOnlyDesc: 'No install required',
  featureOutput: 'TXT / MD',
  featureOutputDesc: 'Share directly with AI or team',
  featureWorkflow: 'ZIP Support',
  featureWorkflowDesc: 'Drag-and-drop or archive upload',
  changeFolder: '📂 Change folder',
  changeZip: '📦 Change ZIP',
  parsing: 'Parsing...',
  parsingSplash: 'Parsing, please wait...',
  clear: '✕ Clear',
  smartCollapse: 'Smart collapse',
  nodeConfig: 'Node config',
  live: 'LIVE',
  copyText: '📋 Copy text',
  copied: '✓ Copied',
  exportFile: '📥 Export ▼',
  exportTxt: '📄 Export plain text (.txt)',
  exportMd: '✍️ Export Markdown (.md)',
  exportJson: '🔗 Export JSON tree (for Diff etc.)',
  sendToDiff: '↗ Send to Diff',
  asciiPreviewPlaceholder: 'Parse the left panel to see the ASCII structure here...',
  typewriterCaption: 'Export looks like this',
  langSwitcherAria: 'Switch language',
}

export default en
