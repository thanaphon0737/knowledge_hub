import { notFound } from 'next/navigation';
// Assume you have these server-side API functions defined
import { apiGetDocumentServer, apiGetFilesServer } from '@/lib/api-server';

// Define a type for the data this page needs
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
interface DocumentPageData {
  document: DocumentType; // Replace 'any' with your Document type
  files: FileType[];    // Replace 'any' with your File type
}

export async function getDocumentPageData(documentId: string): Promise<DocumentPageData> {
  console.log(`Fetching all data for document: ${documentId}`);

  // 1. Create an array of all the promises you want to run in parallel.
  const promises = [
    apiGetDocumentServer(documentId),      // Promise 1: Get document details
    apiGetFilesServer(documentId) // Promise 2: Get the list of files
  ];

  // 2. Use Promise.allSettled to wait for both to complete.
  // This will not throw an error if one of them fails.
  const results = await Promise.allSettled(promises);

  // 3. Process the results individually.
  const documentResult = results[0];
  const filesResult = results[1];

  // --- Handle the critical data (the document itself) ---
  if (documentResult.status === 'rejected') {
    // If we can't even get the main document, the page cannot be displayed.
    // We can re-throw the error or call notFound() to show the 404 page.
    console.error("Failed to fetch main document:", documentResult.reason);
    notFound();
  }

  // --- Handle the non-critical data (the files) ---
  let files: any[] = []; // Default to an empty array
  if (filesResult.status === 'fulfilled') {
    // If the API call was successful, use the data.
    files = filesResult.value;
  } else {
    // If the API call failed, we log the error but don't crash the page.
    // We just proceed with an empty array for the files.
    console.warn(`Could not fetch files for document ${documentId}:`, filesResult.reason.message);
  }

  // 4. Return the combined data.
  return {
    document: documentResult.value,
    files: files
  };
}