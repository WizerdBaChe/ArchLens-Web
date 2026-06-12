/**
 * scanner.ts
 * 資料夾與 ZIP 解析引擎
 * 對應原版 scanner.py 的 scan_directory() + scan_zip()
 * 改為使用 File System Access API 與 JSZip
 */

import JSZip from 'jszip'
import type { TreeNodeData } from '../types'
import {
  DEFAULT_IGNORE_PATTERNS,
  parseGitignoreContent,
  shouldIgnore,
} from './ignoreRules'

// ─────────────────────────────────────────────
// 資料夾掃描（File System Access API）
// ─────────────────────────────────────────────

/**
 * 掃描使用者選取的資料夾
 * 對應原版 scan_directory()
 */
export async function scanDirectory(
  dirHandle: FileSystemDirectoryHandle,
  ignorePatterns: string[] = [...DEFAULT_IGNORE_PATTERNS],
  relativePath: string = ''
): Promise<TreeNodeData> {
  // 讀取當前目錄的 .gitignore（對應原版 DD-021 動態局部疊加）
  const localPatterns = [...ignorePatterns]
  try {
    const gitignoreHandle = await dirHandle.getFileHandle('.gitignore')
    const gitignoreFile = await gitignoreHandle.getFile()
    const content = await gitignoreFile.text()
    localPatterns.push(...parseGitignoreContent(content))
  } catch {
    // .gitignore 不存在，使用上層規則即可
  }

  const node: TreeNodeData = {
    name: dirHandle.name,
    is_dir: true,
    relative_path: relativePath,
    size: 0,
    is_enabled: true,
    children: [],
  }

  for await (const [name, handle] of dirHandle.entries()) {
    if (shouldIgnore(name, localPatterns)) continue

    const childPath = relativePath === '' ? name : `${relativePath}/${name}`

    if (handle.kind === 'directory') {
      const childDir = handle as FileSystemDirectoryHandle
      const childNode = await scanDirectory(childDir, localPatterns, childPath)
      node.children.push(childNode)
    } else {
      const fileHandle = handle as FileSystemFileHandle
      let size = 0
      try {
        const file = await fileHandle.getFile()
        size = file.size
      } catch {
        // 無法讀取大小，保持 0
      }
      node.children.push({
        name,
        is_dir: false,
        relative_path: childPath,
        size,
        is_enabled: true,
        children: [],
      })
    }
  }

  return node
}

// ─────────────────────────────────────────────
// ZIP 解析（JSZip）
// ─────────────────────────────────────────────

/**
 * 解析上傳的 ZIP 檔案
 * 對應原版 scan_zip()
 */
export async function scanZip(
  file: File,
  ignorePatterns: string[] = [...DEFAULT_IGNORE_PATTERNS]
): Promise<TreeNodeData> {
  const zip = await JSZip.loadAsync(file)

  // 蒐集所有路徑並排序，確保父節點先建立
  const allPaths = Object.keys(zip.files).sort()

  // 偵測並移除共同根目錄前綴（ZIP 打包常帶一層外層資料夾）
  const rootPrefix = detectRootPrefix(allPaths)

  // ZIP 根節點名稱：優先使用壓縮包內的共同根目錄，否則取 ZIP 檔名
  const rootName = rootPrefix
    ? rootPrefix.replace(/\/$/, '')
    : file.name.replace(/\.zip$/i, '')

  const root: TreeNodeData = {
    name: rootName,
    is_dir: true,
    relative_path: '',
    size: 0,
    is_enabled: true,
    children: [],
  }

  // key: relative_path, value: TreeNodeData
  const nodesMap = new Map<string, TreeNodeData>()
  nodesMap.set('', root)

  for (const path of allPaths) {
    // 移除共同前綴
    const strippedPath = rootPrefix ? path.slice(rootPrefix.length) : path
    if (!strippedPath) continue

    // 逐路徑段落建立節點
    const parts = strippedPath.replace(/\/$/, '').split('/')
    if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) continue

    // 忽略規則：任一段命中則跳過
    if (parts.some(p => shouldIgnore(p, ignorePatterns))) continue

    let currentPath = ''
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const parentPath = currentPath
      currentPath = currentPath === '' ? part : `${currentPath}/${part}`

      if (nodesMap.has(currentPath)) continue

      const isLastPart = i === parts.length - 1
      const zipEntry = zip.files[rootPrefix + currentPath + (isLastPart && zip.files[rootPrefix + currentPath + '/'] ? '/' : '')]
      const isDir = isLastPart
        ? (zip.files[rootPrefix + currentPath + '/'] !== undefined || (zipEntry?.dir ?? false))
        : true

      let size = 0
      if (!isDir && isLastPart) {
        const zipFile = zip.files[rootPrefix + currentPath]
        if (zipFile && !zipFile.dir) {
          // _data.uncompressedSize 是 JSZip 內部屬性，用 type assertion 存取
          size = (zipFile as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0
        }
      }

      const newNode: TreeNodeData = {
        name: part,
        is_dir: isDir,
        relative_path: currentPath,
        size,
        is_enabled: true,
        children: [],
      }

      nodesMap.set(currentPath, newNode)

      const parentNode = nodesMap.get(parentPath)
      if (parentNode) {
        parentNode.children.push(newNode)
      }
    }
  }

  return root
}

/**
 * 偵測 ZIP 內的共同根目錄前綴
 * 例如 ['project/', 'project/src/', 'project/src/main.ts'] → 'project/'
 */
function detectRootPrefix(paths: string[]): string {
  if (paths.length === 0) return ''

  // 找出所有第一層目錄
  const topLevelDirs = new Set<string>()
  for (const p of paths) {
    const slash = p.indexOf('/')
    if (slash !== -1) {
      topLevelDirs.add(p.slice(0, slash + 1))
    }
  }

  // 若只有一個頂層目錄，且所有路徑都以它開頭，則視為共同前綴
  if (topLevelDirs.size === 1) {
    const prefix = [...topLevelDirs][0]
    if (paths.every(p => p.startsWith(prefix) || p === prefix.slice(0, -1))) {
      return prefix
    }
  }

  return ''
}
