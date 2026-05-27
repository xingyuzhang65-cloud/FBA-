const navGroups = [
  { label: "预报下单", icon: "⌘" },
  { label: "未入仓运单", icon: "⌘" },
  { label: "业务运单", icon: "⌄", children: ["业务运单列表", "异常跟进"] },
  { label: "客服运单管理", icon: "⌄", children: ["运单查询", "客服备注"] },
  { label: "海外中转单", icon: "⌄", children: ["中转列表"] },
  { label: "财务运单", icon: "⌄", children: ["账单确认"] },
  { label: "报价审批", icon: "⌘" },
  { label: "来款登记", icon: "⌘" },
  { label: "出仓单", icon: "⌘" },
  { label: "客户余额", icon: "⌘" },
  { label: "工单", icon: "⌄", children: ["工单列表", "待办工单"] },
  { label: "服务订单", icon: "⌄", children: ["订单列表"] },
  { label: "修改材积运单", icon: "⌘" },
  { label: "仓库费用日志", icon: "⌘" },
  {
    label: "货件管理",
    icon: "⌄",
    open: true,
    children: ["FBA货件管理", "FBA货量看板", "节点事件准时率", "节点事件准时率..."]
  },
  { label: "预留仓", icon: "⌘" }
];

const moduleTabsSeed = [
  "预报下单",
  "我的问题件",
  "问题件统计",
  "毛利表",
  "跟单提成表",
  "业务毛利表",
  "客户余额表",
  "材质",
  "渠道",
  "FBA货件管理"
];

const state = {
  rows: [],
  filtered: [],
  page: 1,
  pageSize: 100,
  activeStatus: "all",
  selectedIds: new Set(),
  activeRow: null,
  activeModule: "FBA货件管理"
};

const TOTAL_ROWS = 77440;
const UNPUSHED_ROWS = 584;

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  state.rows = buildRows();
  state.filtered = [...state.rows];
  renderNav();
  renderModuleTabs();
  bindEvents();
  applyFilters();
});

