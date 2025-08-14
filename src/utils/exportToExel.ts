import { format } from "date-fns";
import { Project, EstimateItem, CostType } from "../models/types";
import * as XLSX from "xlsx";

// Общие константы и утилиты
const COST_TYPE_LABELS: Record<CostType, string> = {
  //если отчет в эксель нужен в работе,то доработать для корректной выгрузки
  Материалы: "Материалы",
  Аренда: "Аренда",
  Трудозатраты: "Трудозатраты",
  Услуги: "Услуги",
};

const CURRENCY_FORMATTER = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 2,
});

// Основная функция экспорта
export const exportProjectToExcel = async (project: Project) => {
  try {
    const XLSX = await import("xlsx");

    // 1. Подготовка данных
    const { estimateSheetData, warehouseSheetData, totals, warehouseTotals } =
      prepareExportData(project);

    // 2. Создание книги Excel
    const workbook = XLSX.utils.book_new();

    // 3. Формирование листов
    createEstimateSheet(workbook, project, estimateSheetData, totals);
    createWarehouseSheet(
      workbook,
      project,
      warehouseSheetData,
      warehouseTotals
    );

    // 4. Сохранение файла
    XLSX.writeFile(
      workbook,
      `Проект_${project.name}_${format(new Date(), "yyyyMMdd")}.xlsx`
    );
  } catch (error) {
    console.error("Ошибка при экспорте в Excel:", error);
    throw error;
  }
};

// Подготовка данных для экспорта
const prepareExportData = (project: Project) => {
  const estimateData = project.estimate.map((item, index) => ({
    "№": index + 1,
    Раздел: item.section,
    Наименование: item.name,
    "Тип затрат": COST_TYPE_LABELS[item.costType],
    "Ед. изм.": item.unit,
    Количество: Number(item.plannedQuantity),
    "Цена за ед.": formatCurrency(item.unitCost),
    Стоимость: formatCurrency(
      Number(item.plannedQuantity) * Number(item.unitCost)
    ),
    Примечание: "",
  }));

  const warehouseData = project.warehouse.map((entry) => {
    const item = project.estimate.find((i) => i.id === entry.itemId);
    return {
      Дата: format(new Date(entry.date), "dd.MM.yyyy"),
      Материал: item?.name || "Неизвестный материал",
      Количество: entry.actualQuantity,
      Стоимость: item
        ? formatCurrency(entry.actualQuantity * Number(item.unitCost))
        : "0 ₽",
      Комментарий: entry.comment,
    };
  });

  const totals = calculateEstimateTotals(project.estimate);
  const warehouseTotals = calculateWarehouseTotals(project);

  return {
    estimateSheetData: estimateData,
    warehouseSheetData: warehouseData,
    totals,
    warehouseTotals,
  };
};

// Создание листа сметы
const createEstimateSheet = (
  workbook: any,
  project: Project,
  data: any[],
  totals: any
) => {
  const sheet = XLSX.utils.json_to_sheet([
    { A1: `Проект: ${project.name}` },
    { A2: `Сметчик: ${project.preparedBy}` },
    {
      A3: `Дата составления: ${format(
        new Date(project.preparationDate),
        "dd.MM.yyyy"
      )}`,
    },
    {},
    ...data,
    {},
    { A: "ИТОГО по смете:" },
    { B: `Сумма без НДС: ${formatCurrency(totals.totalWithoutVAT)}` },
    { B: `НДС 20%: ${formatCurrency(totals.vat)}` },
    { B: `Всего с НДС: ${formatCurrency(totals.totalWithVAT)}` },
    { B: `Резерв (5%): ${formatCurrency(totals.contingency)}` },
  ]);

  sheet["!cols"] = [
    { wch: 5 },
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 8 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(workbook, sheet, "Смета");
};

// Создание листа склада
const createWarehouseSheet = (
  workbook: any,
  project: Project,
  data: any[],
  totals: any
) => {
  const sheet = XLSX.utils.json_to_sheet([
    { A1: `Проект: ${project.name}` },
    { A2: `Дата выгрузки: ${format(new Date(), "dd.MM.yyyy")}` },
    {},
    ...data,
    {},
    { A: "ИТОГО по складу:" },
    { B: `Общая стоимость: ${formatCurrency(totals.total)}` },
  ]);

  sheet["!cols"] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 10 },
    { wch: 12 },
    { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(workbook, sheet, "Склад");
};

// Форматирование валюты
const formatCurrency = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return CURRENCY_FORMATTER.format(num);
};

// Расчеты
export const calculateEstimateTotals = (estimate: EstimateItem[]) => {
  const sums = estimate.reduce(
    (acc, item) => {
      const cost = Number(item.plannedQuantity) * Number(item.unitCost);
      acc[item.costType] = (acc[item.costType] || 0) + cost;
      acc.totalWithoutVAT += cost;
      return acc;
    },
    {
      totalWithoutVAT: 0,
      Материалы: 0,
      Аренда: 0,
      Трудозатраты: 0,
      Услуги: 0,
    }
  );

  return {
    ...sums,
    vat: sums.totalWithoutVAT * 0.2,
    totalWithVAT: sums.totalWithoutVAT * 1.2,
    contingency: sums.totalWithoutVAT * 0.05,
  };
};

export const calculateWarehouseTotals = (project: Project) => {
  return project.warehouse.reduce(
    (acc, entry) => {
      const item = project.estimate.find((i) => i.id === entry.itemId);
      if (item) {
        acc.total += entry.actualQuantity * Number(item.unitCost);
      }
      return acc;
    },
    { total: 0 }
  );
};
