const http = require("http");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const port = 6223;
const root = __dirname;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const EXPORT_HEADERS = [
  "运单号",        // A
  "预警来源",      // B
  "推送平台",      // C
  "标识",          // D
  "fba 号码",      // E
  "渠道",          // F
  "最新轨迹",      // G
  "轨迹更新时间",  // H
  "ETA",           // I
  "ETD",           // J
  "卖家是否可修改",// K
  "实际送仓时间",  // L
  "客户预计送达周",// M
  "参考预计送达周",// N
  "精算预计送达周",// O
  "截止修改时间",  // P
  "创建人",        // Q
  "处理状态",      // R
  "预警时间"       // S
];

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

async function buildXlsx(rows) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("FBA货件管理");

  const headerRow = ws.addRow(EXPORT_HEADERS);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
  ws.views = [{ state: "frozen", ySplit: 1 }];

  const widths = [20, 12, 12, 8, 17, 12, 15, 16, 10, 10, 13, 21, 17, 17, 17, 21, 14, 12, 21];
  widths.forEach((w, i) => ws.getColumn(i + 1).width = w);

  ws.getColumn(1).numFmt = "@";   // 运单号
  ws.getColumn(5).numFmt = "@";   // fba 号码
  ws.getColumn(8).numFmt = "yyyy-MM-dd HH:mm:ss";  // 轨迹更新时间
  ws.getColumn(9).numFmt = "yyyy-MM-dd";           // ETA
  ws.getColumn(10).numFmt = "yyyy-MM-dd";          // ETD
  ws.getColumn(12).numFmt = "yyyy-MM-dd HH:mm:ss"; // 实际送仓时间
  ws.getColumn(16).numFmt = "yyyy-MM-dd HH:mm:ss"; // 截止修改时间
  ws.getColumn(19).numFmt = "yyyy-MM-dd HH:mm:ss"; // 预警时间

  for (const row of rows) {
    const cells = [
      row.waybill,
      row.warningSource || null,
      row.platform || null,
      row.mark || null,
      row.fba,
      row.channel || null,
      row.latestTrack || null,
      parseDate(row.trackUpdatedAt),
      parseDate(row.eta),
      parseDate(row.etd),
      row.editable || null,
      parseDate(row.deliveredAt),
      row.customerWeek || null,
      row.referenceWeek || null,
      row.settlementWeek || null,
      parseDate(row.deadline),
      row.creator || null,
      row.status || null,
      parseDate(row.warningAt)
    ];
    ws.addRow(cells);
  }

  return wb.xlsx.writeBuffer();
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    let pathname = decodeURIComponent(url.pathname);

    // API: export xlsx
    if (req.method === "POST" && pathname === "/api/export") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const rows = JSON.parse(body);
          const buffer = await buildXlsx(rows);
          res.writeHead(200, {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${encodeURIComponent("FBA货件管理_导出")}_${new Date().toISOString().slice(0, 10)}.xlsx"`
          });
          res.end(buffer);
        } catch (e) {
          res.writeHead(500);
          res.end("Export failed: " + e.message);
        }
      });
      return;
    }

    if (pathname === "/") pathname = "/index.html";

    const file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(file, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, {
        "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream"
      });
      res.end(data);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`http://localhost:${port}`);
  });