function cacheElements() {
  [
    "appShell",
    "sideNav",
    "collapseSidebar",
    "menuToggle",
    "mainTabs",
    "filterForm",
    "resetBtn",
    "statusTabs",
    "tableBody",
    "checkAll",
    "selectedCount",
    "totalText",
    "pageList",
    "prevPage",
    "nextPage",
    "pageSize",
    "jumpPage",
    "exportBtn",
    "refreshBtn",
    "settingsBtn",
    "settingsMenu",
    "compactToggle",
    "freezeToggle",
    "detailDrawer",
    "drawerTitle",
    "drawerBody",
    "closeDrawer",
    "modalBackdrop",
    "modalText",
    "processRemark",
    "cancelProcess",
    "confirmProcess",
    "toast",
    "quickMenu",
    "bellBtn",
    "profileBtn"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function buildRows() {
  const platforms = ["暂无推送", "Amazon", "Walmart"];
  const creators = ["郑志强", "郑志强_义乌", "王思雨", "李晓"];
  const channels = ["美森快船", "以星快船", "盐田普船", "空派专线", "卡派渠道"];
  const trackNodes = ["已创建货件", "已揽收", "已入仓", "已装柜", "已开船", "目的港清关中", "已预约派送"];
  const rows = [];
  for (let i = 0; i < TOTAL_ROWS; i += 1) {
    const prefix = i % 6 === 0 ? "USYWAS" : "USSZAS";
    const wayNum = 2605260328 - i - Math.floor(i / 7) * 12;
    const fbaTail = makeCode(i);
    const pushed = i >= UNPUSHED_ROWS;
    const hasDelivery = i % 8 === 0;
    rows.push({
      id: i + 1,
      waybill: `${prefix}${wayNum}`,
      warningSource: i % 11 === 0 ? "系统预警" : "",
      platform: pushed ? platforms[i % platforms.length] : "暂无推送",
      pushType: pushed ? (i % 4 === 0 ? "自动推单" : "") : "人工推单",
      mark: i % 10 === 0 ? "加急" : "",
      fba: `FBA19D${fbaTail}`,
      channel: channels[i % channels.length],
      latestTrack: trackNodes[i % trackNodes.length],
      trackUpdatedAt: `2026-05-${String(20 + (i % 7)).padStart(2, "0")} ${String(8 + (i % 10)).padStart(2, "0")}:${String(5 + (i % 50)).padStart(2, "0")}:00`,
      eta: `2026-06-${String(8 + (i % 14)).padStart(2, "0")}`,
      etd: `2026-05-${String(27 + (i % 4)).padStart(2, "0")}`,
      editable: i % 9 === 0 ? "可修改" : "卖家未授权",
      deliveredAt: hasDelivery ? `2026-05-${String(18 + (i % 8)).padStart(2, "0")} 09:${String(10 + i).padStart(2, "0")}:20` : "",
      customerWeek: i % 7 === 0 ? "2026-W22" : "",
      referenceWeek: i % 5 === 0 ? "2026-W23" : "",
      settlementWeek: i % 6 === 0 ? "2026-W24" : "",
      deadline: i % 4 === 0 ? "2026-05-28 18:00:00" : "",
      creator: creators[i % creators.length],
      status: i % 17 === 0 ? "已处理" : "待处理",
      pushed,
      warningAt: `2026-05-26 ${String(16 - Math.floor(i / 24)).padStart(2, "0")}:${String(46 - (i % 18)).padStart(2, "0")}:${String(4 + (i % 55)).padStart(2, "0")}`
    });
  }
  return rows;
}

function makeCode(index) {
  const source = "SL9NS4MJJNNZSQ4LXFDSQR73BSQWTD9DYTT9MDZ41HXPYFHWGCDYJMDPQDYK1516DYKJQNHDZ0XFLNDZ3CH73DZ2YVTKDZ468FL";
  return source.slice(index % 80, (index % 80) + 7).padEnd(7, "X");
}

function renderNav() {
  els.sideNav.innerHTML = navGroups
    .map((group, index) => {
      const hasChildren = Array.isArray(group.children);
      const active = group.label === "货件管理";
      const children = hasChildren
        ? `<div class="submenu" ${group.open ? "" : "hidden"}>${group.children
            .map(
              (child) =>
                `<button class="${child === "FBA货件管理" ? "active" : ""}" data-child="${child}">
                  <span class="nav-icon">⌘</span><span>${child}</span>
                </button>`
            )
            .join("")}</div>`
        : "";
      return `<div class="nav-group">
        <button class="nav-item ${active ? "active" : ""}" data-index="${index}" aria-expanded="${group.open ? "true" : "false"}">
          <span class="nav-icon">${group.icon === "⌄" ? "⌘" : group.icon}</span>
          <span class="nav-label">${group.label}</span>
          <span class="nav-arrow">${hasChildren ? (group.open ? "⌃" : "⌄") : ""}</span>
        </button>
        ${children}
      </div>`;
    })
    .join("");
}

function renderModuleTabs() {
  const tabs = moduleTabsSeed.includes(state.activeModule) ? moduleTabsSeed : [...moduleTabsSeed, state.activeModule];
  els.mainTabs.innerHTML = tabs
    .map(
      (tab) => `<button class="module-tab ${tab === state.activeModule ? "active" : ""}" data-tab="${tab}">
        <span>${tab}</span><span class="close" data-close="${tab}">×</span>
      </button>`
    )
    .join("");
}

function bindEvents() {
  els.sideNav.addEventListener("click", onNavClick);
  els.mainTabs.addEventListener("click", onModuleTabClick);
  els.collapseSidebar.addEventListener("click", toggleSidebar);
  els.menuToggle.addEventListener("click", toggleSidebar);
  els.filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.page = 1;
    applyFilters();
    showToast("查询完成");
  });
  els.resetBtn.addEventListener("click", () => {
    els.filterForm.reset();
    state.activeStatus = "all";
    state.page = 1;
    state.selectedIds.clear();
    applyFilters();
    showToast("筛选条件已重置");
  });
  els.statusTabs.addEventListener("click", (event) => {
    const button = event.target.closest(".status-tab");
    if (!button) return;
    state.activeStatus = button.dataset.status;
    state.page = 1;
    applyFilters();
  });
  els.checkAll.addEventListener("change", () => {
    currentPageRows().forEach((row) => {
      if (els.checkAll.checked) state.selectedIds.add(row.id);
      else state.selectedIds.delete(row.id);
    });
    renderTable();
  });
  els.tableBody.addEventListener("click", onTableClick);
  els.tableBody.addEventListener("change", onRowCheckChange);
  els.prevPage.addEventListener("click", () => setPage(state.page - 1));
  els.nextPage.addEventListener("click", () => setPage(state.page + 1));
  els.pageList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (button) setPage(Number(button.dataset.page));
  });
  els.pageSize.addEventListener("change", () => {
    state.pageSize = Number(els.pageSize.value);
    state.page = 1;
    renderTable();
  });
  els.jumpPage.addEventListener("keydown", (event) => {
    if (event.key === "Enter") setPage(Number(els.jumpPage.value));
  });
  els.exportBtn.addEventListener("click", exportRows);
  els.refreshBtn.addEventListener("click", () => {
    applyFilters();
    showToast("数据已刷新");
  });
  els.settingsBtn.addEventListener("click", () => {
    els.settingsMenu.hidden = !els.settingsMenu.hidden;
  });
  els.compactToggle.addEventListener("change", () => {
    document.querySelector(".table-wrap").classList.toggle("compact", els.compactToggle.checked);
  });
  els.freezeToggle.addEventListener("change", () => {
    document.querySelector(".table-wrap").classList.toggle("no-freeze", !els.freezeToggle.checked);
  });
  els.closeDrawer.addEventListener("click", closeDrawer);
  els.cancelProcess.addEventListener("click", closeModal);
  els.confirmProcess.addEventListener("click", confirmProcess);
  els.quickMenu.addEventListener("click", () => showToast("已进入直客录单流程"));
  els.bellBtn.addEventListener("click", () => showToast("1 条待处理提醒"));
  els.profileBtn.addEventListener("click", () => showToast("当前用户：天朗"));
  document.addEventListener("click", (event) => {
    if (!els.settingsMenu.hidden && !event.target.closest(".right-tools")) {
      els.settingsMenu.hidden = true;
    }
  });
}

