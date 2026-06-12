/**
 * formatter.ts
 * ASCII 樹狀圖渲染引擎
 * 對應原版 formatter.py 的 render_from_schema() + truncate_and_sort_children()
 * 改為純前端同步計算，無需 API 呼叫
 */

import type { TreeNodeData } from '../types'

// ─────────────────────────────────────────────
// 語意白名單（DD-025）
// 這些副檔名的檔案永遠不折疊
// ─────────────────────────────────────────────
export const EXEMPT_EXTENSIONS = new Set([
  '.py', '.js', '.jsx', '.ts', '.tsx', '.json',
  '.md', '.html', '.css', '.java', '.go', '.rs',
  '.cpp', '.c', '.h', '.yml', '.yaml', '.xml',
  '.vue', '.svelte', '.rb', '.php', '.swift', '.kt',
])

// ─────────────────────────────────────────────
// 輔助函式
// ─────────────────────────────────────────────

/** 檔案大小格式化（對應原版 format_size） */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/** 取得副檔名（小寫） */
function getExt(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot !== -1 ? name.slice(dot).toLowerCase() : ''
}

// ─────────────────────────────────────────────
// 排序與智慧折疊（DD-022 + DD-025）
// ─────────────────────────────────────────────

/**
 * 對 children 進行排序與選擇性折疊
 * 對應原版 truncate_and_sort_children()
 *
 * 折疊邏輯：
 * - 同目錄下，相同副檔名的非白名單檔案 > 3 個 → 顯示前 3 個 + 虛擬省略節點
 * - 白名單副檔名永遠完整顯現
 * - enableTruncation = false 時跳過折疊，純字母排序
 */
export function sortAndTruncateChildren(
  children: TreeNodeData[],
  enableTruncation: boolean = true
): TreeNodeData[] {
  const dirs = children.filter(c => c.is_dir)
  const files = children.filter(c => !c.is_dir)

  const sortedDirs = [...dirs].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

  if (!enableTruncation) {
    return sortedDirs.concat(
      [...files].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    )
  }

  // 依副檔名分組
  const extGroups = new Map<string, TreeNodeData[]>()
  for (const f of files) {
    const ext = getExt(f.name)
    if (!extGroups.has(ext)) extGroups.set(ext, [])
    extGroups.get(ext)!.push(f)
  }

  const finalFiles: TreeNodeData[] = []
  const sortedExts = [...extGroups.keys()].sort()

  for (const ext of sortedExts) {
    const group = [...extGroups.get(ext)!].sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    )

    if (group.length > 3 && !EXEMPT_EXTENSIONS.has(ext)) {
      // 顯示前 3 個，補虛擬省略節點
      finalFiles.push(...group.slice(0, 3))
      const label = `... (還有 ${group.length - 3} 個 ${ext || '無副檔名'} 檔案)`
      finalFiles.push({
        name: label,
        is_dir: false,
        relative_path: `__truncated__${ext}`,
        size: 0,
        is_enabled: true,
        children: [],
      })
    } else {
      finalFiles.push(...group)
    }
  }

  return sortedDirs.concat(finalFiles)
}

// ─────────────────────────────────────────────
// 主渲染引擎
// ─────────────────────────────────────────────

export interface RenderOptions {
  mode: 'basic' | 'full'
  enableTruncation: boolean
}

/**
 * 將 TreeNodeData 渲染為 ASCII 樹狀字串
 * 對應原版 render_from_schema()
 */
export function renderTree(
  node: TreeNodeData,
  options: RenderOptions,
  prefix: string = '',
  isRoot: boolean = true
): string {
  if (!node.is_enabled) return ''

  const lines: string[] = []

  if (isRoot) {
    const suffix = options.mode === 'full' ? ' [Root]' : ''
    lines.push(`${node.name}${suffix}/`)
  }

  // 只渲染啟用的子節點
  const activeChildren = node.children.filter(c => c.is_enabled)
  const processed = sortAndTruncateChildren(activeChildren, options.enableTruncation)

  for (let i = 0; i < processed.length; i++) {
    const child = processed[i]
    const isLast = i === processed.length - 1
    const connector = isLast ? '└── ' : '├── '

    let displayName: string
    if (child.is_dir) {
      displayName = `${child.name}/`
      if (options.mode === 'full' && child.relative_path) {
        displayName += ` [Path: ${child.relative_path}]`
      }
    } else if (child.name.startsWith('...')) {
      // 虛擬省略節點，不附加大小
      displayName = child.name
    } else {
      displayName = child.name
      if (options.mode === 'full' && child.size > 0) {
        displayName += ` (${formatSize(child.size)})`
      }
    }

    lines.push(`${prefix}${connector}${displayName}`)

    if (child.is_dir) {
      const childPrefix = prefix + (isLast ? '    ' : '│   ')
      const childResult = renderTree(child, options, childPrefix, false)
      if (childResult) lines.push(childResult)
    }
  }

  return lines.join('\n')
}
