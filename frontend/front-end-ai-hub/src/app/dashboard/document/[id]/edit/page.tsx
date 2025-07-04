"use client";

import { useState, useEffect } from "react";
import React from "react";
import { apiGetDocumentById, apiGetFileByDocumentId } from "@/services/api";

// The component function should not be async
// The params prop is a plain object, not a promise
function DocumentPageEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params); // Destructure id directly from params

  // It's good practice to initialize state with a more specific type, like null for objects
  const [document, setDocument] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [isModalOpen, setIsModalOpen] = useState(false); // This state was unused
  const fetchDetails = async () => {
    setLoading(true);
    try {
      const docResponse = await apiGetDocumentById(id);
      const filesResponse = await apiGetFileByDocumentId(id);
      setDocument(docResponse.data)
      setFiles(filesResponse.data);
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

  // It's helpful to show a loading state to the user
  if (loading) {
    return <div>Loading document...</div>;
  }

  return (
    <>
      <div>
        <h1>Editing Document ID: {id}</h1>
        <pre>{JSON.stringify(document, null, 2)}</pre>
        <pre>{JSON.stringify(files,null,2)}</pre>
        {/* {document && document.map(doc => (
          <div key={doc.id}>
            
            <div>{doc.name}</div>
            <div>{doc.description}</div>
          </div>
        ))} */}
        {files.length}

      </div>
    </>
  );
}

export default DocumentPageEdit;
