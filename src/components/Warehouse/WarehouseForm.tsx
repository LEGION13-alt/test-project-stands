import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { format } from "date-fns";
import { Project } from "../../models/types";

interface WarehouseFormProps {
  project: Project;
  onSave: (entry: {
    projectId: string;
    date: string;
    itemId: string;
    actualQuantity: number;
    comment: string;
  }) => void;
  onCancel: () => void;
}

const WarehouseForm: React.FC<WarehouseFormProps> = ({
  project,
  onSave,
  onCancel,
}) => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState<string>(""); // Изменено на string
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSave({
      projectId: project.id,
      date,
      itemId,
      actualQuantity: Number(quantity) || 0, // Преобразуем в число при сохранении
      comment,
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только цифры и пустую строку
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setQuantity(value);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onCancel}
      fullScreen={window.innerWidth < 600}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Добавить складское списание</DialogTitle>
      <DialogContent>
        <TextField
          label="Дата"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth sx={{ marginTop: 2, marginBottom: 2 }}>
          <InputLabel sx={{ marginTop: -1 }}>Материал</InputLabel>
          <Select
            value={itemId}
            onChange={(e) => setItemId(e.target.value as string)}
            label="Материал"
          >
            {project.estimate.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name} ({item.section})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Количество"
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          fullWidth
          margin="normal"
          inputProps={{ min: 0 }}
        />

        <TextField
          label="Комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Отмена</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!itemId || !quantity || Number(quantity) <= 0}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WarehouseForm;
