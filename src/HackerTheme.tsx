/**
 * HackerTheme.tsx
 * 放置路徑：src/HackerTheme.tsx
 *
 * 開發者硬核風 UI（預設主題）
 *
 * 設計決策：
 *   Palette  #0D0D0D底 / #141414panel / #2A2A2A border / #C8C8C8body /
 *            #39FF6A accent(磷光綠，唯一顯色) / #1A3D25 accent-hover
 *   Type     JetBrains Mono (所有 label/output) + Inter (body，退後角色)
 *   Layout   IDE statusbar + toolbar + 雙欄分割，無 hero、無圓角卡片
 *   Signature ASCII 輸出加 phosphor glow，其他全 dead flat
 */

import { useRef, useState, useEffect } from 'react'
import type { TreeNodeData, InputSource } from './types'
import { useTheme } from './ThemeContext'
import { buildTreeEnvelopeJson } from './services/treeExport'
import { sendTreeToDiff } from './services/handoff'

// ─── 常數：inline style 物件避免 Tailwind arbitrary value 過多 ──────────
const C = {
  bgBase:    '#0D0D0D',
  bgPanel:   '#141414',
  bgSurface: '#1C1C1C',
  border:    '#2A2A2A',
  dim:       '#4A4A4A',
  body:      '#C8C8C8',
  hi:        '#EFEFEF',
  accent:    '#39FF6A',
  accentDim: '#1A3D25',
  danger:    '#ff6b6b',
} as const

// ─── HackerTreeNode ────────────────────────────────────────────────────────
interface HackerTreeNodeProps {
  node: TreeNodeData
  depth?: number
  onToggle: (path: string, status: boolean) => void
}

