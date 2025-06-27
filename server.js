const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 5500;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./mcdonalds.db');

// 設定圖片上傳儲存位置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'images'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E6);
    cb(null, basename + '-' + unique + ext);
  }
});
const upload = multer({ storage });

// 初始化資料表
db.serialize(() => {
  // 自動檢查並新增 period 欄位
  db.get("PRAGMA table_info(menu)", (err, row) => {
    db.all("PRAGMA table_info(menu)", (err, columns) => {
      if (!columns.some(col => col.name === 'period')) {
        db.run("ALTER TABLE menu ADD COLUMN period TEXT");
      }
    });
  });
  // 自動檢查並新增 branch 欄位
  db.get("PRAGMA table_info(orders)", (err, row) => {
    db.all("PRAGMA table_info(orders)", (err, columns) => {
      if (!columns.some(col => col.name === 'branch')) {
        db.run("ALTER TABLE orders ADD COLUMN branch TEXT");
      }
    });
  });
  // 自動檢查並新增 image 欄位
  db.get("PRAGMA table_info(menu)", (err, row) => {
    db.all("PRAGMA table_info(menu)", (err, columns) => {
      if (!columns.some(col => col.name === 'image')) {
        db.run("ALTER TABLE menu ADD COLUMN image TEXT");
      }
    });
  });
  db.run(`CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT,
    category TEXT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT,
    branch TEXT,
    table_no TEXT,
    dine_type TEXT,
    order_items TEXT,
    total INTEGER,
    created_at TEXT
  )`);
  // 新增分店 branches 資料表
  db.run(`CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT
  )`);
});

/*let menu = [
  { id: 1, name: '大麥克', price: 75 },
  { id: 2, name: '麥香雞', price: 60 },
  { id: 3, name: '薯條(大)', price: 50 }
];*/
let orders = [];

app.get('/api/menu', (req, res) => {
  db.all('SELECT * FROM menu', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // 修正過濾條件，允許 price 為數字字串
    const filtered = rows.filter(row => {
      if (typeof row.name !== 'string' || typeof row.period !== 'string' || typeof row.category !== 'string' || isNaN(Number(row.price))) return false;
      if (row.image && typeof row.image === 'string') {
        const imgPath = path.join(__dirname, 'public', row.image.replace(/^\//, ''));
        if (!fs.existsSync(imgPath)) row.image = null;
      }
      return true;
    });
    console.log('API /api/menu 回傳 filtered rows:', filtered);
    res.json(filtered);
  });
});

app.post('/api/order', (req, res) => {
  console.log(req.body); // 新增這行
  const { order_id, branch, table_no, dine_type, order_items, total } = req.body;
  db.run(
    'INSERT INTO orders (order_id, branch, table_no, dine_type, order_items, total, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [order_id, branch, table_no, dine_type, JSON.stringify(order_items), total, new Date().toISOString()],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, id: this.lastID });
    }
  );
});

app.get('/api/admin/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // 解析 order_items
    rows.forEach(row => {
      try {
        row.order_items = JSON.parse(row.order_items);
      } catch {
        row.order_items = [];
      }
    });
    res.json(rows);
  });
});

// 支援圖片上傳的菜單新增 API
app.post('/api/admin/menu', (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    const formidable = require('formidable');
    const form = new formidable.IncomingForm({ multiples: false, uploadDir: path.join(__dirname, 'public', 'images'), keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      console.log('新增餐點 fields:', fields);
      console.log('新增餐點 files keys:', Object.keys(files));
      // 兼容新版 formidable 單檔案也包陣列
      const imageFileArr = files.image || Object.values(files)[0];
      const imageFile = Array.isArray(imageFileArr) ? imageFileArr[0] : imageFileArr;
      if (err) return res.status(500).json({ error: err.message });
      // 修正新版 formidable 欄位皆為陣列
      const period = Array.isArray(fields.period) ? fields.period[0] : fields.period;
      const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const price = Number(Array.isArray(fields.price) ? fields.price[0] : fields.price);
      if (!name || !category || !period || isNaN(price) || price <= 0) {
        console.log('欄位驗證失敗:', { period, category, name, price });
        return res.status(400).json({ error: '欄位格式錯誤' });
      }
      if (imageFile && imageFile.originalFilename) {
        const imagesDir = path.join(__dirname, 'public', 'images');
        const normalizeName = s => path.normalize(s).toLowerCase().normalize('NFC');
        const originalName = normalizeName(imageFile.originalFilename);
        const allFiles = fs.readdirSync(imagesDir);
        const matchFile = allFiles.find(f => normalizeName(f) === originalName);
        const destPath = path.join(imagesDir, imageFile.originalFilename);
        if (matchFile) {
          const image = '/images/' + matchFile;
          db.run('INSERT INTO menu (period, category, name, price, image) VALUES (?, ?, ?, ?, ?)', [period, category, name, price, image], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            fs.unlinkSync(imageFile.filepath);
            res.status(201).json({ success: true, id: this.lastID, image });
          });
        } else {
          fs.renameSync(imageFile.filepath, destPath);
          const image = '/images/' + imageFile.originalFilename;
          db.run('INSERT INTO menu (period, category, name, price, image) VALUES (?, ?, ?, ?, ?)', [period, category, name, price, image], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ success: true, id: this.lastID, image });
          });
        }
      } else {
        console.log('imageFile 檢查失敗:', imageFile);
        return res.status(400).json({ error: '未收到圖片檔案，請重新選擇圖片' });
      }
    });
  } else {
    // 避免與上方變數衝突，改名為 _period, _category, _name, _price
    const { period: _period, category: _category, name: _name, price: _price } = req.body;
    db.run('INSERT INTO menu (period, category, name, price) VALUES (?, ?, ?, ?)', [_period, _category, _name, _price], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, id: this.lastID });
    });
  }
});

app.delete('/api/admin/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.run('DELETE FROM menu WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.put('/api/admin/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { period, category, name, price } = req.body;
  db.run('UPDATE menu SET period = ?, category = ?, name = ?, price = ? WHERE id = ?', [period, category, name, price, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 新增：支援圖片單獨上傳 API
app.post('/api/admin/menu/:id/image', upload.single('image'), (req, res) => {
  const id = parseInt(req.params.id);
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const image = '/images/' + req.file.filename;
  db.run('UPDATE menu SET image = ? WHERE id = ?', [image, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, image });
  });
});

// 取得所有分店
app.get('/api/branches', (req, res) => {
  db.all('SELECT * FROM branches', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// 新增分店
app.post('/api/branches', (req, res) => {
  const { name, phone, address } = req.body;
  db.run('INSERT INTO branches (name, phone, address) VALUES (?, ?, ?)', [name, phone, address], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, id: this.lastID });
  });
});
// 更新分店
app.put('/api/branches/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, phone, address } = req.body;
  db.run('UPDATE branches SET name = ?, phone = ?, address = ? WHERE id = ?', [name, phone, address, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
// 刪除分店
app.delete('/api/branches/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.run('DELETE FROM branches WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 新增刪除訂單 API
app.delete('/api/admin/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});