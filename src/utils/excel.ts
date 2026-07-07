import ExcelJS from "exceljs";
import type { Order } from "../store/store";
import { NATIONS, type Nation } from "../data/nations";

export type ExportScope =
  | "all"
  | "paid"
  | "pending"
  | "processing"
  | "delivered"
  | "range"
  | "nation"
  | "referral";

export type ExportOptions = {
  scope: ExportScope;
  startDate?: string;
  endDate?: string;
  nationId?: string;
  referralCode?: string;
};

function fmtMoney(n: number): string {
  return "₦" + n.toLocaleString("en-NG");
}

function productsCell(items: Order["items"]): string {
  return items.map((i) => `${i.name} x${i.quantity} - ${fmtMoney(i.price * i.quantity)}`).join("\n");
}

function totalQuantity(items: Order["items"]): number {
  return items.reduce((s, i) => s + i.quantity, 0);
}

function filterOrders(orders: Order[], opts: ExportOptions): Order[] {
  let list = [...orders];
  switch (opts.scope) {
    case "paid":
      list = list.filter((o) => o.paymentStatus === "Paid");
      break;
    case "pending":
      list = list.filter((o) => o.paymentStatus !== "Paid" || o.status === "Pending" || o.status === "Awaiting Payment");
      break;
    case "processing":
      list = list.filter((o) => o.status === "Processing");
      break;
    case "delivered":
      list = list.filter((o) => o.status === "Delivered");
      break;
    case "range":
      if (opts.startDate && opts.endDate) {
        const s = new Date(opts.startDate).getTime();
        const e = new Date(opts.endDate).getTime() + 24 * 60 * 60 * 1000;
        list = list.filter((o) => {
          const t = new Date(o.date).getTime();
          return t >= s && t < e;
        });
      }
      break;
    case "nation":
      if (opts.nationId) list = list.filter((o) => o.nationId === opts.nationId);
      break;
    case "referral":
      if (opts.referralCode) list = list.filter((o) => (o.referralCode || "").toUpperCase() === opts.referralCode!.toUpperCase());
      break;
  }
  if (opts.scope !== "nation" && opts.nationId) list = list.filter((o) => o.nationId === opts.nationId);
  if (opts.scope !== "referral" && opts.referralCode) list = list.filter((o) => (o.referralCode || "").toUpperCase() === opts.referralCode!.toUpperCase());
  return list;
}

const OXBLOOD = "FF4A0E16";
const LIGHTGRAY = "FFF5F5F5";
const WHITE = "FFFFFFFF";

// CHANGE 9: New Excel columns
const COLUMNS: { header: string; key: string; width: number }[] = [
  { header: "Date",                key: "date",            width: 20 },
  { header: "Order ID",            key: "orderId",         width: 18 },
  { header: "Customer Name",       key: "customerName",    width: 24 },
  { header: "Phone",               key: "phone",           width: 18 },
  { header: "Email",               key: "email",           width: 28 },
  { header: "Nation",              key: "nation",          width: 28 },
  { header: "Referral Code",       key: "referralCode",    width: 18 },
  { header: "Products",            key: "products",        width: 40 },
  { header: "Quantity",            key: "quantity",        width: 10 },
  { header: "Total Amount",        key: "total",           width: 16 },
  { header: "Delivery Method",     key: "deliveryMethod",  width: 18 },
  { header: "Pickup Station",      key: "pickupStation",   width: 28 },
  { header: "Shipping Fee",        key: "shippingFee",     width: 14 },
  { header: "Payment Method",      key: "paymentMethod",   width: 18 },
  { header: "Payment Status",      key: "paymentStatus",   width: 20 },
  { header: "Bank Proof URL",      key: "bankProofUrl",    width: 36 },
  { header: "Order Status",        key: "orderStatus",     width: 16 },
];

function styleHeaderRow(row: ExcelJS.Row) {
  row.height = 26;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE }, size: 11, name: "Calibri" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: OXBLOOD } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: OXBLOOD } },
      left: { style: "thin", color: { argb: OXBLOOD } },
      bottom: { style: "thin", color: { argb: OXBLOOD } },
      right: { style: "thin", color: { argb: OXBLOOD } },
    };
  });
}

