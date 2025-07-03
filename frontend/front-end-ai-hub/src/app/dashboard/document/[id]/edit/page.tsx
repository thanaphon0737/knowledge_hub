"use client";

import { useState, useEffect } from "react";
import { apiGetDocumentById, apiGetFileByDocumentId } from "@/services/api";

// The component function should not be async
// The params prop is a plain object, not a promise
function DocumentPageEdit({ params }: { params: { id: string } }) {
  const { id } = params; // Destructure id directly from params

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
      console.log(docResponse.data)

      console.log(filesResponse.data)
      if(!docResponse){
        console.error('no doc to fetch')
        return
      }
      setDocument(docResponse.data);
      if(!filesResponse){
        console.error('no file to fetch')
      }
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
        {/* You can now use the 'document' and 'files' state to render your UI */}
        {document && <pre>{JSON.stringify(document, null, 2)}</pre>}
        {files.data.length > 0 && files.data.map(file => (
            
            <pre>{JSON.stringify(file, null, 2)}</pre>
        ))}
      </div>
    </>
  );
}

export default DocumentPageEdit;
