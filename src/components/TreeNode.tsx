/**
 * TreeNode.tsx
 * 互動式樹狀節點元件
 * 從原版移植，邏輯完全不變（DD-014 半透明剪枝無視圖）
 */

import { useState } from 'react'
import type { TreeNodeData } from '../types'

interface TreeNodeProps {
  node: TreeNodeData
  depth?: number
  onToggle: (targetPath: string, newStatus: boolean) => void
}

export const TreeNode: React.FC<TreeNodeProps> = ({ node, depth = 0, onToggle }) => {
  // 預設僅根目錄（depth 0）展開
  const [isOpen, setIsOpen] = useState(depth === 0)

  // DD-014：半透明剪枝無視圖
  const opacityClass = node.is_enabled ? 'opacity-100' : 'opacity-30 grayscale'

  const hasChildren = node.is_dir && node.children && node.children.length > 0

  return (
    <div className="font-mono text-sm">
      <div
        className={`group flex items-center py-1.5 px-2 rounded-lg transition-all cursor-default ${opacityClass}`}
        style={{ '--hover-bg': 'var(--al-surface-raised)' } as React.CSSProperties}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--al-surface-raised)')}
        onMouseLeave={e => (e.currentTarget.style.background = '')}
      >
        {/* 展開 / 收合箭頭（僅資料夾顯示） */}
        <div className="w-5 flex items-center justify-center">
          {node.is_dir && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer transition-all duration-200 hover:-translate-y-px active:translate-y-0"
              style={{
                color: 'var(--al-text-tertiary)',
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--al-accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--al-text-tertiary)')}
            >
              ▶
            </button>
          )}
        </div>

        {/* 核取方塊 */}
        <input
          type="checkbox"
          checked={node.is_enabled}
          onChange={e => onToggle(node.relative_path, e.target.checked)}
          className="mx-2 w-4 h-4 cursor-pointer rounded"
          style={{ accentColor: 'var(--al-accent)' }}
        />

        {/* 圖示與名稱 */}
        <div
          className="flex items-center gap-2 truncate"
          style={{ color: node.is_enabled ? 'var(--al-text)' : 'var(--al-text-tertiary)', textDecoration: node.is_enabled ? 'none' : 'line-through' }}
        >
          <span className="text-lg">{node.is_dir ? '📁' : '📄'}</span>
          <span className="font-medium">{node.name}</span>
          {!node.is_dir && node.size > 0 && (
            <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--al-text-tertiary)' }}>
              ({(node.size / 1024).toFixed(1)} KB)
            </span>
          )}
        </div>
      </div>

      {/* 遞迴子節點（左側連動線） */}
      {hasChildren && isOpen && (
        <div className="ml-[21px] pl-2" style={{ borderLeft: '2px solid var(--al-border)' }}>
          {node.children.map((child, idx) => (
            <TreeNode
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
