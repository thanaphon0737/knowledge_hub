// import React from "react";
import Button from "@mui/material/Button";
import DocumentDetailClientPage from "@/app/ui/dashboard/client-page";
import { getDocumentPageData } from "@/lib/data-server";
// The component function should not be async
// The params prop is a plain object, not a promise
async function DocumentPageEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // const { id } = React.use(params); // Destructure id directly from params
  const { id } = await params;
  const {document,files} = await getDocumentPageData(id);
  
  

  return (
    <>
      <DocumentDetailClientPage
      documentId = {id}
      initialDoc={document}
      initialFiles={files}
      />
    </>
  );
}

export default DocumentPageEdit;
