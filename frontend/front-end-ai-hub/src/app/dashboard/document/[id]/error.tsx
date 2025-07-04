'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@mui/material'; // Example with MUI

export default function DocumentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Something went wrong!</h2>
      <p>{error.message || "An unexpected error occurred while fetching the document."}</p>
      <Button
        variant="contained"
        onClick={
          // Attempt to re-render the segment by calling reset()
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}