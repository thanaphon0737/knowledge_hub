"use client";

import { apiCreateFileWithUrl, apiCreateFilewithPdf } from "@/services/api";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  onUploadSuccess: () => void;
}
function UploadModal({
  open,
  onClose,
  documentId,
  onUploadSuccess,
}: UploadModalProps) {
  // State for the active tab ('upload' or 'url')
  const [activeTab, setActiveTab] = useState("upload");

  // State for each input type
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");

  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    setError(""); // Clear errors when switching tabs
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (activeTab === "upload") {
        if (!selectedFile) {
          setError("Please select a file first.");
          setIsLoading(false);
          return;
        }
        await apiCreateFilewithPdf(documentId, selectedFile);
      } else {
        // activeTab === 'url'
        if (!sourceUrl || !sourceUrl.startsWith("http")) {
          setError("Please enter a valid URL.");
          setIsLoading(false);
          return;
        }
        await apiCreateFileWithUrl(documentId, sourceUrl);
      }

      // If successful, call the callback and close the modal
      onUploadSuccess();
      handleClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Source</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="source type tabs"
            >
              <Tab label="Upload File" value="upload" />
              <Tab label="Add from URL" value="url" />
            </Tabs>
          </Box>

          {/* Conditional rendering based on the active tab */}
          {activeTab === "upload" && (
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" component="label" fullWidth>
                Choose File
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setSelectedFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </Button>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Box>
          )}

          {activeTab === "url" && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Enter URL"
                variant="outlined"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </Box>
          )}

          {isLoading && <LinearProgress sx={{ mt: 2 }} />}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              isLoading ||
              (activeTab === "upload" && !selectedFile) ||
              (activeTab === "url" && !sourceUrl)
            }
          >
            {isLoading
              ? "Processing..."
              : activeTab === "upload"
              ? "Upload"
              : "Add URL"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default UploadModal;
