import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";
import { Project } from "../../models/types";

interface ReportTableProps {
  project: Project;
}

const ReportTable: React.FC<ReportTableProps> = ({ project }) => {
  const reportData = project.estimate.map((item) => {
    const totalUsed = project.warehouse
      .filter((entry) => entry.itemId === item.id)
      .reduce((sum, entry) => sum + entry.actualQuantity, 0);

    const plannedQuantity = Number(item.plannedQuantity);
    const unitCost = Number(item.unitCost);

    const plannedSum = plannedQuantity * unitCost;
    const actualSum = totalUsed * unitCost;

    return {
      ...item,
      totalUsed,
      differenceQty: plannedQuantity - totalUsed,
      plannedSum,
      actualSum,
      differenceSum: plannedSum - actualSum,
    };
  });

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: "100%",
        overflowX: "auto",
        "& .MuiTableCell-root": {
          padding: { xs: "8px", sm: "16px" },
          whiteSpace: "nowrap",
        },
      }}
    >
      <Table sx={{ minWidth: 800 }}>
        <TableHead sx={{ backgroundColor: "rgb(245, 245, 245)" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Наименование</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>План (кол-во)</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Факт (кол-во)</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Разница</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>План (сумма)</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Факт (сумма)</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Разница</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.plannedQuantity}</TableCell>
              <TableCell>{item.totalUsed}</TableCell>
              <TableCell
                style={{
                  color: item.differenceQty < 0 ? "red" : "green",
                  fontWeight: "bold",
                }}
              >
                {item.differenceQty}
              </TableCell>
              <TableCell>{item.plannedSum.toFixed(2)} руб.</TableCell>
              <TableCell>{item.actualSum.toFixed(2)} руб.</TableCell>
              <TableCell
                style={{
                  color: item.differenceSum < 0 ? "red" : "green",
                  fontWeight: "bold",
                }}
              >
                {item.differenceSum.toFixed(2)} руб.
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReportTable;