function HackerTreeNode({ node, depth = 0, onToggle }: HackerTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth === 0)
  const hasChildren = node.is_dir && node.children.length > 0
  const dimmed = !node.is_enabled

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 13 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 8 + depth * 16,
          paddingRight: 8,
          borderRadius: 3,
          opacity: dimmed ? 0.25 : 1,
          cursor: 'default',
          userSelect: 'none',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => {
          if (!dimmed) (e.currentTarget as HTMLDivElement).style.background = C.accentDim + '40'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.background = 'transparent'
        }}
      >
        {/* 展開箭頭 */}
        <span style={{ width: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {node.is_dir ? (
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{ color: C.dim, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
              onMouseLeave={e => (e.currentTarget.style.color = C.dim)}
            >
              {isOpen ? '▾' : '▸'}
            </button>
          ) : (
            <span style={{ color: C.border }}>·</span>
          )}
        </span>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={node.is_enabled}
          onChange={e => onToggle(node.relative_path, e.target.checked)}
          style={{ width: 12, height: 12, flexShrink: 0, cursor: 'pointer', accentColor: C.accent }}
        />

        {/* 類型圖示 */}
        <span style={{ flexShrink: 0, fontSize: 11, color: node.is_dir ? C.accent + '99' : C.dim }}>
          {node.is_dir ? '▤' : '▪'}
        </span>

        {/* 名稱 */}
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: dimmed ? C.border : node.is_dir ? C.hi : C.body,
          textDecoration: dimmed ? 'line-through' : 'none',
        }}>
          {node.name}{node.is_dir ? '/' : ''}
        </span>

        {/* 檔案大小（hover 顯示） */}
        {!node.is_dir && node.size > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 10, color: C.dim, flexShrink: 0 }}>
            {(node.size / 1024).toFixed(1)}k
          </span>
        )}
      </div>

      {/* 子節點 + 連接線 */}
      {hasChildren && isOpen && (
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0, width: 1,
            background: C.border,
            left: 16 + depth * 16,
          }} />
          {node.children.map((child, idx) => (
            <HackerTreeNode
              key={child.relative_path || `${node.relative_path}-${idx}`}
              node={child}
              depth={depth + 1}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── HackerOutput ──────────────────────────────────────────────────────────
interface HackerOutputProps {
  asciiText: string
  rootNodeName?: string
  rootNode?: TreeNodeData | null
}

function HackerOutput({ asciiText, rootNodeName, rootNode }: HackerOutputProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)

  const getSafeName = () => rootNodeName?.replace(/[<>:"/\\|?*]+/g, '') ?? 'Project'

  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
    setShowDropdown(false)
  }

  const exportTxt = () => {
    if (!asciiText) return
    triggerDownload(`${getSafeName()}_File_Structure.txt`, asciiText)
  }

  const exportMd = () => {
    if (!asciiText) return
    const name = getSafeName()
    triggerDownload(`${name}_File_Structure.md`, `# ${name} Structure\n\n\`\`\`text\n${asciiText}\n\`\`\`\n`)
  }

  // 匯出系列共用的 `tree` 信封 JSON（可直接被 ArchLens Diff 等姊妹產品匯入）
  const exportJson = () => {
    if (!rootNode) return
    triggerDownload(`${getSafeName()}_File_Structure.json`, buildTreeEnvelopeJson(rootNode))
  }

  // 報告 handoff：把目前結構送到 ArchLens Diff 比較（反孤島）
  const sendToDiff = () => {
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

  const btnBase: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    padding: '6px 12px',
    border: `1px solid ${C.border}`,
    background: 'transparent',
    color: C.dim,
    cursor: 'pointer',
    transition: 'all 0.1s',
    letterSpacing: '0.05em',
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.bgBase, border: `1px solid ${C.border}` }}>
      {/* 工具列 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: `1px solid ${C.border}`, background: C.bgPanel, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: asciiText ? C.accent : C.dim, display: 'inline-block', boxShadow: asciiText ? `0 0 6px ${C.accent}` : 'none' }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Output
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <button
            onClick={handleCopy}
            disabled={!asciiText}
            style={{ ...btnBase, opacity: asciiText ? 1 : 0.3 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.accent + '66'; (e.currentTarget as HTMLButtonElement).style.color = C.body }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.dim }}
          >
            {copied ? 'COPIED ✓' : 'COPY'}
          </button>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={!asciiText}
            style={{ ...btnBase, borderColor: C.accent + '44', color: C.accent + 'aa', opacity: asciiText ? 1 : 0.3 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.accentDim; (e.currentTarget as HTMLButtonElement).style.color = C.accent }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = C.accent + 'aa' }}
          >
            EXPORT ▾
          </button>
          {showDropdown && asciiText && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowDropdown(false)} />
              <div style={{ position: 'absolute', right: 0, top: 32, zIndex: 20, background: C.bgPanel, border: `1px solid ${C.border}`, minWidth: 160 }}>
                {[
                  { label: 'export .txt', fn: exportTxt },
                  { label: 'export .md', fn: exportMd },
                  ...(rootNode ? [{ label: 'export .json (tree)', fn: exportJson }] : []),
                  ...(rootNode ? [{ label: '↗ send to Diff', fn: sendToDiff }] : []),
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.fn}
                    style={{ ...btnBase, width: '100%', textAlign: 'left', borderWidth: 0, borderBottom: `1px solid ${C.border}`, display: 'block', color: C.body }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.accentDim; (e.currentTarget as HTMLButtonElement).style.color = C.accent }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = C.body }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ASCII 輸出 — phosphor glow 是唯一特效 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
        <pre style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 13,
          lineHeight: 1.65,
          whiteSpace: 'pre',
          margin: 0,
          ...(asciiText ? {
            color: C.accent,
            textShadow: `0 0 8px ${C.accent}55, 0 0 2px ${C.accent}33`,
          } : {
            color: C.border,
          }),
        }}>
          {asciiText || '// waiting for input\n// open a folder or upload .zip to begin'}
        </pre>
      </div>
    </div>
  )
}

// ─── HackerTheme（主元件）─────────────────────────────────────────────────
interface HackerThemeProps {
  rootNode: TreeNodeData | null
  asciiResult: string
  isLoading: boolean
  error: string | null
  inputSource: InputSource
  mode: 'basic' | 'full'
  enableTruncation: boolean
  setMode: (m: 'basic' | 'full') => void
  setEnableTruncation: (v: boolean) => void
  handleFolderPick: () => Promise<void>
  handleZipUpload: (file: File) => Promise<void>
  handleToggle: (relPath: string, newStatus: boolean) => void
  handleClear: () => void
  folderSupported: boolean
}

export function HackerTheme({
  rootNode, asciiResult, isLoading, error, inputSource,
  mode, enableTruncation, setMode, setEnableTruncation,
  handleFolderPick, handleZipUpload, handleToggle, handleClear,
  folderSupported,
}: HackerThemeProps) {
  const { toggleTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Statusbar 打字機效果
  const [statusText, setStatusText] = useState('')
  const fullStatus = inputSource
    ? `archlens v1.0  ·  ${inputSource.type === 'folder' ? 'dir' : 'zip'}:${inputSource.name}  ·  ${rootNode ? 'READY' : 'SCANNING...'}`
    : 'archlens v1.0  ·  no source  ·  IDLE'

  useEffect(() => {
    let i = 0
    setStatusText('')
    const timer = setInterval(() => {
      i++
      setStatusText(fullStatus.slice(0, i))
      if (i >= fullStatus.length) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [fullStatus])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.zip')) handleZipUpload(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleZipUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const toolbarBtn: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 700,
    padding: '8px 16px',
    borderRight: `1px solid ${C.border}`,
    borderTop: 'none', borderLeft: 'none', borderBottom: 'none',
    background: 'transparent',
    color: C.body,
    cursor: 'pointer',
    letterSpacing: '0.04em',
    transition: 'all 0.1s',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.bgBase, color: C.body, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', borderBottom: `1px solid ${C.border}`, background: C.bgPanel, flexShrink: 0 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.03em' }}>
          {statusText}<span style={{ animation: 'blink 1s step-end infinite' }}>▋</span>
        </span>
        <button
          onClick={toggleTheme}
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: '4px 10px', border: `1px solid ${C.border}`, background: 'transparent', color: C.dim, cursor: 'pointer', letterSpacing: '0.08em', transition: 'all 0.1s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.dim; (e.currentTarget as HTMLButtonElement).style.color = C.body }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = C.dim }}
          title="切換至原版設計"
        >
          ◫ DEFAULT
        </button>
      </div>

      {/* ── Toolbar */}
      <div
        style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.border}`, background: C.bgPanel, flexShrink: 0 }}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {/* OPEN FOLDER */}
        {folderSupported ? (
          <button
            onClick={handleFolderPick}
            disabled={isLoading}
            style={{ ...toolbarBtn, opacity: isLoading ? 0.4 : 1 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.accentDim; (e.currentTarget as HTMLButtonElement).style.color = C.accent }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = C.body }}
          >
            ▤ OPEN FOLDER
          </button>
        ) : (
          <span style={{ ...toolbarBtn, color: C.dim, cursor: 'default' }}>⚠ FOLDER_UNSUPPORTED</span>
        )}

        {/* OPEN ZIP */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          style={{ ...toolbarBtn, opacity: isLoading ? 0.4 : 1 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.accentDim; (e.currentTarget as HTMLButtonElement).style.color = C.accent }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = C.body }}
        >
          ◫ OPEN ZIP
        </button>

        <input ref={fileInputRef} type="file" accept=".zip" onChange={handleFileInput} style={{ display: 'none' }} />

        {/* 拖放提示 */}
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: '8px 16px', color: isDragOver ? C.accent : C.border, transition: 'color 0.1s', letterSpacing: '0.04em' }}>
          {isDragOver ? '▶ DROP TO LOAD' : '// drag .zip here'}
        </span>

        {/* 右側控制 */}
        <div style={{ marginLeft: 'auto', display: 'flex' }}>
          {/* BASIC / FULL */}
          {(['basic', 'full'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                ...toolbarBtn,
                borderRight: 'none',
                borderLeft: `1px solid ${C.border}`,
                background: mode === m ? C.accentDim : 'transparent',
                color: mode === m ? C.accent : C.dim,
              }}
            >
              {m.toUpperCase()}
            </button>
          ))}

          {/* FOLD */}
          <button
            onClick={() => setEnableTruncation(!enableTruncation)}
            title="智慧折疊：略過同副檔名非重要檔案"
            style={{
              ...toolbarBtn,
              borderRight: 'none',
              borderLeft: `1px solid ${C.border}`,
              background: enableTruncation ? C.accentDim : 'transparent',
              color: enableTruncation ? C.accent : C.dim,
            }}
          >
            {enableTruncation ? 'FOLD:ON' : 'FOLD:OFF'}
          </button>

          {/* CLEAR */}
          {rootNode && (
            <button
              onClick={handleClear}
              style={{ ...toolbarBtn, borderLeft: `1px solid ${C.border}`, borderRight: 'none', color: C.dim }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = C.danger}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = C.dim}
            >
              ✕ CLEAR
            </button>
          )}
        </div>
      </div>

      {/* ── 主工作區（IDE 雙欄） */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, height: 'calc(100vh - 72px)' }}>

        {/* 左 Panel：File Tree */}
        <div style={{ width: 340, minWidth: 200, borderRight: `1px solid ${C.border}`, background: C.bgPanel, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Panel 標題 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.dim }}>
              File Tree
            </span>
            {rootNode && (
              <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.accent, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rootNode.name}/
              </span>
            )}
          </div>

          {/* 樹狀內容 */}
          <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8, paddingBottom: 8 }}>
            {isLoading ? (
              <div style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.accent }}>
                scanning...
              </div>
            ) : error ? (
              <div style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.danger }}>
                ERR: {error}
              </div>
            ) : rootNode ? (
              <HackerTreeNode node={rootNode} onToggle={handleToggle} />
            ) : (
              <div style={{ padding: '16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.border, lineHeight: 1.8 }}>
                {'// no project loaded\n// open folder or zip'.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右 Panel：Output */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <HackerOutput asciiText={asciiResult} rootNodeName={rootNode?.name} rootNode={rootNode} />
        </div>
      </div>

      {/* 閃爍游標 keyframe */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  )
}
