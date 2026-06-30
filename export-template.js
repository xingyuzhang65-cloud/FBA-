const ExcelJS = require("exceljs");
const path = require("path");

async function generateTemplate() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("FBA货件管理");

  // 表头 A–S（19 列）
  const headers = [
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

  const headerRow = ws.addRow(headers);
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

  // ---- 示例行 1 ----
  const row1 = ws.addRow([
    "USSZAS2605270246",
    null, null, null,
    "FBA19F18VVS3",
    null, null, null, null, null, null,
    null, null, null, null, null,
    "郑志强",
    "待处理",
    new Date(2026, 4, 27, 12, 0, 17)
  ]);

  // ---- 示例行 2 ----
  const row2 = ws.addRow([
    "USSZAS2605270235",
    null, null, null,
    "FBA19F0TVLUR",
    null, null, null, null, null, null,
    null, null, null, null, null,
    "郑志强",
    "待处理",
    new Date(2026, 4, 27, 11, 57, 0)
  ]);

  const outPath = path.join(__dirname, "FBA货件管理_导入模板.xlsx");
  await wb.xlsx.writeFile(outPath);
  console.log(`模板已生成: ${outPath}`);
}

generateTemplate().catch(console.error);
