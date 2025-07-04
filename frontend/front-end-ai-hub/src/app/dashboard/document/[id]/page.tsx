// import React from "react";
import Button from "@mui/material/Button";
import DocumentDetailClientPage from "@/app/ui/dashboard/client-page";
// import { apiGetDocumentById, apiGetFileByDocumentId } from "@/services/api";
import { getDocumentById } from "@/lib/data";
import { apiGetDocumentById } from "@/services/api";
import { apiGetDocumentServer } from "@/lib/api-server";
// The component function should not be async
// The params prop is a plain object, not a promise
async function DocumentPageEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // const { id } = React.use(params); // Destructure id directly from params
  const { id } = await params;
  const document = await apiGetDocumentServer(id);
  // const initialFiles = await apiGetFileByDocumentId(id);
  // const document = await getDocumentById(id)

  return (
    <>
      {id}
      <h1>{document.name}</h1>
      <h1>{document.description}</h1>
      {/* <DocumentDetailClientPage
      documentId = {id}
      initialFiles={initialFiles.data}
      /> */}
    </>
  );
}

export default DocumentPageEdit;
