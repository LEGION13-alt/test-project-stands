import { Project } from "../models/types";
import { EstimateItem } from "../models/types";

export const calculateTotals = (project: Project) => {
  const materialSum = project.estimate
    .filter((item) => item.costType === "Материалы")
    .reduce(
      (sum, item) => sum + Number(item.plannedQuantity) * Number(item.unitCost),
      0
    );

  const laborSum = project.estimate
    .filter((item) => item.costType === "Трудозатраты")
    .reduce(
      (sum, item) => sum + Number(item.plannedQuantity) * Number(item.unitCost),
      0
    );

  const totalWithoutVAT = project.estimate.reduce(
    (sum, item) => sum + Number(item.plannedQuantity) * Number(item.unitCost),
    0
  );

  const vat = totalWithoutVAT * 0.2;
  const totalWithVAT = totalWithoutVAT + vat;
  const contingency = totalWithoutVAT * 0.05;

  return {
    materialSum,
    laborSum,
    totalWithoutVAT,
    vat,
    totalWithVAT,
    contingency,
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

export const calculateEstimateTotals = (estimate: EstimateItem[]) => {
  const materialSum = estimate
    .filter((item) => item.costType === "Материалы")
    .reduce(
      (sum, item) => sum + Number(item.plannedQuantity) * Number(item.unitCost),
      0
    );

  const rentSum = estimate
    .filter((item) => item.costType === "Аренда")
    .reduce(
      (sum, item) => sum + Number(item.plannedQuantity) * Number(item.unitCost),
      0
    );

  const laborSum = estimate
    .filter((item) => item.costType === "Трудозатраты")
    .reduce(
      (sum, item) => sum + Number(item.plannedQuantity) * Number(item.unitCost),
      0
    );

  const servicesSum = estimate
    .filter((item) => item.costType === "Услуги")
    .reduce(
      (sum, item) => sum + Number(item.plannedQuantity) * Number(item.unitCost),
      0
    );

  const totalWithoutVAT = materialSum + rentSum + laborSum + servicesSum;
  const vat = totalWithoutVAT * 0.2;
  const totalWithVAT = totalWithoutVAT + vat;
  const contingency = totalWithoutVAT * 0.05;

  return {
    materialSum,
    rentSum,
    laborSum,
    servicesSum,
    totalWithoutVAT,
    vat,
    totalWithVAT,
    contingency,
  };
};
