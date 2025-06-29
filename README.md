<div align="center">

# 🍽️ Food Order System
### 線上訂餐系統

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**一個現代化、功能完整的線上餐點訂購平台**

[🚀 快速開始](#-快速開始) • [✨ 功能特色](#-功能特色) • [📖 使用說明](#-使用說明) • [🛠️ 技術架構](#️-技術架構)

</div>

---

## ✨ 功能特色

<table>
<tr>
<td width="50%">

### 🕐 智能時段管理
- 早餐、午餐、晚餐分時段菜單
- 動態顯示當前時間
- 時段自動切換提醒

### 🍔 豐富餐點選擇
- 多分類餐點管理
- 高清餐點圖片展示
- 即時庫存狀態顯示

</td>
<td width="50%">

### 🛒 智能訂單系統
- 直觀的數量調整介面
- 即時計算總金額
- 一鍵清空/修改訂單

### 🏪 多分店支援
- 分店位置管理
- 多種用餐方式選擇
- 配送範圍智能判斷

</td>
</tr>
</table>

---

## 🚀 快速開始

### 📋 環境需求
- **Node.js** 14.0 或更高版本
- **npm** 6.0 或更高版本
- 現代瀏覽器 (Chrome, Firefox, Safari, Edge)

### ⚡ 一鍵啟動

```bash
# 1. 複製專案
git clone https://github.com/your-username/food-order.git
cd food-order

# 2. 安裝依賴
npm install

# 3. 啟動服務
npm start

# 4. 開啟瀏覽器訪問
# http://localhost:3000
```

### 🔧 開發模式

```bash
# 開發模式啟動 (自動重載)
npm run dev

# 檢查程式碼
npm run lint

# 執行測試
npm test
```

---

## 🛠️ 技術架構

<div align="center">

```mermaid
graph TB
    A[用戶介面 HTML/CSS/JS] --> B[Express.js 服務器]
    B --> C[SQLite 資料庫]
    B --> D[靜態資源 Images]
    B --> E[API 接口]
    E --> F[訂單管理]
    E --> G[菜單管理]
    E --> H[分店管理]
```

</div>

| 技術棧 | 版本 | 用途 |
|--------|------|------|
| **前端** | | |
| HTML5 | - | 頁面結構 |
| CSS3 | - | 樣式設計 |
| Vanilla JavaScript | ES6+ | 互動邏輯 |
| **後端** | | |
| Node.js | 14+ | 運行環境 |
| Express.js | 4.x | Web 框架 |
| SQLite | 3.x | 資料庫 |

---

## 📁 專案結構

```
food-order/
├── 📁 public/                 # 前端資源
│   ├── 🏠 index.html         # 主訂餐頁面
│   ├── 👨‍💼 admin.html         # 管理後台
│   ├── 🏪 branches.html      # 分店管理
│   ├── 📋 orders.html        # 訂單查詢
│   ├── 🎨 style.css          # 主要樣式
│   ├── 🎨 back-style.css     # 後台樣式
│   └── 📁 images/            # 餐點圖片庫
├── 🚀 server.js              # 主伺服器
├── 📦 package.json           # 專案配置
├── 🗃️ mcdonalds.db          # SQLite 資料庫
├── 📊 import-branches.js     # 分店數據導入
└── 📖 README.md              # 專案說明
```

---

## � 使用說明

### 👤 顧客端操作流程

```
🕐 選擇時段 → 🍽️ 選擇分類 → 🛒 選擇餐點 → ➕ 調整數量 → 📝 填寫資訊 → ✅ 確認訂單
```

1. **時段選擇** - 根據當前時間選擇對應餐期
2. **分類瀏覽** - 快速定位想要的餐點類型
3. **餐點選擇** - 查看圖片與詳細資訊
4. **數量調整** - 使用 ➕➖ 按鈕精確控制
5. **訂單確認** - 選擇分店、用餐方式
6. **送出訂單** - 完成線上訂購

### 👨‍💼 管理員功能

- **📊 訂單管理** - 即時查看所有訂單狀態
- **🍽️ 菜單管理** - 新增、編輯、刪除餐點
- **🏪 分店管理** - 管理分店資訊與營業狀態
- **📈 銷售統計** - 查看銷售數據與趨勢

---

## 🌐 API 接口

### 📋 菜單相關
```http
GET    /api/menu              # 獲取完整菜單
GET    /api/menu/:category    # 獲取分類菜單
POST   /api/menu              # 新增餐點
PUT    /api/menu/:id          # 更新餐點
DELETE /api/menu/:id          # 刪除餐點
```

### 🏪 分店相關
```http
GET    /api/branches          # 獲取所有分店
GET    /api/branches/:id      # 獲取特定分店
POST   /api/branches          # 新增分店
PUT    /api/branches/:id      # 更新分店資訊
```

### 📋 訂單相關
```http
GET    /api/orders            # 獲取所有訂單
GET    /api/orders/:id        # 獲取特定訂單
POST   /api/orders            # 創建新訂單
PUT    /api/orders/:id        # 更新訂單狀態
DELETE /api/orders/:id        # 取消訂單
```

---

## 📱 響應式設計

<div align="center">

| 裝置類型 | 螢幕寬度 | 佈局特色 |
|----------|----------|----------|
| 📱 手機 | < 768px | 單欄式佈局，大按鈕設計 |
| 📊 平板 | 768px - 1024px | 雙欄式佈局，觸控優化 |
| 💻 桌面 | > 1024px | 多欄式佈局，豐富互動 |

</div>

---

## 🔧 開發指南

### 📦 依賴安裝
```bash
npm install express sqlite3 cors
```

### 🗃️ 資料庫初始化
```bash
node import-branches.js  # 初始化分店資料
```

### 🚀 部署到生產環境
```bash
# 設置環境變數
export NODE_ENV=production
export PORT=3000

# 啟動服務
npm start
```

---

## 🤝 貢獻指南

我們歡迎各種形式的貢獻！

1. **🍴 Fork** 這個專案
2. **🌿 建立** 你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. **💾 提交** 你的變更 (`git commit -m 'Add some AmazingFeature'`)
4. **📤 推送** 到分支 (`git push origin feature/AmazingFeature`)
5. **🔄 開啟** Pull Request

---

## � 聯絡資訊

<div align="center">

**有問題或建議嗎？**

📧 Email: your-email@example.com  
🐛 Issues: [GitHub Issues](https://github.com/your-username/food-order/issues)  
💬 討論: [GitHub Discussions](https://github.com/your-username/food-order/discussions)

</div>

---

## 📄 授權條款

本專案採用 MIT 授權條款。詳細內容請參閱 [LICENSE](LICENSE) 文件。

---

<div align="center">

**⭐ 如果這個專案對你有幫助，請給我們一個 Star！**

Made with ❤️ by [Your Name](https://github.com/your-username)

</div>
