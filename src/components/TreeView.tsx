/**
 * TreeView.tsx
 * ASCII 預覽區與匯出功能
 * 從原版移植，移除 isLoading（改為同步渲染，永遠不 loading）
 * 匯出邏輯完整保留（DD-026 純前端 Blob 匯出）
 */

import { useState } from 'react'
import type { TreeNodeData } from '../types'
import { buildTreeEnvelopeJson } from '../services/treeExport'
import { sendTreeToDiff } from '../services/handoff'
import { useLocale } from '../i18n'

interface TreeViewProps {
  asciiText: string
  rootNodeName?: string
  rootNode?: TreeNodeData | null
}

export const TreeView: React.FC<TreeViewProps> = ({ asciiText, rootNodeName, rootNode }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const { t } = useLocale()

  // DD-026：動態檔名生成器（過濾 OS 非法字元）
  const getDynamicFilename = (extension: string): string => {
    const safeName = rootNodeName
      ? rootNodeName.replace(/[<>:"/\\|?*]+/g, '')
      : 'Project'
    return `${safeName}_File_Structure.${extension}`
  }

  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    setShowDropdown(false)
  }

  const exportAsTxt = () => {
    if (!asciiText) return
    triggerDownload(getDynamicFilename('txt'), asciiText)
  }

  const exportAsMd = () => {
    if (!asciiText) return
    const title = rootNodeName
      ? rootNodeName.replace(/[<>:"/\\|?*]+/g, '')
      : 'Project'
    const markdownContent = `# ${title} Structure\n\n\`\`\`text\n${asciiText}\n\`\`\`\n`
    triggerDownload(getDynamicFilename('md'), markdownContent)
  }

  // 匯出系列共用的 `tree` 信封 JSON（可直接被 ArchLens Diff 等姊妹產品匯入）
  const exportAsJson = () => {
    if (!rootNode) return
    triggerDownload(getDynamicFilename('json'), buildTreeEnvelopeJson(rootNode))
  }

  // 報告 handoff：把目前結構送到 ArchLens Diff 比較（反孤島）
  const handleSendToDiff = () => {
    if (!rootNode) return
    sendTreeToDiff(rootNode)
    setShowDropdown(false)
  }

  const handleCopy = async () => {
    if (!asciiText) return
    await navigator.clipboard.writeText(asciiText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="h-full flex flex-col overflow-hidden shadow-2xl"
      style={{
        background: 'var(--al-surface)',
        border: '1px solid var(--al-border)',
        borderRadius: '1rem',
      }}
    >
      {/* 頂部工具列 */}
      <div
        className="px-6 py-3.5 flex justify-between items-center"
        style={{
          background: 'var(--al-surface)',
          borderBottom: '1px solid var(--al-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--al-success)' }} />
          <span
            className="font-mono text-xs uppercase tracking-wider font-bold"
            style={{ color: 'var(--al-text-secondary)' }}
          >
            ASCII Preview
          </span>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* 複製按鈕 */}
          <button
            onClick={handleCopy}
            disabled={!asciiText}
            className="text-xs font-semibold px-4 py-2 rounded-xl border cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-md active:translate-y-0"
            style={{
              background: 'var(--al-surface-raised)',
              border: '1px solid var(--al-border)',
              color: 'var(--al-text-secondary)',
            }}
          >
            {copied ? t.copied : t.copyText}
          </button>

          {/* 匯出下拉 */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={!asciiText}
            className="text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-md active:translate-y-0"
            style={{
              background: 'var(--al-accent)',
              color: 'var(--al-accent-contrast)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {t.exportFile}
          </button>

          {showDropdown && asciiText && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div
                className="absolute right-0 top-10 w-52 rounded-xl shadow-xl z-20 overflow-hidden py-1"
                style={{
                  background: 'var(--al-surface-raised)',
                  border: '1px solid var(--al-border)',
                }}
              >
                <button
                  onClick={exportAsTxt}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer"
                  style={{ color: 'var(--al-text-secondary)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--al-surface-sunken)'
                    e.currentTarget.style.color = 'var(--al-text)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = ''
                    e.currentTarget.style.color = 'var(--al-text-secondary)'
                  }}
                >
                  {t.exportTxt}
                </button>
                <button
                  onClick={exportAsMd}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer"
                  style={{
                    color: 'var(--al-text-secondary)',
                    borderTop: '1px solid var(--al-border)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--al-surface-sunken)'
                    e.currentTarget.style.color = 'var(--al-text)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = ''
                    e.currentTarget.style.color = 'var(--al-text-secondary)'
                  }}
                >
                  {t.exportMd}
                </button>
                {rootNode && (
                  <button
                    onClick={exportAsJson}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer"
                    style={{
                      color: 'var(--al-text-secondary)',
                      borderTop: '1px solid var(--al-border)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--al-surface-sunken)'
                      e.currentTarget.style.color = 'var(--al-text)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = ''
                      e.currentTarget.style.color = 'var(--al-text-secondary)'
                    }}
                  >
                    {t.exportJson}
                  </button>
                )}
                {rootNode && (
                  <button
                    onClick={handleSendToDiff}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
                    style={{
                      color: 'var(--al-accent)',
                      borderTop: '1px solid var(--al-border)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--al-surface-sunken)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = ''
                    }}
                  >
                    {t.sendToDiff}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 預覽區 */}
      <div
        className="p-6 overflow-auto flex-1 scrollbar-thin"
        style={{ background: 'var(--al-surface-sunken)' }}
      >
        <pre
          className="font-mono text-sm leading-relaxed whitespace-pre font-normal tracking-wide"
          style={{ color: 'var(--al-accent)' }}
        >
          {asciiText || (
            <span className="italic font-light" style={{ color: 'var(--al-text-tertiary)' }}>
              {t.asciiPreviewPlaceholder}
            </span>
          )}
        </pre>
      </div>
    </div>
  )
}
