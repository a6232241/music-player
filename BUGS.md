# 🐛 專案 Bug 與配置風險報告

> **掃描日期**: 2026-01-07  
> **掃描範圍**: `app.json`, `package.json`, `tsconfig.json`, `app/`, `components/`, `context/`, `utils/`, `constants/`

---

## Bug 清單

### 1. 🔴 Missing `await` in `postMusicTags` - 資料庫寫入可能遺失 ⏳ **未修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🔴 高 |
| **修復難易度** | ⭐ (1/5) |
| **類別** | 邏輯錯誤 |
| **位置** | [`utils/Apis/Sqlite/MusicTag/index.ts`](file:///Users/chestercai/Documents/side_project/music-player/utils/Apis/Sqlite/MusicTag/index.ts#L13-L16) |

**描述**:  
在 `postMusicTags` 方法中，`statement.executeAsync()` 是一個 Promise，但沒有使用 `await` 等待其完成。這會導致資料庫寫入操作可能在 `Promise.all` 結束前尚未完成，造成標籤關聯遺失。

**問題程式碼**:
```typescript
await Promise.all(
  req.tagIds.map(async (tagId) => {
    statement.executeAsync(req.musicId, tagId); // ❌ 缺少 await
  }),
);
```

**修復建議**:
```typescript
await Promise.all(
  req.tagIds.map(async (tagId) => {
    await statement.executeAsync(req.musicId, tagId); // ✅ 加上 await
  }),
);
// 同時在完成後呼叫 statement.finalizeAsync() 釋放資源
await statement.finalizeAsync();
```

---

### 2. 🔴 Hardcoded Localhost Origin - 生產環境無法連線 ⏳ **未修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🔴 高 |
| **修復難易度** | ⭐⭐ (2/5) |
| **類別** | 配置風險 |
| **位置** | [`utils/Apis/index.ts`](file:///Users/chestercai/Documents/side_project/music-player/utils/Apis/index.ts#L9) |

**描述**:  
API origin 硬編碼為 `http://localhost:3000`，在真機或生產環境中無法連線到後端伺服器。

**問題程式碼**:
```typescript
private origin: string = "http://localhost:3000";
```

**修復建議**:
1. 使用環境變數配置 origin：
```typescript
import Constants from 'expo-constants';

private origin: string = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";
```
2. 在 `app.json` 或 `app.config.js` 中配置 `extra.apiUrl`

---

### 3. 🟡 Database Initialization Error Not Propagated ⏳ **未修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🟡 中 |
| **修復難易度** | ⭐⭐ (2/5) |
| **類別** | 錯誤處理 |
| **位置** | [`utils/Apis/index.ts`](file:///Users/chestercai/Documents/side_project/music-player/utils/Apis/index.ts#L12-L21) |

**描述**:  
`Apis.init()` 方法在 catch 區塊中只記錄錯誤但沒有回傳值或拋出例外。呼叫端 (`_layout.tsx`) 檢查 `!dbInitResult` 但異常情況下 `init()` 回傳 `undefined`，導致錯誤處理不完整。

**問題程式碼**:
```typescript
async init() {
  try {
    // ...
    return { ...result, db: this.db };
  } catch (error) {
    console.error("Error initializing the database:", error);
    // ❌ 沒有 return 或 rethrow
  }
}
```

**修復建議**:
```typescript
async init() {
  try {
    // ...
    return { ...result, db: this.db };
  } catch (error) {
    console.error("Error initializing the database:", error);
    return { isError: true, db: null }; // ✅ 明確回傳錯誤狀態
  }
}
```

---

### 4. 🟡 Race Condition in Auto-Play Next Track ✅ **已修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🟡 中 |
| **修復難易度** | ⭐⭐⭐ (3/5) |
| **類別** | 邏輯錯誤 |
| **位置** | [`app/(tabs)/index.tsx`](file:///Users/chestercai/Documents/side_project/music-player/app/(tabs)/index.tsx#L205-L209) |

**描述**:  
`useEffect` 監聽 `status.didJustFinish` 時，`currentIndex` 的計算邏輯有問題。當 `audioId` 為 `undefined` 時，`currentIndex` 會被設為 `audios[0]?.id`（一個 ID 而非索引），可能導致 `currentIndex >= audios.length - 1` 的判斷邏輯錯誤。

**問題程式碼**:
```typescript
const currentIndex = audioId ? audios.findIndex((audio) => audio.id === audioId) : audios[0]?.id;
//                                                                                  ^^^^^^^^^ 這是 ID 不是 index
```

**修復建議**:
```typescript
const currentIndex = audioId 
  ? audios.findIndex((audio) => audio.id === audioId) 
  : 0; // ✅ 使用索引 0 而非 ID
```

---

### 5. 🟡 Prepared Statement Not Finalized ⏳ **未修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🟡 中 |
| **修復難易度** | ⭐ (1/5) |
| **類別** | 資源洩漏 |
| **位置** | [`utils/Apis/Sqlite/MusicTag/index.ts`](file:///Users/chestercai/Documents/side_project/music-player/utils/Apis/Sqlite/MusicTag/index.ts#L5-L21) |

**描述**:  
`prepareAsync` 建立的 prepared statement 在使用完後沒有呼叫 `finalizeAsync()` 釋放資源，可能導致記憶體洩漏或資料庫連線問題。

**修復建議**:
```typescript
async postMusicTags(req: PostMusicTagsRequire): Promise<void> {
  const statement = await this.db.prepareAsync(/* ... */);
  try {
    await Promise.all(
      req.tagIds.map((tagId) => statement.executeAsync(req.musicId, tagId))
    );
  } finally {
    await statement.finalizeAsync(); // ✅ 確保釋放資源
  }
}
```

---

### 6. 🟡 Migration Skip When Version >= DATABASE_VERSION ⏳ **未修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🟡 中 |
| **修復難易度** | ⭐⭐ (2/5) |
| **類別** | 邏輯錯誤 |
| **位置** | [`utils/sqlite/init.ts`](file:///Users/chestercai/Documents/side_project/music-player/utils/sqlite/init.ts#L17-L19) |

**描述**:  
當資料庫版本 **大於** `DATABASE_VERSION` 時（例如降級 app 版本），遷移會被跳過，但可能需要處理向下相容性或提示使用者。

**問題程式碼**:
```typescript
if (currentDbVersion === null || currentDbVersion >= DATABASE_VERSION) {
  return { isError: false }; // 當 currentDbVersion > DATABASE_VERSION 時無處理
}
```

**修復建議**:
```typescript
if (currentDbVersion === null) {
  // 全新安裝，執行完整遷移
}
if (currentDbVersion > DATABASE_VERSION) {
  console.warn(`Database version (${currentDbVersion}) is newer than app version (${DATABASE_VERSION})`);
  // 可選：回傳警告或拋出錯誤
}
if (currentDbVersion >= DATABASE_VERSION) {
  return { isError: false };
}
```

---

### 7. 🟡 Playback Resume After Sort/Filter Change ⏳ **未修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🟡 中 |
| **修復難易度** | ⭐⭐ (2/5) |
| **類別** | UX / 邏輯錯誤 |
| **位置** | [`app/(tabs)/index.tsx`](file:///Users/chestercai/Documents/side_project/music-player/app/(tabs)/index.tsx#L205-L209) |

**描述**:  
使用者回報：音樂列表播放結束後，若切換排序或重新整理列表，不應該自動繼續播放。目前的 `useEffect` 依賴於 `status.didJustFinish` 與 `audios` 列表變化。當列表因排序改變而重新渲染，且 `didJustFinish` 尚未被重置或狀態剛好滿足時，可能會觸發意外的播放行為，播放新列表中的下一首歌曲。

**修復建議**:
1. 確保 `didJustFinish` 訊號被消費後立即重置，或在列表變更時暫停自動播放邏輯
2. 在切換排序 (`handleSelectSortType`) 或標籤時，重置播放狀態或檢查當前播放邏輯是否適用於新列表

---

### 8. 🟡 Potential Duplicate Music Upload ⏳ **未修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🟡 中 |
| **修復難易度** | ⭐⭐⭐ (3/5) |
| **類別** | 邏輯錯誤 / UX |
| **位置** | [`utils/Apis/Sqlite/Music/index.ts`](file:///Users/chestercai/Documents/side_project/music-player/utils/Apis/Sqlite/Music/index.ts#L14-L30), [`app/upload.tsx`](file:///Users/chestercai/Documents/side_project/music-player/app/upload.tsx#L60-L63) |

**描述**:  
使用者回報：重複上傳音樂。
目前後端邏輯 (`postMusic`) 雖然有檢查 MD5 與檔案名稱，若存在則回傳舊 ID：
```typescript
if (existingMusicByMd5) { return existingMusicByMd5.id; }
```
但在前端 `upload.tsx` 中，即使拿到舊 ID，流程仍會繼續執行 `Apis.file.postFile`，導致不必要的檔案上傳，且對使用者來說感受像是"成功重複上傳"（雖然資料庫沒變，但行為不符合預期）。

**修復建議**:
1. 修改 `postMusic` 回傳結構，區分 `isNew` 或 `isExisting`
2. 前端偵測到已存在時，提示使用者「檔案已存在」，並詢問是否覆蓋或跳過 `postFile` 步驟

---

### 9. 🟡 Player Disappears on Tag Filter Change ⏳ **未修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🟡 中 |
| **修復難易度** | ⭐⭐ (2/5) |
| **類別** | UX / 狀態管理 |
| **位置** | [`app/(tabs)/index.tsx`](file:///Users/chestercai/Documents/side_project/music-player/app/(tabs)/index.tsx#L24) |

**描述**:  
使用者回報：切換標籤會導致 track 被清除，進而導致 Player 消失。
原因在於 `track` 變數是從當前過濾後的 `audios` 列表中尋找：
```typescript
const track = React.useMemo(() => audios.find((a) => a.id === audioId), [audios, audioId]);
```
當使用者切換標籤使得 `audios` 更新，且目前播放的 `audioId` 不在新列表中時，`track` 變為 `undefined`，導致 `Player` 元件隱藏：
```typescript
if (!track) return null; // Player component
```
但全局播放器不應受當前列表檢視影響。

**修復建議**:
1. 將 `track` (當前播放歌曲資訊) 獨立於 `audios` (列表) 狀態管理
2. 當 `audioId` 設定時，若該歌曲不在當前 `audios` 中，應保留最後一次播放的 `track` 資訊，或從完整資料庫/快取中獲取該 `track` 資訊

---

### 10. 🟡 Missing Transaction in `postMusic` Flow ⏳ **未修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🟡 中 |
| **修復難易度** | ⭐⭐⭐ (3/5) |
| **類別** | 資料庫安全性 |
| **位置** | [`utils/Apis/Sqlite/Music/index.ts`](file:///Users/chestercai/Documents/side_project/music-player/utils/Apis/Sqlite/Music/index.ts#L12), [`app/upload.tsx`](file:///Users/chestercai/Documents/side_project/music-player/app/upload.tsx#L60) |

**描述**:  
使用者回報：`postMusic` 缺少 transaction 包覆。
目前 `postMusic` 方法內是先 `SELECT` (Check) 再 `INSERT`，這在併發情況下非原子操作。此外，整個上傳流程涉及 `postMusic` (DB), `postFile` (Network), `postMusicTags` (DB)，若中間失敗（例如檔案上傳失敗），資料庫可能殘留無效的音樂紀錄。

**修復建議**:
1. 在 `postMusic` 內部使用 `db.withTransactionAsync` 包覆 "Check-then-Insert" 邏輯
2. 更理想的是在 `upload.tsx` 層級或新的 Service 層級，將 DB 寫入與 Tag 關聯包在同一個 Transaction 中
3. 若檔案上傳失敗，應回滾 DB 變更（需手動補償或調整流程先上傳成功再寫入 DB）

---

### 11. 🔵 useDrizzleStudio in Production ⏳ **未修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🔵 低 (CNG 相關) |
| **修復難易度** | ⭐ (1/5) |
| **類別** | CNG / 開發工具 |
| **位置** | [`app/_layout.tsx`](file:///Users/chestercai/Documents/side_project/music-player/app/_layout.tsx#L65) |

**描述**:  
`expo-drizzle-studio-plugin` 是開發用工具，在生產環境建置時會被 Expo 自動移除。若要明確控制，應該只在開發模式下呼叫。

**問題程式碼**:
```typescript
useDrizzleStudio(db); // 無條件呼叫
```

**修復建議**:
```typescript
if (__DEV__) {
  useDrizzleStudio(db);
}
```

---

### 12. 🔵 newArchEnabled Without Verification ⏳ **未修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🔵 低 (CNG 相關) |
| **修復難易度** | ⭐⭐⭐ (3/5) |
| **類別** | CNG / 配置風險 |
| **位置** | [`app.json`](file:///Users/chestercai/Documents/side_project/music-player/app.json#L10) |

**描述**:  
`newArchEnabled: true` 啟用了 React Native 新架構 (Fabric/TurboModules)。需確認所有依賴套件都支援新架構，否則可能導致建置失敗或執行時錯誤。

**相關依賴需驗證**:
- `expo-audio`
- `expo-sqlite`
- `expo-document-picker`
- `react-native-webview`
- `music-metadata`

**修復建議**:
1. 執行 `npx react-native-new-arch-sanity-check` 驗證相容性
2. 若有不相容套件，暫時設定 `newArchEnabled: false`

---

### 13. 🔵 Unused `index` Parameter in keyExtractor ⏳ **未修復**

| 項目 | 內容 |
|------|------|
| **嚴重程度** | 🔵 低 |
| **修復難易度** | ⭐ (1/5) |
| **類別** | 程式碼品質 |
| **位置** | [`components/AudioList.tsx`](file:///Users/chestercai/Documents/side_project/music-player/components/AudioList.tsx#L34-L37) |

**描述**:  
`keyExtractor` 回調函數宣告了 `index` 參數但未使用，會觸發 ESLint `@typescript-eslint/no-unused-vars` 警告。

**問題程式碼**:
```typescript
const keyExtractor = useCallback(
  (item: ComponentProps<typeof AudioItem>["data"], index: number) => item.id.toString(),
  [],
);
```

**修復建議**:
```typescript
const keyExtractor = useCallback(
  (item: ComponentProps<typeof AudioItem>["data"]) => item.id.toString(),
  [],
);
```

---

## 統計摘要

| 嚴重程度 | 數量 |
|----------|------|
| 🔴 高 | 2 |
| 🟡 中 | 8 |
| 🔵 低 | 3 |

| 類別 | 數量 |
|------|------|
| 邏輯錯誤 | 4 |
| UX / 邏輯錯誤 | 2 |
| 狀態管理 | 1 |
| 配置風險 | 1 |
| 錯誤處理 | 1 |
| 資源洩漏 | 1 |
| 資料庫安全性 | 1 |
| CNG 相關 | 2 |
| 程式碼品質 | 2 |

---

> 📅 最後更新: 2026-01-07
