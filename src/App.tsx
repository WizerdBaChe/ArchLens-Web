/**
 * App.tsx
 * 放置路徑：src/App.tsx
 *
 * 唯一職責：
 *  1. 跑 useProjectTree() 取得所有狀態
 *  2. 渲染 BlueprintTheme（系列統一的 Blueprint 介面）
 *
 * 系列已收斂為單一 Blueprint 風格（色票來自 @archlens/tokens 的 .al-theme-blueprint，
 * 靜態掛在 <html>）。舊的 Light / Hacker 雙主題與切換已移至 _archive/（保留於磁碟、
 * 不進 repo），故此處不再有 ThemeProvider / 主題切換。
 */

import './App.css'
import { useProjectTree, isFolderPickerSupported } from './hooks/useProjectTree'
import { BlueprintTheme } from './BlueprintTheme'

function App() {
  const folderSupported = isFolderPickerSupported()

  const {
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
  } = useProjectTree()

  return (
    <BlueprintTheme
      rootNode={rootNode}
      asciiResult={asciiResult}
      isLoading={isLoading}
      error={error}
      inputSource={inputSource}
      mode={mode}
      enableTruncation={enableTruncation}
      setMode={setMode}
      setEnableTruncation={setEnableTruncation}
      handleFolderPick={handleFolderPick}
      handleZipUpload={handleZipUpload}
      handleToggle={handleToggle}
      handleClear={handleClear}
      folderSupported={folderSupported}
    />
  )
}

export default App
