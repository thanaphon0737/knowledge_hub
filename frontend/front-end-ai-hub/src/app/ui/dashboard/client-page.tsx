"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import {
  apiGetDocumentById,
  apiGetFileByDocumentId,
  apiQueryQuestion,
} from "@/services/api";
import {
  Card,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  CheckCircle,
  HourglassTop,
  Error,
  FilePresent,
  Link as LinkIcon,
} from "@mui/icons-material";
import UploadModal from "@/app/ui/dashboard/files/upload-modal";

type DocumentType = {
  id: string;
  name: string;
  description?: string;
  // Add other properties as needed
};

// Define a type for your file object
type FileType = {
  id: string;
  file_name: string;
  source_type: string;
  processing_status: string;
  // Add other properties as needed
};
interface DocumentClientPageProps {
  documentId: string;
  initialDoc: DocumentType|null;
  initialFiles: FileType[]|null;
}

function DocumentDetailClientPage({
  documentId,
  initialDoc,
  initialFiles,
}: DocumentClientPageProps) {
  const id = documentId;
  // The 'files' state is now initialized with data from the server.
  // Define a type for your document object

  const [document, setDocument] = useState<DocumentType | null>(initialDoc);
  const [files, setFiles] = useState<FileType[]>(initialFiles);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const fetchDetails = async () => {
    setLoading(true);
    try {
      // const docResponse = await apiGetDocumentById(id);
      // const filesResponse = await apiGetFileByDocumentId(id);
      const promises = [apiGetDocumentById(id), apiGetFileByDocumentId(id)];
      const result = await Promise.allSettled(promises);
      if (result[0].status === "fulfilled") {
        setDocument(result[0].value.data.data);
      } else {
        console.error("Failed to fetch document:", result[0].reason);
      }

      if (result[1].status === "fulfilled") {
        setFiles(result[1].value.data.data);
      } else {
        console.error("Failed to fetch files:", result[1].reason);
      }
    } catch (error) {
      console.error("Failed to fetch document details", error);
      // Handle error state here, e.g., show a notification
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // If there's no id, don't try to fetch
    if (!id) return;

    // Define the async data fetching function inside useEffect

    fetchDetails();
  }, [id]); // The dependency array ensures this effect runs again if the id changes
  const handleUploadSuccess = () => {
    console.log("New source added! Calling router.refresh()...");
    // This now works as expected! It tells Next.js to re-run the
    // parent Server Component, which re-fetches the data and passes
    // the new 'initialFiles' prop down to this component.
    router.refresh();
  };
  // It's helpful to show a loading state to the user
  if (loading) {
    return <div>Loading document...</div>;
  }

  async function handleQuery(e: any) {
    e.preventDefault();
    try {
      const result = await apiQueryQuestion(query);
      console.log("answer from AI:", result);
      setAnswer(result.data);
      router.refresh();
    } catch (err: any) {
      console.error(err);
    }
  }
  type StatusChipProps = {
    status: "READY" | "PROCESSING" | "ERROR" | "PENDING" | string;
  };

  const StatusChip = ({ status }: StatusChipProps) => {
    const statusMap: Record<
      "READY" | "PROCESSING" | "ERROR" | "PENDING",
      {
        label: string;
        icon: React.ReactElement;
        color: "success" | "warning" | "error" | "default";
      }
    > = {
      READY: { label: "Ready", icon: <CheckCircle />, color: "success" },
      PROCESSING: {
        label: "Processing",
        icon: <HourglassTop />,
        color: "warning",
      },
      ERROR: { label: "Error", icon: <Error />, color: "error" },
      PENDING: { label: "Pending", icon: <HourglassTop />, color: "default" },
    };
    const currentStatus =
      statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
    return (
      <Chip
        icon={currentStatus.icon}
        label={currentStatus.label}
        color={currentStatus.color}
        size="small"
      />
    );
  };
  return (
    <>
      <Button onClick={() => router.back()} sx={{ mb: 2 }}>
        &larr; Back to Dashboard
      </Button>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {document?.name}
            </Typography>
            <Typography color="text.secondary">
              {document?.description}
            </Typography>
          </Box>
        )}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Source
        </Button>
      </Box>
      <Card>
        <List>
          {loading ? (
            <ListItem>
              <CircularProgress />
            </ListItem>
          ) : (
            files.map((file) => (
              <ListItem
                key={file.id}
                secondaryAction={<StatusChip status={file.processing_status} />}
              >
                <ListItemIcon>
                  {file.source_type === "upload" ? (
                    <FilePresent />
                  ) : (
                    <LinkIcon />
                  )}
                </ListItemIcon>
                <ListItemText primary={file.file_name} />
              </ListItem>
            ))
          )}
        </List>
      </Card>
      <UploadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        documentId={id}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}
export default DocumentDetailClientPage;
