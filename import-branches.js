// 匯入分店清單到 SQLite branches 資料表
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mcdonalds.db');

// 請將這裡的 branches 陣列換成你要匯入的完整分店清單
const branches = [
  { name: "重北一店", phone: "02-2816-2230", address: "台北市士林區重慶北路4段123號" },
  { name: "陽明山店", phone: "02-2861-7252", address: "台北市士林區格致路62號" },
  { name: "天母店", phone: "02-2874-7123", address: "台北市士林區天母東路8巷1號" },
  { name: "芝山店", phone: "02-2838-3567", address: "台北市士林區福國路42號" },
  { name: "承德店", phone: "02-2597-2052", address: "台北市大同區承德路三段230號" },
  { name: "劍潭店", phone: "02-2883-1234", address: "台北市士林區基河路130號" },
  { name: "台北車站", phone: "02-2314-6601", address: "台北市中正區忠孝西路一段49號B1" },
  { name: "西門町", phone: "02-2381-1234", address: "台北市萬華區漢中街36號" },
  { name: "信義區", phone: "02-2720-1234", address: "台北市信義區松壽路11號" },
  { name: "高雄左營店", phone: "07-345-6789", address: "高雄市左營區自由二路123號" }
  // ...可補齊所有分店...
];

// 清空 branches 資料表（如需保留舊資料請註解掉）
db.run('DELETE FROM branches', function(err) {
  if (err) console.error('清空 branches 失敗:', err.message);
  else console.log('branches 資料表已清空');

  // 批次插入分店
  const stmt = db.prepare('INSERT INTO branches (name, phone, address) VALUES (?, ?, ?)');
  branches.forEach(b => {
    stmt.run(b.name, b.phone, b.address);
  });
  stmt.finalize(() => {
    console.log('分店匯入完成，共', branches.length, '筆');
    db.close();
  });
});
