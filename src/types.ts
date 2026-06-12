/**
 * 核心資料模型 — 對應原版 schemas.py NodeSchema
 * 移除後端 Pydantic 依賴，改為純前端型別定義
 */
export interface TreeNodeData {
  name: string;             // 檔案或資料夾名稱
  is_dir: boolean;          // 是否為目錄
  relative_path: string;    // 相對根目錄的路徑（全域唯一 Key）
  size: number;             // 檔案大小（Bytes）；資料夾為 0
  is_enabled: boolean;      // 控制節點是否參與最終 ASCII 渲染
  children: TreeNodeData[]; // 遞迴子節點
}

/** 輸入來源類型 */
export type InputSource =
  | { type: 'folder'; name: string }
  | { type: 'zip'; name: string }
  | null;
