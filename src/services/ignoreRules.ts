/**
 * ignoreRules.ts
 * 忽略規則管理 — 對應原版 config.json + scanner.py 的 parse_gitignore / should_ignore
 */

/** 預設忽略清單（對應原版 config.json ignore_patterns） */
export const DEFAULT_IGNORE_PATTERNS: string[] = [
  '.git',
  '__pycache__',
  '.DS_Store',
  '.venv',
  'venv',
  'node_modules',
  '.vite',
  'dist',
  'build',
  'output',
  '.idea',
  '*.dll',
  '*.so',
  '*.pyc',
  '*.map',
  '*.cmd',
  '*.ps1',
  '*.log',
]

/**
 * 解析 .gitignore 文字內容，回傳 pattern 陣列
 * 過濾空行與 # 開頭的註解，移除結尾斜線
 */
export function parseGitignoreContent(content: string): string[] {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'))
    .map(line => (line.endsWith('/') ? line.slice(0, -1) : line))
}

/**
 * 簡易萬用字元比對（對應原版 fnmatch）
 * 支援 * 萬用字元，例如 *.dll、*.pyc
 */
function matchesPattern(name: string, pattern: string): boolean {
  // 將 pattern 轉為 RegExp，只處理 * 萬用字元
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  const regexStr = escaped.replace(/\*/g, '.*')
  const regex = new RegExp(`^${regexStr}$`, 'i')
  return regex.test(name)
}

/** 檢查名稱是否命中任一忽略規則 */
export function shouldIgnore(name: string, patterns: string[]): boolean {
  return patterns.some(p => matchesPattern(name, p))
}