function onNavClick(event) {
  const child = event.target.closest("[data-child]");
  if (child) {
    state.activeModule = child.dataset.child;
    renderModuleTabs();
    showToast(`已打开 ${state.activeModule}`);
    if (window.innerWidth <= 760) document.querySelector(".sidebar").classList.remove("mobile-open");
    return;
  }
  const item = event.target.closest(".nav-item");
  if (!item) return;
  const group = navGroups[Number(item.dataset.index)];
  if (!group.children) {
    state.activeModule = group.label;
    renderModuleTabs();
    showToast(`已打开 ${group.label}`);
    return;
  }
  group.open = !group.open;
  renderNav();
}

function onModuleTabClick(event) {
  const close = event.target.closest("[data-close]");
  if (close) {
    event.stopPropagation();
    const name = close.dataset.close;
    const index = moduleTabsSeed.indexOf(name);
    if (index > -1 && moduleTabsSeed.length > 1) moduleTabsSeed.splice(index, 1);
    if (state.activeModule === name) state.activeModule = moduleTabsSeed[moduleTabsSeed.length - 1] || "FBA货件管理";
    renderModuleTabs();
    return;
  }
  const tab = event.target.closest("[data-tab]");
  if (!tab) return;
  state.activeModule = tab.dataset.tab;
  renderModuleTabs();
}

function toggleSidebar() {
  if (window.innerWidth <= 760) {
    document.querySelector(".sidebar").classList.toggle("mobile-open");
  } else {
    els.appShell.classList.toggle("sidebar-collapsed");
  }
}

function applyFilters() {
  const formData = new FormData(els.filterForm);
  const query = Object.fromEntries(formData.entries());
  state.filtered = state.rows.filter((row) => {
    if (state.activeStatus === "pushed" && !row.pushed) return false;
    if (state.activeStatus === "unpushed" && row.pushed) return false;
    if (!matchMulti(row.waybill, query.waybill)) return false;
    if (!matchMulti(row.fba, query.fba)) return false;
    if (query.platform && row.platform !== query.platform) return false;
    if (query.pushType && row.pushType !== query.pushType) return false;
    if (query.channel && row.channel !== query.channel) return false;
    if (query.editable && row.editable !== query.editable) return false;
    if (query.emptyDelivered === "yes" && row.deliveredAt) return false;
    if (query.emptyDelivered === "no" && !row.deliveredAt) return false;
    if (query.mark && !row.mark.includes(query.mark.trim())) return false;
    if (query.customerWeek && !row.customerWeek.includes(query.customerWeek.trim())) return false;
    if (query.settlementWeek && !row.settlementWeek.includes(query.settlementWeek.trim())) return false;
    if (query.deliveryType && !row.platform.includes(query.deliveryType.trim())) return false;
    return true;
  });

  document.querySelectorAll(".status-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.status === state.activeStatus);
  });
  renderTable();
}

