"use client";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Add, Create } from "@mui/icons-material";
import { useState, useEffect } from "react";
import CreateForm from "./create-form";
import { apiCreateDocuments, apiGetDocuments } from "@/services/api";
import Link from "next/link";
type Document = {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  updated_at: string;
};
interface CreateDocumentData {
  name: string;
  description: string;
}
function DocumentCard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const fetchDocs = async () => {
    try {
      const { data } = await apiGetDocuments();
      console.log(data.data);
      data.data.sort(
        (a: Document, b: Document) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      setDocuments(data.data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDocs();
  }, []);

  const handleCreateDocument = async (data: CreateDocumentData) => {
    console.log("Creating new Document...", data);
    try {
      await apiCreateDocuments(data);
      fetchDocs();
    } catch (err: any) {
      console.error(err);
    }
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Document
        </Button>
      </Box>
      <Grid container spacing={3}>
        {loading
          ? Array.from(new Array(3)).map((_, index) => (
              <Grid key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h5">
                      <CircularProgress />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          : documents.map((doc) => (
              <Grid key={doc.id}>
                <Link href={`/dashboard/document/${doc.id}/edit`}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {doc.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {doc.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ borderTop: "1px solid #eee", px: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {doc.fileCount} files
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Updated: {new Date(doc.updated_at).toLocaleDateString()}
                      </Typography>
                    </CardActions>
                  </Card>
                </Link>
              </Grid>
            ))}
      </Grid>
      <CreateForm
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateDocument}
      />
    </>
  );
}
export default DocumentCard;
