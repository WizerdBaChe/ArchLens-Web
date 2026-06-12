/**
 * useProjectTree.ts
 * 統一管理掃描、節點狀態、預覽渲染的核心 Hook
 * 取代原版 App.tsx 中分散的 useState + useEffect + API 呼叫
 */

import { useState, useMemo, useCallback } from 'react'
import type { TreeNodeData, InputSource } from '../types'
import { scanDirectory, scanZip } from '../services/scanner'
import { renderTree } from '../services/formatter'

export function useProjectTree() {
  const [rootNode, setRootNode] = useState<TreeNodeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputSource, setInputSource] = useState<InputSource>(null)
  const [mode, setMode] = useState<'basic' | 'full'>('basic')
  const [enableTruncation, setEnableTruncation] = useState(true)

  // ── 即時 ASCII 渲染（useMemo 同步計算，取代原版 useEffect + API 呼叫）
  const asciiResult = useMemo(() => {
    if (!rootNode) return ''
    return renderTree(rootNode, { mode, enableTruncation })
  }, [rootNode, mode, enableTruncation])

  // ── 選取資料夾（File System Access API）
  const handleFolderPick = useCallback(async () => {
    setError(null)
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'read' })
      setIsLoading(true)
      const tree = await scanDirectory(dirHandle)
      setRootNode(tree)
      setInputSource({ type: 'folder', name: dirHandle.name })
    } catch (e) {
      // 使用者取消選取視為正常操作，不顯示錯誤
      if (e instanceof DOMException && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : '資料夾讀取失敗')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── 上傳 ZIP
  const handleZipUpload = useCallback(async (file: File) => {
    setError(null)
    setIsLoading(true)
    try {
      const tree = await scanZip(file)
      setRootNode(tree)
      setInputSource({ type: 'zip', name: file.name })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ZIP 解析失敗')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── 遞迴切換節點狀態（DD-014 / DD-020）
  // 切換目標節點及其所有子孫節點
  const toggleNodeState = useCallback(
    (node: TreeNodeData, targetRelPath: string, newStatus: boolean): TreeNodeData => {
      const setAllChildren = (n: TreeNodeData, status: boolean): TreeNodeData => ({
        ...n,
        is_enabled: status,
        children: n.children.map(c => setAllChildren(c, status)),
      })

      if (node.relative_path === targetRelPath) {
        return setAllChildren(node, newStatus)
      }

      return {
        ...node,
        children: node.children.map(child =>
          toggleNodeState(child, targetRelPath, newStatus)
        ),
      }
    },
    []
  )

  const handleToggle = useCallback(
    (relPath: string, newStatus: boolean) => {
      setRootNode(prev =>
        prev ? toggleNodeState(prev, relPath, newStatus) : null
      )
    },
    [toggleNodeState]
  )

  // ── 清除目前專案
  const handleClear = useCallback(() => {
    setRootNode(null)
    setInputSource(null)
    setError(null)
  }, [])

  return {
    rootNode,
    asciiResult,
    isLoading,
    error,
    inputSource,
    mode,
    enableTruncation,
    setMode,
    setEnableTruncation,
    handleFolderPick,
    handleZipUpload,
    handleToggle,
    handleClear,
  }
}

// ── 瀏覽器支援度偵測
export function isFolderPickerSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}