function matchMulti(value, query) {
  const parts = String(query || "")
    .split(/[\s,，]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return true;
  return parts.some((part) => value.toLowerCase().includes(part.toLowerCase()));
}

function renderTable() {
  const rows = currentPageRows();
  const start = (state.page - 1) * state.pageSize;
  els.tableBody.innerHTML =
    rows
      .map(
        (row, index) => `<tr data-id="${row.id}">
          <td>${start + index + 1}</td>
          <td><input type="checkbox" class="row-check" data-id="${row.id}" ${state.selectedIds.has(row.id) ? "checked" : ""} aria-label="选择 ${row.waybill}" /></td>
          <td title="${row.waybill}">${row.waybill}</td>
          <td>${row.warningSource}</td>
          <td>${row.platform}</td>
          <td>${row.pushType}</td>
          <td>${row.mark}</td>
          <td><button class="link-btn" data-detail="${row.id}">${row.fba}</button></td>
          <td>${row.channel}</td>
          <td title="${row.latestTrack}">${row.latestTrack}</td>
          <td>${row.trackUpdatedAt}</td>
          <td>${row.eta}</td>
          <td>${row.etd}</td>
          <td>${row.editable}</td>
          <td>${row.deliveredAt}</td>
          <td>${row.customerWeek}</td>
          <td>${row.referenceWeek}</td>
          <td>${row.settlementWeek}</td>
          <td>${row.deadline}</td>
          <td>${row.creator}</td>
          <td><button class="status-badge ${row.status === "已处理" ? "done" : ""}" data-process="${row.id}">${row.status}</button></td>
          <td>${row.warningAt}</td>
        </tr>`
      )
      .join("") || `<tr><td colspan="22">暂无匹配数据</td></tr>`;

  const pageRows = currentPageRows();
  els.checkAll.checked = pageRows.length > 0 && pageRows.every((row) => state.selectedIds.has(row.id));
  els.selectedCount.textContent = `已选 ${state.selectedIds.size} 条`;
  els.totalText.textContent = `共 ${state.filtered.length || 0} 条`;
  renderPagination();
}

function currentPageRows() {
  const start = (state.page - 1) * state.pageSize;
  return state.filtered.slice(start, start + state.pageSize);
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  if (state.page > totalPages) state.page = totalPages;
  const pages = buildPageButtons(totalPages);
  els.pageList.innerHTML = pages
    .map((page) => (page === "..." ? `<span>...</span>` : `<button data-page="${page}" class="${page === state.page ? "active" : ""}">${page}</button>`))
    .join("");
  els.prevPage.disabled = state.page === 1;
  els.nextPage.disabled = state.page === totalPages;
  els.jumpPage.placeholder = String(state.page);
}

function buildPageButtons(totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = [1];
  if (state.page > 4) pages.push("...");
  const start = Math.max(2, state.page - 2);
  const end = Math.min(totalPages - 1, state.page + 2);
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (state.page < totalPages - 3) pages.push("...");
  pages.push(totalPages);
  return pages;
}

function setPage(page) {
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  const nextPage = Number.isFinite(page) ? Math.min(Math.max(1, page), totalPages) : state.page;
  state.page = nextPage;
  renderTable();
}

function onRowCheckChange(event) {
  const checkbox = event.target.closest(".row-check");
  if (!checkbox) return;
  const id = Number(checkbox.dataset.id);
  if (checkbox.checked) state.selectedIds.add(id);
  else state.selectedIds.delete(id);
  renderTable();
}

function onTableClick(event) {
  const detail = event.target.closest("[data-detail]");
  if (detail) {
    openDrawer(Number(detail.dataset.detail));
    return;
  }
  const process = event.target.closest("[data-process]");
  if (process) openProcessModal(Number(process.dataset.process));
}

function openDrawer(id) {
  const row = state.rows.find((item) => item.id === id);
  if (!row) return;
  els.drawerTitle.textContent = row.fba;
  els.drawerBody.innerHTML = [
    ["运单号", row.waybill],
    ["推送平台", row.platform],
    ["推单类型", row.pushType || "-"],
    ["渠道", row.channel],
    ["最新轨迹", row.latestTrack],
    ["轨迹更新时间", row.trackUpdatedAt],
    ["ETA", row.eta],
    ["ETD", row.etd],
    ["卖家是否可修改", row.editable],
    ["客户预计送达周", row.customerWeek || "-"],
    ["精算预计送达周", row.settlementWeek || "-"],
    ["截止修改时间", row.deadline || "-"],
    ["创建人", row.creator],
    ["处理状态", row.status],
    ["预警时间", row.warningAt]
  ]
    .map(([label, value]) => `<div class="info-row"><span>${label}</span><span>${value}</span></div>`)
    .join("");
  els.detailDrawer.classList.add("open");
  els.detailDrawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  els.detailDrawer.classList.remove("open");
  els.detailDrawer.setAttribute("aria-hidden", "true");
}

function openProcessModal(id) {
  const row = state.rows.find((item) => item.id === id);
  if (!row) return;
  state.activeRow = row;
  els.modalText.textContent = `将 ${row.fba} 标记为已处理，并保留备注。`;
  els.processRemark.value = "";
  els.modalBackdrop.hidden = false;
}

function closeModal() {
  els.modalBackdrop.hidden = true;
  state.activeRow = null;
}

function confirmProcess() {
  if (!state.activeRow) return;
  state.activeRow.status = "已处理";
  closeModal();
  renderTable();
  showToast("处理状态已更新");
}

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

async function exportRows() {
  const rows = state.selectedIds.size ? state.rows.filter((row) => state.selectedIds.has(row.id)) : [...state.filtered];
  if (!rows.length) {
    showToast("没有可导出的数据");
    return;
  }
  try {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("FBA货件管理");

    const headers = [
      "运单号", "预警来源", "推送平台", "标识", "fba 号码",
      "渠道", "最新轨迹", "轨迹更新时间", "ETA", "ETD", "卖家是否可修改",
      "实际送仓时间", "客户预计送达周", "参考预计送达周", "精算预计送达周",
      "截止修改时间", "创建人", "处理状态", "预警时间"
    ];

    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    ws.views = [{ state: "frozen", ySplit: 1 }];

    const widths = [20, 12, 12, 8, 17, 12, 15, 16, 10, 10, 13, 21, 17, 17, 17, 21, 14, 12, 21];
    widths.forEach((w, i) => ws.getColumn(i + 1).width = w);

    ws.getColumn(1).numFmt = "@";
    ws.getColumn(5).numFmt = "@";
    ws.getColumn(8).numFmt = "yyyy-MM-dd HH:mm:ss";
    ws.getColumn(9).numFmt = "yyyy-MM-dd";
    ws.getColumn(10).numFmt = "yyyy-MM-dd";
    ws.getColumn(12).numFmt = "yyyy-MM-dd HH:mm:ss";
    ws.getColumn(16).numFmt = "yyyy-MM-dd HH:mm:ss";
    ws.getColumn(19).numFmt = "yyyy-MM-dd HH:mm:ss";

    rows.forEach((row) => {
      ws.addRow([
        row.waybill, row.warningSource || null, row.platform || null,
        row.mark || null, row.fba, row.channel || null,
        row.latestTrack || null, parseDate(row.trackUpdatedAt),
        parseDate(row.eta), parseDate(row.etd), row.editable || null,
        parseDate(row.deliveredAt), row.customerWeek || null,
        row.referenceWeek || null, row.settlementWeek || null,
        parseDate(row.deadline), row.creator || null,
        row.status || null, parseDate(row.warningAt)
      ]);
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `FBA货件管理_${new Date().toISOString().slice(0, 10)}.xlsx`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast(`已导出 ${rows.length} 条数据`);
  } catch (e) {
    showToast("导出失败，请重试");
    console.error(e);
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 1800);
}
