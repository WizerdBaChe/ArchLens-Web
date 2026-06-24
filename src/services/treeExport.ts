/**
 * treeExport.ts
 * 把掃描出的 TreeNodeData 攤平成 ArchLens 系列共用的 `tree` 信封 JSON。
 *
 * 這是 ArchLens-Web 作為系列裡 `tree` 產生者的匯出端（Layer B）：
 * 輸出可直接被 DiffTeller / DependencyTeller / DocsGapTeller 消費。
 */

import type { TreeNodeData } from '../types'
import { wrapTree, type TreeNode, type TreeEnvelope } from './archlensSchema'

/**
 * 深度優先攤平成節點清單。
 * - 跳過 root 自身（其 relative_path 為空字串，只是容器）。
 * - 只輸出 is_enabled 的節點；停用的目錄連同子樹一併略過（對齊 ASCII 匯出行為）。
 * - relative_path 已是 forward-slash、相對根目錄、無前後斜線，正好符合系列 tree 契約。
 */
export function flattenToTreeNodes(root: TreeNodeData): TreeNode[] {
  const nodes: TreeNode[] = []

  const walk = (node: TreeNodeData) => {
    for (const child of node.children) {
      if (!child.is_enabled) continue
      nodes.push({
        path: child.relative_path,
        type: child.is_dir ? 'dir' : 'file',
      })
      if (child.is_dir) walk(child)
    }
  }

  walk(root)
  return nodes
}

/** 建出 `tree` 信封物件（供下載字串與 handoff 共用）。 */
export function buildTreeEnvelope(root: TreeNodeData): TreeEnvelope {
  return wrapTree(
    flattenToTreeNodes(root),
    {
      product: 'web',
      name: root.name,
      generatedAt: new Date().toISOString(),
    },
    root.name,
  )
}

/** 產生可下載的 `tree` 信封 JSON 字串（已縮排）。 */
export function buildTreeEnvelopeJson(root: TreeNodeData): string {
  return JSON.stringify(buildTreeEnvelope(root), null, 2)
}
