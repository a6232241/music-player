# Expo & React Native 專案審查報告

本文件概述了針對專案的 CNG（持續原生生成）配置、原生相容性、環境變數以及程式碼邏輯進行全面審查後的發現。

## 🚨 嚴重問題與風險

### 1. 前沿版本 / 不穩定版本不匹配 (高嚴重性) ⏳ **未修復**
**受影響檔案：** `package.json`, `app.json`
**說明：**
專案配置了 `react-native` 版本 `0.79.6`、`react` `19.0.0` 以及 `expo` `~53.0.24`。
- **風險：** 請確認標準的 Expo SDK 版本。SDK 52（目前穩定版）使用的是 React Native 0.76。React Native 0.79 可能是開發版（Nightly）或尚未正式發佈的穩定版。使用非標準的版本組合會破壞 `npx expo install` 的相容性檢查，並可能因原生模組 API 不匹配而導致建置失敗（特別是在 iOS/Android 上）。
- **CNG 修復建議：**
    - 除非您是有意測試最前沿的功能，否則請**降級至最新的穩定版 Expo SDK 52**。
    - 執行 `npx expo install --fix` 以對齊所有依賴項。
    - 若必須使用 SDK 53 (Beta)，請確保所有第三方函式庫均支援 React 19 與新架構 (New Architecture)。

### 2. 啟用新架構但可能存在不相容性 (中等嚴重性) ⏳ **未修復**
**受影響檔案：** `app.json`
**說明：**
在 `app.json` 中設置了 `"newArchEnabled": true`。
- **風險：** 雖然新架構（Bridgeless/TurboModules）是未來的趨勢，但函式庫的廣泛支援仍在進行中。同時啟用多個函式庫（其中部分可能是舊版）可能會導致原生建置在啟動時立即崩潰。
- **CNG 修復建議：**
    - 如果遇到原生環境崩潰，請在 `app.json` 中設置 `"newArchEnabled": false` 並重新建置 (`npx expo run:ios`)。
    - 驗證 `expo-audio`、`expo-sqlite`（最新版本）是否支援新架構（它們通常支援），但第三方函式庫可能尚未支援。

### 3. 未使用或配置錯誤的環境變數 (中等嚴重性) ⏳ **未修復**
**受影響檔案：** `.env`, 原始碼
**說明：**
`.env` 檔案定義了 `EXPO_PUBLIC_GOOGLE_OAUTH_*` 變數，但掃描 `app/`、`components/` 和 `utils/` 目錄後發現這些變數**完全未被使用**（在主要邏輯中未找到 `GOOGLE` 或 `process.env` 的引用）。
- **風險：** 如果預期要使用身分驗證，目前可能已損壞或缺失。如果這些金鑰是供某個函式庫透過 `app.config.js` (extra) 使用，它們將無法被傳遞，因為 `app.json` 是靜態的 (JSON)，無法讀取 `.env`。
- **CNG 修復建議：**
    - 如果建置時配置需要這些變數，請將 `app.json` 轉換為 `app.config.ts` 或 `app.config.js` 以讀取 `process.env`。
    - 範例：
      ```javascript
      // app.config.js
      export default {
        expo: {
          extra: {
            googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID,
          },
          // ... 其他配置
        }
      }
      ```

---

## 🛠 程式碼邏輯與最佳實踐

### 4. `TagMultiSelect.tsx` 中的 `useEffect` 非同步處理 (低嚴重性) ⏳ **未修復**
**受影響檔案：** `components/TagMultiSelect.tsx`
**說明：**
`useEffect`（第 18-28 行）定義了一個非同步的 IIFE 來獲取數據。
- **問題：** 它沒有處理組件卸載（Unmounting）的情況。如果組件在 `setTagGenres` 被調用前卸載，React 會記錄警告（記憶體洩漏警告）。
- **修復建議：** 使用布林標記 `isMounted` 或 `AbortController`（若 API 支援）來防止在卸載後更新狀態。

### 5. 範例程式碼中的 TypeScript 錯誤 (低嚴重性) ⏳ **未修復**
**受影響檔案：** `app-example/`
**說明：**
`app-example/` 包含 34 個 TypeScript 錯誤（例如：`theme` 被隱式視為 `any`）。
- **建議：** 雖然這顯然是範例資料夾，但這些錯誤會污染 `tsc` 的輸出，導致難以發現 `app/` 中的真實錯誤。請在 `tsconfig.json` 中添加 `"exclude": ["**/app-example/**"]` 或刪除該資料夾。

### 6. 配置中缺失音訊權限 (潛在 Bug) ⏳ **未修復**
**受影響檔案：** `app.json`
**說明：**
`expo-audio` 被用作插件。如果應用程式需要**錄製**音訊，iOS 的 `Info.plist` 需要嚴格的權限字串。
- **建議：**
    - 確認是否使用了錄音功能。如果是，請更新 `app.json`：
      ```json
      [
        "expo-audio",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
        }
      ]
      ```

---

## 📋 總結與行動方案

1.  **降級/對齊版本**：這是最關鍵的一步。確認使用 `expo` ~53 和 RN 0.79 是否為刻意為之。若非，請還原至 SDK 52。
2.  **清理環境變數**：確保 Google Auth 金鑰確實被使用，或透過 `app.config.js` 傳遞至原生配置。
3.  **修正配置**：如有必要，請添加相關權限。
4.  **重構**：修復 `TagMultiSelect.tsx` 中的 `useEffect` 模式。