function styleBodyRow(row: ExcelJS.Row, isAlt: boolean) {
  row.eachCell((cell) => {
    cell.font = { size: 10, name: "Calibri" };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = {
      top: { style: "hair", color: { argb: "FFE5E7EB" } },
      bottom: { style: "hair", color: { argb: "FFE5E7EB" } },
      left: { style: "hair", color: { argb: "FFE5E7EB" } },
      right: { style: "hair", color: { argb: "FFE5E7EB" } },
    };
    if (isAlt) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFAFAFA" } };
    }
  });
}

function buildOrdersSheet(workbook: ExcelJS.Workbook, orders: Order[], title: string) {
  const ws = workbook.addWorksheet("Orders", {
    views: [{ state: "frozen", ySplit: 3 }],
  });

  ws.mergeCells(1, 1, 1, COLUMNS.length);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = `Diamond Body — ${title}`;
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: OXBLOOD } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  ws.getRow(1).height = 28;

  ws.mergeCells(2, 1, 2, COLUMNS.length);
  const subCell = ws.getCell(2, 1);
  subCell.value = `Generated ${new Date().toLocaleString("en-NG")} • Total Records: ${orders.length}`;
  subCell.font = { name: "Calibri", size: 10, italic: true, color: { argb: "FF6B7280" } };
  subCell.alignment = { vertical: "middle", horizontal: "left" };

  ws.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width })) as any;
  const headerRow = ws.getRow(3);
  COLUMNS.forEach((c, i) => {
    headerRow.getCell(i + 1).value = c.header;
  });
  styleHeaderRow(headerRow);

  orders.forEach((o, idx) => {
    const r = ws.addRow({
      date:           new Date(o.date).toLocaleString("en-NG"),
      orderId:        o.id,
      customerName:   o.customerName,
      phone:          o.phone,
      email:          o.email,
      nation:         o.nationName || "—",
      referralCode:   o.referralCode || "—",
      products:       productsCell(o.items),
      quantity:       totalQuantity(o.items),
      total:          fmtMoney(o.total),
      deliveryMethod: o.deliveryMethod,
      pickupStation:  o.pickupStationName || "—",
      shippingFee:    fmtMoney(o.shippingFee),
      paymentMethod:  o.paymentMethod,
      paymentStatus:  o.paymentStatus,
      bankProofUrl:   o.bankProofUrl || "—",
      orderStatus:    o.status,
    });
    styleBodyRow(r, idx % 2 === 1);

    if (o.bankProofUrl) {
      const cell = r.getCell("bankProofUrl");
      cell.value = { text: "View Proof", hyperlink: o.bankProofUrl, tooltip: o.bankProofUrl } as any;
      cell.font = { color: { argb: "FF1D4ED8" }, underline: true, size: 10, name: "Calibri" };
    }

    const status = o.status;
    const statusCell = r.getCell("orderStatus");
    statusCell.font = { bold: true, size: 10, name: "Calibri", color: { argb: WHITE } };
    statusCell.alignment = { vertical: "middle", horizontal: "center" };
    statusCell.fill = {
      type: "pattern", pattern: "solid",
      fgColor: { argb:
        status === "Delivered" ? "FF059669" :
        status === "Shipped"   ? "FF2563EB" :
        status === "Processing"? "FF7C3AED" :
        status === "Paid"      ? "FF10B981" :
        status === "Cancelled" || status === "Refunded" ? "FFDC2626" :
        "FFD97706" }
    };

    const payCell = r.getCell("paymentStatus");
    payCell.font = { bold: true, size: 10, name: "Calibri", color: { argb: WHITE } };
    payCell.alignment = { vertical: "middle", horizontal: "center" };
    payCell.fill = {
      type: "pattern", pattern: "solid",
      fgColor: { argb:
        o.paymentStatus === "Paid" ? "FF059669" :
        o.paymentStatus === "Awaiting Verification" ? "FFD97706" :
        o.paymentStatus === "Failed" ? "FFDC2626" :
        "FF6B7280" }
    };

    r.height = Math.max(18, 16 * Math.min(o.items.length, 4));
  });

  ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: COLUMNS.length } };
}

