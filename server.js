const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const app = express();
const PORT = 5500;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: { rejectUnauthorized: false }
});

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

// 取得菜單
app.get('/api/menu', (req, res) => {
  pool.query('SELECT * FROM menu', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const rows = result.rows;
    const filtered = rows.filter(row => {
      if (typeof row.name !== 'string' || typeof row.period !== 'string' || typeof row.category !== 'string' || isNaN(Number(row.price))) return false;
      if (row.image && typeof row.image === 'string') {
        const imgPath = path.join(__dirname, 'public', row.image.replace(/^\//, ''));
        if (!fs.existsSync(imgPath)) row.image = null;
      }
      return true;
    });
    res.json(filtered);
  });
});

// 新增訂單
app.post('/api/order', (req, res) => {
  const { order_id, branch, table_no, dine_type, order_items, total } = req.body;
  pool.query(
    'INSERT INTO orders (order_id, branch, table_no, dine_type, order_items, total, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [order_id, branch, table_no, dine_type, JSON.stringify(order_items), total, new Date().toISOString()],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, id: result.rows[0].id });
    }
  );
});

// 取得所有訂單
app.get('/api/admin/orders', (req, res) => {
  pool.query('SELECT * FROM orders ORDER BY id DESC', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const rows = result.rows;
    rows.forEach(row => {
      try { row.order_items = JSON.parse(row.order_items); } catch { row.order_items = []; }
    });
    res.json(rows);
  });
});

// 新增菜單（含圖片）
app.post('/api/admin/menu', upload.single('image'), (req, res) => {
  const { period, category, name, price } = req.body;
  let image = null;
  if (req.file) {
    image = '/images/' + req.file.filename;
  }
  pool.query(
    'INSERT INTO menu (period, category, name, price, image) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [period, category, name, price, image],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, id: result.rows[0].id, image });
    }
  );
});

// 刪除菜單
app.delete('/api/admin/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  pool.query('DELETE FROM menu WHERE id = $1', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 更新菜單
app.put('/api/admin/menu/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { period, category, name, price } = req.body;
  pool.query(
    'UPDATE menu SET period = $1, category = $2, name = $3, price = $4 WHERE id = $5',
    [period, category, name, price, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// 單獨上傳圖片
app.post('/api/admin/menu/:id/image', upload.single('image'), (req, res) => {
  const id = parseInt(req.params.id);
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const image = '/images/' + req.file.filename;
  pool.query('UPDATE menu SET image = $1 WHERE id = $2', [image, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, image });
  });
});

// 取得所有分店
app.get('/api/branches', (req, res) => {
  pool.query('SELECT * FROM branches', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result.rows);
  });
});

// 新增分店
app.post('/api/branches', (req, res) => {
  const { name, phone, address } = req.body;
  pool.query(
    'INSERT INTO branches (name, phone, address) VALUES ($1, $2, $3) RETURNING id',
    [name, phone, address],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, id: result.rows[0].id });
    }
  );
});

// 更新分店
app.put('/api/branches/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, phone, address } = req.body;
  pool.query(
    'UPDATE branches SET name = $1, phone = $2, address = $3 WHERE id = $4',
    [name, phone, address, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// 刪除分店
app.delete('/api/branches/:id', (req, res) => {
  const id = parseInt(req.params.id);
  pool.query('DELETE FROM branches WHERE id = $1', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 刪除訂單
app.delete('/api/admin/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  pool.query('DELETE FROM orders WHERE id = $1', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});