import { Project } from "./models/types";

export const mockProjects: Project[] = [
  // Проект 1
  {
    id: "1",
    name: "Проект 10796_T2",
    preparedBy: "Спасов А.",
    preparationDate: new Date().toISOString().split("T")[0],
    createdAt: "2025-06-10",
    locked: false, //можно редактировать
    approved: false,
    estimate: [
      {
        id: "1-1",
        section: "Отделочные работы",
        name: "Обои флизелиновые",
        costType: "Материалы",
        unit: "шт",
        plannedQuantity: 10,
        unitCost: 1500,
      },
      {
        id: "1-2",
        section: "Отделочные работы",
        name: "Покраска стен",
        costType: "Трудозатраты",
        unit: "м²",
        plannedQuantity: 45,
        unitCost: 300,
      },
    ],
    warehouse: [
      {
        id: "w1-1",
        projectId: "1",
        date: "2025-06-15",
        itemId: "1-1",
        actualQuantity: 8,
        comment: "Остаток на складе",
      },
    ],
  },
  // Проект 2
  {
    id: "2",
    name: "Проект 10700_MTC",
    preparedBy: "Спасов А.",
    preparationDate: new Date().toISOString().split("T")[0],
    createdAt: "2025-06-10",
    locked: false,
    approved: false,
    estimate: [
      {
        id: "2-1",
        section: "Конструкция",
        name: "ДСП 18мм",
        costType: "Материалы",
        unit: "шт",
        plannedQuantity: 5,
        unitCost: 3200,
      },
      {
        id: "2-2",
        section: "Освещение",
        name: "Светодиодная лента",
        costType: "Материалы",
        unit: "шт",
        plannedQuantity: 12,
        unitCost: 450,
      },
    ],
    warehouse: [
      {
        id: "w2-1",
        projectId: "2",
        date: "2025-07-05",
        itemId: "2-1",
        actualQuantity: 5,
        comment: "Полный расход",
      },
      {
        id: "w2-2",
        projectId: "2",
        date: "2025-07-06",
        itemId: "2-2",
        actualQuantity: 10,
        comment: "Частичный расход",
      },
    ],
  },
];
