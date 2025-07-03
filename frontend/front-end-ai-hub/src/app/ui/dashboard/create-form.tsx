import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

import { useState } from "react";
interface CreateFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description: string }) => void;
}

const CreateForm = ({ open, onClose, onCreate }: CreateFormProps) => {
  // This component now receives the 'open' state and control functions as props.
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");


  const handleCreateClick = async (e: any) => {
    onCreate({name,description});

    setName('');
    setDescription('');
    
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Document</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="doc-name"
          label="Document Name"
          type="text"
          fullWidth
          variant="standard"
          sx={{ mb: 2 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          id="doc-desc"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="standard"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreateClick} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default CreateForm;
