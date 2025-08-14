// src/models/types.ts
export interface EstimateItem {
  id: string;
  section: string;
  name: string;
  costType: CostType;
  unit: Unit;
  plannedQuantity: number | string;
  unitCost: number | string;
}

export interface WarehouseEntry {
  id: string;
  projectId: string;
  date: string;
  itemId: string;
  actualQuantity: number;
  comment: string;
}

export interface Project {
  id: string;
  name: string;
  preparedBy: string;
  preparationDate: string;
  createdAt: string;
  locked: boolean;
  estimate: EstimateItem[];
  warehouse: WarehouseEntry[];
  approved: boolean;
}

export type CostType = "Материалы" | "Аренда" | "Трудозатраты" | "Услуги";
export type Unit = "м²" | "м/п" | "шт" | "компл." | "чел/час";
