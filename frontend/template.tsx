import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  FileText, Upload, MessageCircle, BarChart3, Plus, LogOut, Eye, EyeOff, Loader2, File, Link as LinkIcon, 
  AlertCircle, CheckCircle, Clock, Send, ChevronDown, ChevronUp, Home, X, Search, MoreVertical 
} from 'lucide-react';

// =================================================================================
// src/services/api.js
// NOTE: This is a mock API client using Axios-like syntax.
// In a real app, you would import axios.
// =================================================================================

const api = {
  // MOCK Axios instance configuration
  defaults: {
    baseURL: '/api/v1',
    withCredentials: true,
  },
  
  // MOCK post method
  async post(path, data) {
    console.log(`[API POST] to ${this.defaults.baseURL}${path}`, data);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

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
              "sources": [
                { "file_id": "file-a", "file_name": "competitor_analysis.pdf", "chunk_text": "...InnovateAI holds the largest market share at 35%..." },
                { "file_id": "file-d", "file_name": "Q4_Earnings.pdf", "chunk_text": "The final report confirms InnovateAI's strong performance in the last quarter." }
              ]
            }
        };
    }
    return { data: { success: true } };
  },

  // MOCK get method
  async get(path) {
    console.log(`[API GET] from ${this.defaults.baseURL}${path}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    if (path === '/documents') {
      return {
        data: [
          { "id": "doc-1", "name": "Q1 Market Research", "description": "Analysis of AI trends.", "fileCount": 5, "updated_at": "2024-06-20T10:30:00Z" },
          { "id": "doc-2", "name": "Personal Project Ideas", "description": "Brainstorming for side projects.", "fileCount": 2, "updated_at": "2024-06-18T14:20:00Z" },
          { "id": "doc-3", "name": "Competitor Financials", "description": "Deep dive into financial reports of key competitors.", "fileCount": 8, "updated_at": "2024-06-15T09:00:00Z" }
        ]
      };
    }
    if (path.startsWith('/documents/') && !path.endsWith('/files')) {
        const documents = [
          { "id": "doc-1", "name": "Q1 Market Research", "description": "Analysis of AI trends for the upcoming quarter, focusing on market leaders and emerging technologies." },
          { "id": "doc-2", "name": "Personal Project Ideas", "description": "Brainstorming for side projects, including potential tech stacks and monetization strategies." },
          { "id": "doc-3", "name": "Competitor Financials", "description": "Deep dive into financial reports of key competitors like InnovateAI and TechCorp." }
        ];
        const docId = path.split('/')[2];
        const doc = documents.find(d => d.id === docId);
        return { data: doc || null };
    }
    if (path.startsWith('/documents/') && path.endsWith('/files')) {
       return {
            data: [
              { "id": "file-a", "file_name": "competitor_analysis.pdf", "source_type": "upload", "processing_status": "READY" },
              { "id": "file-b", "file_name": "https://techcrunch.com/some-article", "source_type": "url", "processing_status": "PROCESSING" },
              { "id": "file-c", "file_name": "user_survey_raw_data.pdf", "source_type": "upload", "processing_status": "ERROR" },
              { "id": "file-d", "file_name": "Q4_Earnings.pdf", "source_type": "upload", "processing_status": "READY" }
            ]
        };
    }
    if (path === '/analytics/dashboard') {
        return {
            data: {
                stats: {
                    totalDocuments: 3,
                    totalFiles: 15,
                    storageUsed: '1.8 GB'
                },
                timeSeries: [
                    { date: '2024-01-01', count: 1 },
                    { date: '2024-02-01', count: 2 },
                    { date: '2024-03-01', count: 1 },
                    { date: '2024-04-01', count: 3 },
                    { date: '2024-05-01', count: 5 },
                    { date: '2024-06-01', count: 3 },
                ]
            }
        };
    }
    return { data: null };
  }
};

// =================================================================================
// src/context/AuthContext.jsx
// =================================================================================
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('ai-hub-user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// =================================================================================
// src/hooks/useAuth.js
// =================================================================================
export const useAuth = () => {
  return useContext(AuthContext);
};


// =================================================================================
// src/components/ui/
// =================================================================================

const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:ring-indigo-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

// --- Card.jsx ---
// FIX: The Card component now accepts and spreads extra props (`...props`),
// allowing it to handle events like `onClick`.
const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`bg-white shadow-sm rounded-lg border border-gray-200 ${className}`} {...props}>
            {children}
        </div>
    );
};

const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => {
    return (
        <input
            type={type}
            ref={ref}
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
            {...props}
        />
    );
});

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusMap = {
    READY: { text: 'Ready', icon: CheckCircle, classes: 'bg-green-100 text-green-800' },
    PROCESSING: { text: 'Processing', icon: Loader2, classes: 'bg-yellow-100 text-yellow-800 animate-pulse' },
    ERROR: { text: 'Error', icon: AlertCircle, classes: 'bg-red-100 text-red-800' },
    PENDING: { text: 'Pending', icon: Clock, classes: 'bg-gray-100 text-gray-800' },
  };
  const currentStatus = statusMap[status] || statusMap.PENDING;
  const Icon = currentStatus.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${currentStatus.classes}`}>
      <Icon className={`w-4 h-4 mr-1.5 ${status === 'PROCESSING' ? 'animate-spin' : ''}`} />
      {currentStatus.text}
    </span>
  );
};

