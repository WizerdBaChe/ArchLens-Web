/**
 * handoff.ts
 * 把目前的結構樹「送到 ArchLens Diff 比較」——Phase 3 反孤島的報告 handoff。
 *
 * 機制：把 tree 信封寫進 localStorage，再開 Diff 並帶 ?handoff=tree。
 * 系列產品在正式部署時同源（都在 wizerdbache.github.io），因此共用 localStorage；
 * Diff 載入時讀取並注入到輸入端。本機開發跨 port 不同源時不會共享，Diff 會顯示
 * 「找不到交接資料」並請使用者改用手動匯入（優雅降級）。
 */

import type { TreeNodeData } from '../types'
import { buildTreeEnvelope } from './treeExport'

/** 與 Diff 端共用的 localStorage 鍵（兩邊都改時要一致）。 */
export const HANDOFF_KEY = 'archlens:handoff'

/**
 * Diff 的正式網址。對齊 suite-manifest.json 的 products[id=diff].url；
 * vendor 期暫時內嵌，hub 發佈後可改為讀 manifest。
 */
const DIFF_URL = 'https://wizerdbache.github.io/ArchLens-DiffTeller/'

export interface HandoffPayload {
  /** 要載入到 Diff 的哪一側。Web 匯出的是「目前結構」，預設放右側（新版）。 */
  side: 'left' | 'right'
  from: string
  at: number
  envelope: ReturnType<typeof buildTreeEnvelope>
}

/**
 * localStorage 交接的大小上限（字元數）。瀏覽器每來源約 5MB；系列產品共享同一
 * 來源，留餘裕避免排擠其他鍵或丟 quota 例外。超過就改走「下載 + 手動匯入」回退。
 */
const MAX_HANDOFF_CHARS = 4_000_000

export type SendToDiffResult = 'handoff' | 'download-fallback'

function trySetHandoff(value: string): boolean {
  try {
    localStorage.setItem(HANDOFF_KEY, value)
    return true
  } catch {
    return false
  }
}

function downloadJson(filename: string, json: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 把結構樹交接給 Diff。
 * - 一般：寫 localStorage + 開新分頁帶 ?handoff=tree（Diff 自動載入）。
 * - 樹過大或 localStorage 寫入失敗：改下載 JSON 檔，仍開 Diff —— Diff 會顯示
 *   「沒有可自動帶入的資料，請手動匯入」，使用者上傳剛下載的檔即可（受控降級）。
 * 回傳實際採用的模式，呼叫端可據此提示使用者。
 */
export function sendTreeToDiff(root: TreeNodeData): SendToDiffResult {
  const envelope = buildTreeEnvelope(root)
  const payloadStr = JSON.stringify({ side: 'right', from: 'web', at: Date.now(), envelope } as HandoffPayload)

  let mode: SendToDiffResult = 'handoff'
  if (payloadStr.length > MAX_HANDOFF_CHARS || !trySetHandoff(payloadStr)) {
    // 過大就不塞 localStorage（避免 quota 例外 / 排擠）；下載讓使用者手動匯入
    mode = 'download-fallback'
    const safeName = root.name ? root.name.replace(/[<>:"/\\|?*]+/g, '') : 'Project'
    downloadJson(`${safeName}_tree.json`, JSON.stringify(envelope, null, 2))
  }

  const url = new URL(DIFF_URL)
  url.searchParams.set('handoff', 'tree')
  window.open(url.toString(), '_blank', 'noopener')
  return mode
}
