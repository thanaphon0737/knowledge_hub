Errorimport React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { createTheme, ThemeProvider, CssBaseline, Container, Box, AppBar, Toolbar, Typography, Button, Card, CardContent, CardActions, Grid, TextField, Modal, Paper, List, ListItem, ListItemIcon, ListItemText, Chip, CircularProgress, Alert, BottomNavigation, BottomNavigationAction, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, IconButton, InputAdornment } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Description, UploadFile, Chat, BarChart as BarChartIcon, Add, Logout, Visibility, VisibilityOff, Home, Close, Link as LinkIcon, CheckCircle, Error, HourglassTop, Send, ExpandMore, FilePresent } from '@mui/icons-material';

// =================================================================================
// src/services/api.js (Unchanged)
// =================================================================================
const api = {
  defaults: { baseURL: '/api/v1', withCredentials: true },
  async post(path, data) {
    console.log(`[API POST] to ${this.defaults.baseURL}${path}`, data);
    await new Promise(resolve => setTimeout(resolve, 800));
    if (path === '/auth/login') {
      if (data.email === 'test@example.com' && data.password === 'password') {
        return { data: { success: true, message: 'Login successful' } };
      } else {
        throw { response: { data: { message: 'Invalid credentials' } } };
      }
    }
    if (path === '/auth/register') {
      if (data.email.includes('existing')) {
        throw { response: { data: { message: 'Email already exists' } } };
      }
      return { data: { success: true, data: { id: `user-${Date.now()}`, email: data.email } } };
    }
    if (path === '/query') {
      return {
        data: {
          answer: "Based on the provided documents, the primary market competitor is 'InnovateAI'. Their Q4 earnings report indicates a 35% market share.",
          sources: [
            { file_id: "file-a", file_name: "competitor_analysis.pdf", chunk_text: "...InnovateAI holds the largest market share at 35%..." },
            { file_id: "file-d", file_name: "Q4_Earnings.pdf", chunk_text: "The final report confirms InnovateAI's strong performance in the last quarter." }
          ]
        }
      };
    }
    return { data: { success: true } };
  },
  async get(path) {
    console.log(`[API GET] from ${this.defaults.baseURL}${path}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    if (path === '/documents') {
      return {
        data: [
          { id: "doc-1", name: "Q1 Market Research", description: "Analysis of AI trends.", fileCount: 5, updated_at: "2024-06-20T10:30:00Z" },
          { id: "doc-2", name: "Personal Project Ideas", description: "Brainstorming for side projects.", fileCount: 2, updated_at: "2024-06-18T14:20:00Z" },
          { id: "doc-3", name: "Competitor Financials", description: "Deep dive into financial reports of key competitors.", fileCount: 8, updated_at: "2024-06-15T09:00:00Z" }
        ]
      };
    }
    if (path.startsWith('/documents/') && !path.endsWith('/files')) {
      const documents = [
        { id: "doc-1", name: "Q1 Market Research", description: "Analysis of AI trends for the upcoming quarter, focusing on market leaders and emerging technologies." },
        { id: "doc-2", name: "Personal Project Ideas", description: "Brainstorming for side projects, including potential tech stacks and monetization strategies." },
        { id: "doc-3", name: "Competitor Financials", description: "Deep dive into financial reports of key competitors like InnovateAI and TechCorp." }
      ];
      const docId = path.split('/')[2];
      const doc = documents.find(d => d.id === docId);
      return { data: doc || null };
    }
    if (path.startsWith('/documents/') && path.endsWith('/files')) {
      return {
        data: [
          { id: "file-a", file_name: "competitor_analysis.pdf", source_type: "upload", processing_status: "READY" },
          { id: "file-b", file_name: "https://techcrunch.com/some-article", source_type: "url", processing_status: "PROCESSING" },
          { id: "file-c", file_name: "user_survey_raw_data.pdf", source_type: "upload", processing_status: "ERROR" },
          { id: "file-d", file_name: "Q4_Earnings.pdf", source_type: "upload", processing_status: "READY" }
        ]
      };
    }
    if (path === '/analytics/dashboard') {
      return {
        data: {
          stats: { totalDocuments: 3, totalFiles: 15, storageUsed: '1.8 GB' },
          timeSeries: [
            { date: '2024-01-01', count: 1 }, { date: '2024-02-01', count: 2 }, { date: '2024-03-01', count: 1 },
            { date: '2024-04-01', count: 3 }, { date: '2024-05-01', count: 5 }, { date: '2024-06-01', count: 3 },
          ]
        }
      };
    }
    return { data: null };
  }
};

// =================================================================================
// src/context/AuthContext.jsx (Unchanged)
// =================================================================================
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem('ai-hub-user');
    if (storedUser) { setUser(JSON.parse(storedUser)); }
    setLoading(false);
  }, []);
  const login = (email) => {
    const userData = { email };
    setUser(userData);
    localStorage.setItem('ai-hub-user', JSON.stringify(userData));
  };
  const logout = async () => {
    setUser(null);
    localStorage.removeItem('ai-hub-user');
  };
  const value = { user, loading, login, logout };
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// =================================================================================
// src/hooks/useAuth.js (Unchanged)
// =================================================================================
export const useAuth = () => {
  return useContext(AuthContext);
};

// =================================================================================
// src/components/ui/StatusChip.jsx
// =================================================================================
const StatusChip = ({ status }) => {
  const statusMap = {
    READY: { label: 'Ready', icon: <CheckCircle />, color: 'success' },
    PROCESSING: { label: 'Processing', icon: <HourglassTop />, color: 'warning' },
    ERROR: { label: 'Error', icon: <Error />, color: 'error' },
    PENDING: { label: 'Pending', icon: <HourglassTop />, color: 'default' },
  };
  const currentStatus = statusMap[status] || statusMap.PENDING;
  return <Chip icon={currentStatus.icon} label={currentStatus.label} color={currentStatus.color} size="small" />;
};


// =================================================================================
// src/components/layout/MainLayout.jsx
// =================================================================================
const MainLayout = ({ children, activePage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [mobileNavValue, setMobileNavValue] = useState(activePage);

  useEffect(() => {
    setMobileNavValue(activePage);
  }, [activePage]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home /> },
    { id: 'chat', label: 'Chat', icon: <Chat /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChartIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Description sx={{ mr: 1 }} />
            <Typography variant="h6" noWrap component="a" href="/" sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, fontWeight: 700, color: 'inherit', textDecoration: 'none' }}>
              Knowledge Hub
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button key={item.id} onClick={() => onNavigate(item.id)} sx={{ my: 2, color: 'white', display: 'block', bgcolor: activePage === item.id ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
                  {item.label}
                </Button>
              ))}
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', lg: 'inline' }, mr: 2 }}>{user.email}</Typography>
              <Button variant="outlined" color="inherit" startIcon={<Logout />} onClick={logout}>
                Logout
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Container component="main" maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {children}
      </Container>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: { xs: 'block', md: 'none' } }} elevation={3}>
        <BottomNavigation showLabels value={mobileNavValue} onChange={(event, newValue) => { onNavigate(newValue); }}>
          {navItems.map(item => <BottomNavigationAction key={item.id} label={item.label} value={item.id} icon={item.icon} />)}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

// =================================================================================
// src/views/LoginPage.jsx
// =================================================================================
const LoginPage = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/login', { email, password });
      login(email);
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Description sx={{ m: 1, fontSize: 40, color: 'primary.main' }} />
        <Typography component="h1" variant="h5">Sign In</Typography>
        <Typography color="text.secondary">to your AI Knowledge Hub</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth name="password" label="Password" type={showPassword ? 'text' : 'password'} id="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button onClick={onSwitchToRegister} size="small">Don't have an account? Sign Up</Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

// =================================================================================
// src/views/RegisterPage.jsx
// =================================================================================
const RegisterPage = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            await api.post('/auth/register', { email, password });
            login(email);
        } catch (err) {
            setError(err.response?.data?.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Description sx={{ m: 1, fontSize: 40, color: 'primary.main' }} />
                <Typography component="h1" variant="h5">Create Account</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" value={email} onChange={e => setEmail(e.target.value)} />
                    <TextField margin="normal" required fullWidth name="password" label="Password" type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={e => setPassword(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                    />
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Button onClick={onSwitchToLogin} size="small">Already have an account? Sign In</Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};

// =================================================================================
// src/components/dialogs/CreateDocumentDialog.jsx
// =================================================================================
const CreateDocumentDialog = ({ open, onClose, onCreate }) => {
  // This component now receives the 'open' state and control functions as props.
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Document</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" id="doc-name" label="Document Name" type="text" fullWidth variant="standard" sx={{ mb: 2 }} />
        <TextField margin="dense" id="doc-desc" label="Description" type="text" fullWidth multiline rows={3} variant="standard" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onCreate} variant="contained">Create</Button>
      </DialogActions>
    </Dialog>
  );
};

// =================================================================================
// src/views/DashboardPage.jsx
// =================================================================================
const DashboardPage = ({ onNavigateToDocument }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const response = await api.get('/documents');
                setDocuments(response.data);
            } catch (error) { console.error("Failed to fetch documents", error); }
            finally { setLoading(false); }
        };
        fetchDocs();
    }, []);

    const handleCreateDocument = () => {
        console.log('Creating new document...');
        setIsCreateModalOpen(false);
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">Dashboard</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setIsCreateModalOpen(true)}>Create Document</Button>
            </Box>
            <Grid container spacing={3}>
                {loading ? Array.from(new Array(3)).map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150 }}>
                               <CircularProgress />
                            </CardContent>
                        </Card>
                    </Grid>
                )) : documents.map(doc => (
                    <Grid item xs={12} sm={6} md={4} key={doc.id}>
                        <Card onClick={() => onNavigateToDocument(doc.id)} sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" component="h2" gutterBottom>{doc.name}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{doc.description}</Typography>
                            </CardContent>
                            <CardActions sx={{ borderTop: '1px solid #eee', px: 2 }}>
                                <Typography variant="caption" color="text.secondary">{doc.fileCount} files</Typography>
                                <Box sx={{ flexGrow: 1 }} />
                                <Typography variant="caption" color="text.secondary">Updated: {new Date(doc.updated_at).toLocaleDateString()}</Typography>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {/* The Dashboard now calls the separate dialog component */}
            <CreateDocumentDialog 
                open={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onCreate={handleCreateDocument} 
            />
        </>
    );
};

// =================================================================================
// src/views/DocumentDetailPage.jsx
// =================================================================================
const DocumentDetailPage = ({ documentId, onBack }) => {
    const [document, setDocument] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const [docResponse, filesResponse] = await Promise.all([api.get(`/documents/${documentId}`), api.get(`/documents/${documentId}/files`)]);
                setDocument(docResponse.data);
                setFiles(filesResponse.data);
            } catch (error) { console.error("Failed to fetch document details", error); }
            finally { setLoading(false); }
        };
        fetchDetails();
    }, [documentId]);
    
    return (
        <>
            <Button onClick={onBack} sx={{ mb: 2 }}>&larr; Back to Dashboard</Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                {loading ? <CircularProgress /> : (
                    <Box>
                        <Typography variant="h4" component="h1" fontWeight="bold">{document?.name}</Typography>
                        <Typography color="text.secondary">{document?.description}</Typography>
                    </Box>
                )}
                <Button variant="contained" startIcon={<Add />} onClick={() => setIsModalOpen(true)}>Add Source</Button>
            </Box>
            <Card>
                <List>
                    {loading ? <ListItem><CircularProgress /></ListItem> : files.map(file => (
                        <ListItem key={file.id} secondaryAction={<StatusChip status={file.processing_status} />}>
                            <ListItemIcon>{file.source_type === 'upload' ? <FilePresent /> : <LinkIcon />}</ListItemIcon>
                            <ListItemText primary={file.file_name} />
                        </ListItem>
                    ))}
                </List>
            </Card>
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add New Source</DialogTitle>
                <DialogContent><TextField autoFocus margin="dense" id="name" label="File URL or browse" type="text" fullWidth variant="standard" /></DialogContent>
                <DialogActions><Button onClick={() => setIsModalOpen(false)}>Cancel</Button><Button>Add</Button></DialogActions>
            </Dialog>
        </>
    );
};

// =================================================================================
// src/views/ChatPage.jsx
// =================================================================================
const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        try {
            const response = await api.post('/query', { question: input });
            const aiMessage = { role: 'ai', content: response.data.answer, sources: response.data.sources };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = { role: 'ai', content: "Sorry, I couldn't get a response.", sources: [] };
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
};

// =================================================================================
// src/views/AnalyticsPage.jsx
// =================================================================================
const AnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/analytics/dashboard');
                setData(response.data);
            } catch (error) { console.error("Failed to fetch analytics", error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const StatCard = ({ title, value, icon }) => (
        <Card><CardContent><Box sx={{display: 'flex', justifyContent: 'space-between'}}><Typography variant="h6">{title}</Typography>{icon}</Box><Typography variant="h4">{value}</Typography></CardContent></Card>
    );

    if (loading) return <CircularProgress />;
    if (!data) return <Alert severity="error">Could not load analytics data.</Alert>;

    return (
        <>
            <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 4 }}>Analytics</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}><StatCard title="Total Documents" value={data.stats.totalDocuments} icon={<Description fontSize="large" color="primary" />} /></Grid>
                <Grid item xs={12} md={4}><StatCard title="Total Files" value={data.stats.totalFiles} icon={<FilePresent fontSize="large" color="primary" />} /></Grid>
                <Grid item xs={12} md={4}><StatCard title="Storage Used" value={data.stats.storageUsed} icon={<UploadFile fontSize="large" color="primary" />} /></Grid>
            </Grid>
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 2}}>Documents Created Over Time</Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" name="New Documents"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        </>
    );
};

// =================================================================================
// src/App.jsx
// =================================================================================
const theme = createTheme({
  palette: {
    primary: {
      main: '#5E35B1', // Deep Purple
    },
    secondary: {
      main: '#D81B60', // Pink
    },
  },
});

function App() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('login');
  const [appState, setAppState] = useState({ currentPage: 'dashboard', documentId: null });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, preventing hydration mismatch.
    setIsClient(true);
  }, []);

  const handleNavigation = (targetPage, documentId = null) => {
    setAppState({ currentPage: targetPage, documentId: documentId });
  };
  
  if (!isClient || loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress size={60} /></Box>;
  }

  if (!user) {
    return page === 'register' ? <RegisterPage onSwitchToLogin={() => setPage('login')} /> : <LoginPage onSwitchToRegister={() => setPage('register')} />;
  }

  const renderPage = () => {
    switch (appState.currentPage) {
      case 'dashboard': return <DashboardPage onNavigateToDocument={(id) => handleNavigation('documentDetail', id)} />;
      case 'documentDetail': return <DocumentDetailPage documentId={appState.documentId} onBack={() => handleNavigation('dashboard')} />;
      case 'chat': return <ChatPage />;
      case 'analytics': return <AnalyticsPage />;
      default: return <DashboardPage onNavigateToDocument={(id) => handleNavigation('documentDetail', id)} />;
    }
  };

  return (
    <MainLayout activePage={appState.currentPage} onNavigate={handleNavigation}>
      {renderPage()}
    </MainLayout>
  );
}

const Root = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);

export default Root;
