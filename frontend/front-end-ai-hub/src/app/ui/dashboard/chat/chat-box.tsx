import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { apiQueryQuestion } from "@/services/api";
import { TextField, Typography } from "@mui/material";
function chatBox() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  async function handleQuery(e: any) {
    e.preventDefault();
    try {
      const result = await apiQueryQuestion(query);
      console.log("answer from AI:", result);
      setAnswer(result.data);
      
    } catch (err: any) {
      console.error(err);
    }
  }
  return (
    <>
      <Box component="form" onSubmit={handleQuery}>
        <TextField
          id="query"
          label="ask here ?"
          name="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" variant="contained">
          question
        </Button>
        <Typography variant="h5" component="h1" fontWeight="bold">
          answer
        </Typography>
        <Typography color="text.secondary">
          <pre>{JSON.stringify(answer, null, 2)}</pre>
        </Typography>
      </Box>
    </>
  );
}
export default chatBox;