function buildSummarySheet(workbook: ExcelJS.Workbook, orders: Order[]) {
  const ws = workbook.addWorksheet("Summary");
  ws.columns = [
    { width: 32 }, { width: 22 }, { width: 22 }, { width: 22 },
  ] as any;

  let row = 1;
  const titleCell = ws.getCell(row, 1);
  ws.mergeCells(row, 1, row, 4);
  titleCell.value = "Diamond Body — Orders Summary";
  titleCell.font = { name: "Calibri", size: 18, bold: true, color: { argb: OXBLOOD } };
  ws.getRow(row).height = 30;
  row += 2;

  const total = orders.reduce((s, o) => s + o.total, 0);
  const paid = orders.filter((o) => o.paymentStatus === "Paid");
  const pending = orders.filter((o) => o.paymentStatus !== "Paid");
  const processing = orders.filter((o) => o.status === "Processing");
  const delivered = orders.filter((o) => o.status === "Delivered");
  const paidRevenue = paid.reduce((s, o) => s + o.total, 0);

  const totalsHeader = ws.getRow(row);
  ws.mergeCells(row, 1, row, 4);
  totalsHeader.getCell(1).value = "Overview";
  totalsHeader.getCell(1).font = { bold: true, color: { argb: WHITE }, size: 12 };
  totalsHeader.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: OXBLOOD } };
  totalsHeader.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
  totalsHeader.height = 22;
  row++;

  const totals: [string, string | number][] = [
    ["Total Revenue (gross)", fmtMoney(total)],
    ["Total Revenue (paid only)", fmtMoney(paidRevenue)],
    ["Total Orders", orders.length],
    ["Total Paid Orders", paid.length],
    ["Total Pending Orders", pending.length],
    ["Total Processing Orders", processing.length],
    ["Total Delivered Orders", delivered.length],
  ];
  totals.forEach(([k, v], i) => {
    const r = ws.getRow(row);
    r.getCell(1).value = k;
    r.getCell(1).font = { bold: true, size: 11 };
    r.getCell(2).value = v;
    r.getCell(2).font = { size: 11, color: { argb: OXBLOOD } };
    if (i % 2 === 1) {
      r.getCell(1).fill = r.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHTGRAY } };
    }
    r.eachCell((c) => { c.alignment = { vertical: "middle", horizontal: "left" }; });
    row++;
  });
  row++;

  // Top selling products
  const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of orders) for (const it of o.items) {
    const c = productMap.get(it.productId) || { name: it.name, qty: 0, revenue: 0 };
    c.qty += it.quantity;
    c.revenue += it.price * it.quantity;
    productMap.set(it.productId, c);
  }
  const topProducts = [...productMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);

  ws.mergeCells(row, 1, row, 4);
  const tpHeader = ws.getRow(row);
  tpHeader.getCell(1).value = "Top Selling Products";
  tpHeader.getCell(1).font = { bold: true, color: { argb: WHITE }, size: 12 };
  tpHeader.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: OXBLOOD } };
  tpHeader.height = 22;
  row++;
  const tpCols = ws.getRow(row);
  ["#", "Product", "Quantity Sold", "Revenue"].forEach((h, i) => {
    tpCols.getCell(i + 1).value = h;
    tpCols.getCell(i + 1).font = { bold: true, size: 10 };
    tpCols.getCell(i + 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHTGRAY } };
  });
  row++;
  topProducts.forEach((p, i) => {
    const r = ws.getRow(row);
    r.getCell(1).value = i + 1;
    r.getCell(2).value = p.name;
    r.getCell(3).value = p.qty;
    r.getCell(4).value = fmtMoney(p.revenue);
    row++;
  });
  row++;

  // Revenue by NATION
  const nationMap = new Map<string, { name: string; orders: number; revenue: number }>();
  for (const o of orders) {
    const key = o.nationId || "Unassigned";
    const name = o.nationName || "Unassigned";
    const c = nationMap.get(key) || { name, orders: 0, revenue: 0 };
    c.orders += 1;
    c.revenue += o.total;
    nationMap.set(key, c);
  }

  ws.mergeCells(row, 1, row, 4);
  const lrHeader = ws.getRow(row);
  lrHeader.getCell(1).value = "Revenue by Nation";
  lrHeader.getCell(1).font = { bold: true, color: { argb: WHITE }, size: 12 };
  lrHeader.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: OXBLOOD } };
  lrHeader.height = 22;
  row++;
  const lrCols = ws.getRow(row);
  ["Nation ID", "Nation Name", "Orders", "Revenue"].forEach((h, i) => {
    lrCols.getCell(i + 1).value = h;
    lrCols.getCell(i + 1).font = { bold: true, size: 10 };
    lrCols.getCell(i + 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHTGRAY } };
  });
  row++;
  [...nationMap.entries()].sort((a, b) => b[1].revenue - a[1].revenue).forEach(([id, v]) => {
    const r = ws.getRow(row);
    r.getCell(1).value = id;
    r.getCell(2).value = v.name;
    r.getCell(3).value = v.orders;
    r.getCell(4).value = fmtMoney(v.revenue);
    row++;
  });
  row++;

  // Payment Method Breakdown
  const pmMap = new Map<string, { count: number; revenue: number }>();
  for (const o of orders) {
    const c = pmMap.get(o.paymentMethod) || { count: 0, revenue: 0 };
    c.count += 1;
    c.revenue += o.total;
    pmMap.set(o.paymentMethod, c);
  }
  ws.mergeCells(row, 1, row, 4);
  const pmHeader = ws.getRow(row);
  pmHeader.getCell(1).value = "Payment Method Breakdown";
  pmHeader.getCell(1).font = { bold: true, color: { argb: WHITE }, size: 12 };
  pmHeader.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: OXBLOOD } };
  pmHeader.height = 22;
  row++;
  const pmCols = ws.getRow(row);
  ["Method", "Orders", "Revenue", "% of Orders"].forEach((h, i) => {
    pmCols.getCell(i + 1).value = h;
    pmCols.getCell(i + 1).font = { bold: true, size: 10 };
    pmCols.getCell(i + 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHTGRAY } };
  });
  row++;
  [...pmMap.entries()].forEach(([k, v]) => {
    const r = ws.getRow(row);
    r.getCell(1).value = k;
    r.getCell(2).value = v.count;
    r.getCell(3).value = fmtMoney(v.revenue);
    r.getCell(4).value = orders.length ? ((v.count / orders.length) * 100).toFixed(1) + "%" : "0%";
    row++;
  });
  row++;

  // Delivery Method Breakdown
  const dmMap = new Map<string, { count: number; revenue: number }>();
  for (const o of orders) {
    const c = dmMap.get(o.deliveryMethod) || { count: 0, revenue: 0 };
    c.count += 1;
    c.revenue += o.total;
    dmMap.set(o.deliveryMethod, c);
  }
  ws.mergeCells(row, 1, row, 4);
  const dmHeader = ws.getRow(row);
  dmHeader.getCell(1).value = "Delivery Method Breakdown";
  dmHeader.getCell(1).font = { bold: true, color: { argb: WHITE }, size: 12 };
  dmHeader.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: OXBLOOD } };
  dmHeader.height = 22;
  row++;
  const dmCols = ws.getRow(row);
  ["Method", "Orders", "Revenue"].forEach((h, i) => {
    dmCols.getCell(i + 1).value = h;
    dmCols.getCell(i + 1).font = { bold: true, size: 10 };
    dmCols.getCell(i + 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHTGRAY } };
  });
  row++;
  [...dmMap.entries()].forEach(([k, v]) => {
    const r = ws.getRow(row);
    r.getCell(1).value = k;
    r.getCell(2).value = v.count;
    r.getCell(3).value = fmtMoney(v.revenue);
    row++;
  });
}

