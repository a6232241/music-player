# 🗺️ Product Roadmap

> **專案願景 (Vision)**  
> 打造一款極致輕量、離線優先且高度可自定義的個人音樂播放器。專注於提供流暢的無縫播放體驗、強大的媒體庫管理功能，以及可靠的數據備份機制，讓使用者能完全掌控自己的音樂資產。

---

## 🚀 功能規劃概覽

本路線圖列出了專案未來的開發重點，並針對各功能進行了技術複雜度與 Expo CNG (Continuous Native Generation) 影響的評估。

### 階段一：核心體驗優化 (Core Experience)

| 功能名稱 | 預期行為 | 優先權 | 開發難度 | 狀態 | 技術分析 (Expo CNG / Native) |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **背景播放**<br>(Background Playback) | App 進入背景或鎖定螢幕時，音樂仍持續播放，並支援控制中心操作。 | 🔥 高 | ⭐⭐ | ⏳ 未完成 | **需要變更原生配置**<br>需在 `app.json` 中配置 `ios.infoPlist.UIBackgroundModes` 為 `['audio']`。Android 需確保 Service 配置正確 (通常由 `expo-audio` 自動處理)。 |
| **無縫下載體驗**<br>(Smart Background Download) | 1. 播放當前歌曲時，自動預載下一首 (Pre-download)。<br>2. 支援 App 背景執行時繼續任務 (Background Fetch)。 | 🔥 高 | ⭐⭐⭐ | ⏳ 未完成 | **涉及原生模組**<br>使用 `expo-file-system` 的 `createDownloadResumable`。背景下載需配置 `UIBackgroundModes` (`fetch` 或 `processing`)，可能需要額外的 Config Plugin 設定。 |
| **循環播放模式**<br>(Loop Modes) | 支援「單曲循環」與「列表循環」的切換邏輯。 | 🟡 中 | ⭐ | ⏳ 未完成 | **純 JS 邏輯**<br>僅涉及狀態管理 (State Management)與播放隊列邏輯，不涉及原生變更。 |

### 階段二：個人化與管理 (Personalization & Management)

| 功能名稱 | 預期行為 | 優先權 | 開發難度 | 狀態 | 技術分析 (Expo CNG / Native) |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **自訂標籤系統**<br>(Custom Tags & Types) | 允許使用者增刪改音樂的類型標籤，並將其應用於歌曲管理。 | 🟡 中 | ⭐⭐ | ⏳ 未完成 | **純 JS/SQL 邏輯**<br>涉及 SQLite Schema 設計與 UI 互動，無需原生變更。 |
| **進階過濾器**<br>(Custom Filters) | 使用者可組合多種條件 (如：標籤 + 年代 + 類型) 來建立動態播放清單。 | 🟡 中 | ⭐⭐ | ⏳ 部分完成 | **純 JS/SQL 邏輯**<br>需設計靈活的 SQL Query 生成器。目前已支援多標籤過濾，但尚未支援年代、類型等進階條件組合。 |
| **定時停止播放**<br>(Sleep Timer) | 設定倒數計時器 (如 30 分鐘)，時間到自動暫停播放。 | 🟡 中 | ⭐ | ⏳ 未完成 | **低風險原生交互**<br>主要為 JS 計時器邏輯。若需在背景精確觸發，依賴原生 Audio Service 的暫停功能即可，通常無需額外原生權限。 |

### 階段三：雲端整合與數據安全 (Cloud & Data)

| 功能名稱 | 預期行為 | 優先權 | 開發難度 | 狀態 | 技術分析 (Expo CNG / Native) |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **SQLite 自動備份**<br>(Auto Backup) | 根據平台策略，定期將資料庫檔案匯出至文件目錄或外部儲存。 | 🔥 高 | ⭐⭐ | ⏳ 未完成 | **涉及檔案系統**<br>使用 `expo-file-system` 操作。Android 可能需注意 Scoped Storage 權限配置。 |
| **Google Drive 整合**<br>(Cloud Sync) | 1. 從雲端硬碟下載音樂檔案。<br>2. 將 SQLite 資料庫備份至雲端。 | 🟡 中 | ⭐⭐⭐⭐ | ⏳ 未完成 | **高度依賴原生配置**<br>1. 需配置 **Deep Linking** (`Scheme`) 用於 OAuth 回調。<br>2. 需引入 `expo-auth-session` 及相關 Config Plugin。<br>3. 涉及網路權限與 Google API Console 設定。 |

---

## 🛠️ 技術債與架構優化 (Technical Debt)

除了上述功能外，以下項目為持續進行的架構優化目標：

- [ ] **Database Migration System**: 建立更健壯的 SQLite 版本遷移機制 (解決 `BUGS.md` 中的遷移問題)。
- [ ] **Transaction Management**: 確保所有數據寫入操作皆具備原子性 (Atomicity)。
- [ ] **Type Safety**: 強化 API 回傳值的 TypeScript 定義。
- [ ] **Performance Tuning**: 優化大型列表的渲染效能 (FlashList) 與圖片快取策略。

---

> Last Updated: 2026-01-07