// =================================================================================
// src/components/layout/MainLayout.jsx
// =================================================================================
const MainLayout = ({ children, activePage, onNavigate }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800 hidden sm:block">Knowledge Hub</span>
              </div>
              <nav className="hidden md:flex space-x-4">
                {navItems.map(item => (
                  <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activePage === item.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
               <span className="text-sm text-gray-600 hidden lg:block">{user.email}</span>
               <Button onClick={logout} variant="secondary">
                 <LogOut className="w-5 h-5" />
               </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around">
          {navItems.map(item => (
              <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex flex-col items-center p-2 rounded-lg w-20 ${activePage === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}>
                  <item.icon className="w-6 h-6 mb-1"/>
                  <span className="text-xs">{item.label}</span>
              </button>
          ))}
      </footer>
    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
            <div className="inline-block bg-indigo-600 p-3 rounded-xl mb-4">
                <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Sign in to your AI Knowledge Hub.</p>
        </div>
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign In'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button onClick={onSwitchToRegister} className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</button>
          </p>
        </Card>
      </div>
    </div>
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
        e.preventDefault();
        setLoading(true);
        setError('');
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
            <div className="inline-block bg-indigo-600 p-3 rounded-xl mb-4">
                <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create your Account</h2>
            <p className="text-gray-500 mt-2">Join the AI Knowledge Hub today.</p>
        </div>
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</button>
          </p>
        </Card>
      </div>
    </div>
  );
};


// =================================================================================
// src/views/DashboardPage.jsx
// =================================================================================
const DashboardPage = ({ onNavigateToDocument }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const response = await api.get('/documents');
                setDocuments(response.data);
            } catch (error) {
                console.error("Failed to fetch documents", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Your document collections.</p>
                </div>
                <Button>
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Document
                </Button>
            </div>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="p-5">
                            <div className="animate-pulse flex flex-col h-full">
                                <div className="flex items-start">
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg mr-4"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="h-3 bg-gray-200 rounded mt-4 w-full"></div>
                                <div className="h-3 bg-gray-200 rounded mt-2 w-5/6"></div>
                                <div className="flex-grow"></div>
                                <div className="h-px bg-gray-200 mt-4"></div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map(doc => (
                        <Card key={doc.id} onClick={() => onNavigateToDocument(doc.id)} className="p-5 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                            <div className="flex-grow">
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                                        <FileText className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h3 className="flex-1 text-lg font-semibold text-gray-800 break-words">{doc.name}</h3>
                                </div>
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                                <span>{doc.fileCount} files</span>
                                <span>Updated: {new Date(doc.updated_at).toLocaleDateString()}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
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
                const [docResponse, filesResponse] = await Promise.all([
                    api.get(`/documents/${documentId}`),
                    api.get(`/documents/${documentId}/files`)
                ]);
                setDocument(docResponse.data);
                setFiles(filesResponse.data);
            } catch (error) {
                console.error("Failed to fetch document details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [documentId]);
    
    const AddFileModal = () => {
        const [uploadType, setUploadType] = useState('file');

        return (
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Source">
                <div className="flex border border-gray-200 rounded-md p-1 mb-6 bg-gray-100">
                    <button onClick={() => setUploadType('file')} className={`flex-1 p-2 rounded-md text-sm font-medium ${uploadType === 'file' ? 'bg-white shadow-sm' : ''}`}>File Upload</button>
                    <button onClick={() => setUploadType('url')} className={`flex-1 p-2 rounded-md text-sm font-medium ${uploadType === 'url' ? 'bg-white shadow-sm' : ''}`}>From URL</button>
                </div>

                {uploadType === 'file' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Drag & drop a file or <span className="font-medium text-indigo-600">browse</span></p>
                        <p className="text-xs text-gray-500 mt-1">PDF up to 10MB</p>
                    </div>
                )}
                {uploadType === 'url' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">URL</label>
                        <Input placeholder="https://example.com/source.pdf" />
                    </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button>Add Source</Button>
                </div>
            </Modal>
        );
    };

    return (
        <div>
            <AddFileModal />
            <button onClick={onBack} className="text-sm font-medium text-gray-600 hover:text-indigo-600 flex items-center mb-4">
                &larr; Back to Dashboard
            </button>
            {loading ? (
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{document?.name}</h1>
                        <p className="text-gray-500 mt-1 max-w-2xl">{document?.description}</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Add New File/URL
                    </Button>
                </div>
            )}
            <Card>
                <div className="divide-y divide-gray-200">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="p-4 flex justify-between items-center animate-pulse">
                                <div className="flex items-center space-x-4">
                                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                                    <div className="w-48 h-4 bg-gray-200 rounded"></div>
                                </div>
                                <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
                            </div>
                        ))
                    ) : (
                        files.map(file => (
                            <div key={file.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center space-x-4">
                                    {file.source_type === 'upload' ? <File className="w-6 h-6 text-gray-500" /> : <LinkIcon className="w-6 h-6 text-gray-500" />}
                                    <span className="font-medium text-gray-700 break-all">{file.file_name}</span>
                                </div>
                                <StatusBadge status={file.processing_status} />
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
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

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);
    
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
            console.error("Chat API error:", error);
            const errorMessage = { role: 'ai', content: "Sorry, I couldn't get a response. Please try again.", sources: [] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const Source = ({ source }) => (
        <div className="bg-gray-100 p-3 rounded-md mt-2">
            <p className="text-xs font-semibold text-gray-800 flex items-center">
                <FileText className="w-3 h-3 mr-2" />
                {source.file_name}
            </p>
            <p className="text-xs text-gray-600 mt-1 italic">"{source.chunk_text}"</p>
        </div>
    );

    const AIMessage = ({ content, sources }) => {
        const [showSources, setShowSources] = useState(false);
        return (
            <div>
                <p>{content}</p>
                {sources && sources.length > 0 && (
                    <div className="mt-3">
                        <button onClick={() => setShowSources(!showSources)} className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800">
                            Show Sources ({sources.length})
                            {showSources ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                        </button>
                        {showSources && (
                            <div className="mt-2 space-y-2">
                                {sources.map((s, i) => <Source key={i} source={s} />)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">RAG Chat</h1>
            <Card className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                           {msg.role === 'ai' && (
                             <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center">
                               <FileText className="w-4 h-4 text-white" />
                             </div>
                           )}
                           <div className={`max-w-xl p-4 rounded-lg text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                {msg.role === 'ai' ? <AIMessage {...msg} /> : msg.content}
                           </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                           <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-white" />
                           </div>
                           <div className="p-4 rounded-lg bg-gray-100 text-gray-800">
                               <Loader2 className="animate-spin w-5 h-5 text-indigo-500" />
                           </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t bg-white">
                    <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question based on your documents..." />
                        <Button type="submit" disabled={!input.trim() || loading} className="!p-2">
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
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
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const StatCard = ({ title, value, icon }) => (
        <Card className="p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className="bg-indigo-100 text-indigo-600 rounded-lg p-3">{icon}</div>
            </div>
        </Card>
    );

    if (loading) return <div><Loader2 className="w-8 h-8 animate-spin mx-auto mt-10" /></div>;
    if (!data) return <p>Could not load analytics data.</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Documents" value={data.stats.totalDocuments} icon={<FileText className="w-6 h-6" />} />
                <StatCard title="Total Files" value={data.stats.totalFiles} icon={<File className="w-6 h-6" />} />
                <StatCard title="Storage Used" value={data.stats.storageUsed} icon={<Upload className="w-6 h-6" />} />
            </div>
            <Card className="p-6">
                 <h2 className="text-lg font-semibold text-gray-800 mb-4">Documents Created Over Time</h2>
                 <div className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.timeSeries} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleString('default', { month: 'short' })} />
                            <YAxis />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #ccc',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Bar dataKey="count" fill="#4f46e5" name="New Documents" />
                        </BarChart>
                     </ResponsiveContainer>
                 </div>
            </Card>
        </div>
    );
};


// =================================================================================
// src/App.jsx
// =================================================================================
function App() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('login'); // login, register
  const [appState, setAppState] = useState({ currentPage: 'dashboard', documentId: null });

  useEffect(() => {
      const root = document.getElementById('root');
      if (root) {
        root.style.animation = 'fadeIn 0.5s ease-in-out';
      }
  }, []);

  const handleNavigation = (targetPage, documentId = null) => {
    setAppState({ currentPage: targetPage, documentId: documentId });
  };
  
  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          </div>
      );
  }

  if (!user) {
    switch (page) {
      case 'register':
        return <RegisterPage onSwitchToLogin={() => setPage('login')} />;
      default:
        return <LoginPage onSwitchToRegister={() => setPage('register')} />;
    }
  }

  const renderPage = () => {
    switch (appState.currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigateToDocument={(id) => handleNavigation('documentDetail', id)} />;
      case 'documentDetail':
        return <DocumentDetailPage documentId={appState.documentId} onBack={() => handleNavigation('dashboard')} />;
      case 'chat':
        return <ChatPage />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return <DashboardPage onNavigateToDocument={(id) => handleNavigation('documentDetail', id)} />;
    }
  }

  return (
    <MainLayout activePage={appState.currentPage} onNavigate={handleNavigation}>
        {renderPage()}
    </MainLayout>
  );
}

const Root = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default Root;