function downloadBlob(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function scopeTitle(opts: ExportOptions, nations: Nation[] = NATIONS): string {
  switch (opts.scope) {
    case "paid":       return "Paid Orders";
    case "pending":    return "Pending Orders";
    case "processing": return "Processing Orders";
    case "delivered":  return "Delivered Orders";
    case "range":      return `Orders ${opts.startDate || ""} → ${opts.endDate || ""}`;
    case "nation": {
      const n = nations.find((x) => x.id === opts.nationId);
      return `Orders for ${n ? n.name + " (" + n.id + ")" : opts.nationId}`;
    }
    case "referral":   return `Orders by Referral Code ${opts.referralCode}`;
    default:           return "All Orders";
  }
}

export async function exportOrdersExcel(
  orders: Order[],
  opts: ExportOptions = { scope: "all" },
  nations: Nation[] = NATIONS
): Promise<{ filename: string; count: number }> {
  const filtered = filterOrders(orders, opts);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Diamond Body Admin";
  workbook.lastModifiedBy = "Diamond Body Admin";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.company = "Diamond Body Wellness Ltd";

  buildOrdersSheet(workbook, filtered, scopeTitle(opts, nations));
  buildSummarySheet(workbook, filtered);

  const buffer = await workbook.xlsx.writeBuffer();
  const today = new Date().toISOString().slice(0, 10);
  const filename = `DiamondBody_Orders_${today}.xlsx`;
  downloadBlob(buffer as ArrayBuffer, filename);

  return { filename, count: filtered.length };
}
