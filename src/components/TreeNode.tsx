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
  const textClass = node.is_enabled ? 'text-slate-700' : 'text-slate-400 line-through'

  const hasChildren = node.is_dir && node.children && node.children.length > 0

  return (
    <div className="font-mono text-sm">
      <div
        className={`group flex items-center py-1.5 px-2 hover:bg-indigo-50/50 rounded-lg transition-all cursor-default ${opacityClass}`}
      >
        {/* 展開 / 收合箭頭（僅資料夾顯示） */}
        <div className="w-5 flex items-center justify-center">
          {node.is_dir && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-indigo-600 transition-transform duration-200"
              style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
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
          className="mx-2 w-4 h-4 accent-indigo-600 cursor-pointer rounded"
        />

        {/* 圖示與名稱 */}
        <div className={`flex items-center gap-2 truncate ${textClass}`}>
          <span className="text-lg">{node.is_dir ? '📁' : '📄'}</span>
          <span className="font-medium">{node.name}</span>
          {!node.is_dir && node.size > 0 && (
            <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              ({(node.size / 1024).toFixed(1)} KB)
            </span>
          )}
        </div>
      </div>

      {/* 遞迴子節點（左側連動線） */}
      {hasChildren && isOpen && (
        <div className="ml-[21px] border-l-2 border-slate-100 pl-2">
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
