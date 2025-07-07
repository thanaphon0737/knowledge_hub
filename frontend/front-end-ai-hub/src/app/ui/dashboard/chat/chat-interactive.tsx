"use client";
import { Send } from "@mui/icons-material";
import { Box, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import { useState,useRef,useEffect } from "react";
import { apiQueryQuestion } from "@/services/api";
type Message = {
    role: 'user' | 'ai';
    content: string;
    sources?: any[];
};

export default function ChatInteract(){
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        try {
            const result = await apiQueryQuestion(input);
            const aiMessage: Message = { role: 'ai', content: result.data.answer, sources: result.data.sources };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = { role: 'ai', content: "Sorry, I couldn't get a response.", sources: [] };
            setMessages(prev => [...prev, errorMessage]);
        } finally { setLoading(false); }
    };

    return (
        <Paper elevation={3} sx={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                {messages.map((msg, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
                        <Paper elevation={1} sx={{ p: 1.5, bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.200', color: msg.role === 'user' ? 'primary.contrastText' : 'inherit', maxWidth: '80%' }}>
                            <Typography variant="body1">{msg.content}</Typography>
                        </Paper>
                    </Box>
                ))}
                {loading && <CircularProgress sx={{ display: 'block', mx: 'auto' }} />}
                <div ref={chatEndRef} />
            </Box>
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex' }}>
                <TextField fullWidth variant="outlined" placeholder="Ask a question..." value={input} onChange={e => setInput(e.target.value)} />
                <Button type="submit" variant="contained" sx={{ ml: 1 }} disabled={!input.trim() || loading}><Send /></Button>
            </Box>
        </Paper>
    );
}