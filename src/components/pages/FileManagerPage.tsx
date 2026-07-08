import React, { useState, useRef, useEffect } from 'react';
import {
    FolderOpen,
    File,
    Upload,
    Plus,
    Trash2,
    Edit,
    Share2,
    Grid,
    List,
    Search,
    ChevronRight,
    AlertTriangle, Loader2, CheckCircle, X, ExternalLink, Presentation
} from 'lucide-react';
import type {
    ContextMenuState,
    Folder,
    Item,
    Permission,
    UploadProgress
} from "@/lib/Types.ts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import axios from "axios";
import {useToast} from "@/hooks/use-toast.ts";
import {useUser} from "@/models/user.ts";
import {useNavigate} from "react-router-dom";

const FileManagerPage = () => {
    type FileViewerState = {
        item: Item;
        source: string | null;
        kind: 'image' | 'pdf' | 'pptx' | 'docx' | 'xlsx' | 'unsupported';
    } | null;

    const [items, setItems] = useState<Item[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [folderPath, setFolderPath] = useState<Folder[]>([
        { id: null, name: 'Tutorial' },
    ]);
    const user = useUser()

    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const {toast} = useToast()
    const navigate = useNavigate()
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
    const [showNewModal, setShowNewModal] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState<Item | null>(null);
    const [showRenameModal, setShowRenameModal] = useState<Item | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<Item | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>(null);
    const [viewMode, setViewMode] = useState('grid')
    const [renameValue, setRenameValue] = useState('')
    const apiUrl = import.meta.env.VITE_API_URL
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);
    const [viewerState, setViewerState] = useState<FileViewerState>(null);
    const [viewerLoading, setViewerLoading] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);

    const getFileExtension = (item: Item) => {
        if (item.extension) {
            return item.extension.toLowerCase().replace('.', '');
        }

        const sourceName = item.name ?? '';
        const lastDotIndex = sourceName.lastIndexOf('.');
        if (lastDotIndex === -1) return '';

        return sourceName.slice(lastDotIndex + 1).toLowerCase();
    };

    const getMimeType = (item: Item) => {
        return item.mime_type?.toLowerCase() || item.mimeType?.toLowerCase() || '';
    };

    const getViewerKind = (item: Item): NonNullable<FileViewerState>['kind'] => {
        const extension = getFileExtension(item);
        const mimeType = getMimeType(item);

        if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
            return 'image';
        }

        if (mimeType === 'application/pdf' || extension === 'pdf') {
            return 'pdf';
        }

        if (
            mimeType.includes('presentation') ||
            mimeType.includes('powerpoint') ||
            ['ppt', 'pptx'].includes(extension)
        ) {
            return 'pptx';
        }

        if (
            mimeType.includes('wordprocessingml') ||
            mimeType.includes('msword') ||
            ['doc', 'docx'].includes(extension)
        ) {
            return 'docx';
        }

        if (
            mimeType.includes('spreadsheetml') ||
            mimeType.includes('excel') ||
            mimeType.includes('spreadsheet') ||
            ['xls', 'xlsx', 'csv'].includes(extension)
        ) {
            return 'xlsx';
        }

        return 'unsupported';
    };

    const toAbsoluteUrl = (value?: string | null) => {
        if (!value) return null;
        if (value.startsWith('http://') || value.startsWith('https://')) return value;
        return `${apiUrl}${value.startsWith('/') ? value : `/${value}`}`;
    };

    const toStorageUrl = (value?: string | null) => {
        if (!value) return null;
        if (value.startsWith('http://') || value.startsWith('https://')) return value;

        const normalizedPath = value.replace(/^\/+/, '');
        const storagePath = normalizedPath.startsWith('storage/')
            ? normalizedPath
            : `storage/${normalizedPath}`;

        return `${apiUrl}/${storagePath}`;
    };

    const getDirectFileUrl = (item: Partial<Item>) => {
        return (
            toAbsoluteUrl(item.preview_url) ||
            toAbsoluteUrl(item.download_url) ||
            toAbsoluteUrl(item.file_url) ||
            toAbsoluteUrl(item.url) ||
            toStorageUrl(item.path)
        );
    };

    const getOfficeViewerUrl = (source: string | null) => {
        if (!source || !/^https?:\/\//i.test(source)) return null;
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(source)}`;
    };

    const isOfficeViewerKind = (kind: NonNullable<FileViewerState>['kind']) => {
        return ['pptx', 'docx', 'xlsx'].includes(kind);
    };

    const isLocalOfficeSource = (source: string | null) => {
        if (!source) return false;

        try {
            const parsedUrl = new URL(source);
            return ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsedUrl.hostname);
        } catch {
            return false;
        }
    };

    const getViewerLabel = (kind: NonNullable<FileViewerState>['kind']) => {
        if (kind === 'docx') return 'DOCX/DOC';
        if (kind === 'xlsx') return 'XLSX/XLS/CSV';
        return kind.toUpperCase();
    };

    const fetchFiles = async (parentId?: number | null) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (parentId) params.append('parent_id', parentId.toString());
            if (searchQuery) params.append('search', searchQuery);

            const response = await axios.get(`${apiUrl}/api/files`, {
                params, // axios otomatis encode query string
            });

            setItems(response.data);
        } catch (err: any) {
            console.error('Error fetching files:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentFolderId || 0);
    }, [currentFolderId, searchQuery]);

    useEffect(() => {
        const handleClick = () => {
            setContextMenu(null);
            setShowAddMenu(false);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleContextMenu = (
        e: React.MouseEvent<HTMLElement>,
        item: Item | null = null
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, item });
    }

    const renameItem = async(id: number) => {
        if (!renameValue.trim() || !showRenameModal?.id) return;

        setLoading(true);

        try {
            await axios.put(`${apiUrl}/api/files/${id}`,{
                name: renameValue
            });

            await fetchFiles(currentFolderId);
            setShowRenameModal(null);
            setRenameValue('');
        } catch (err: any) {
            setError(err.message);
            console.error('Error creating folder:', err);
        } finally {
            setLoading(false);
        }

    }

    const createItem = async(type: any) => {
        if (!newItemName.trim()) return;
        setLoading(true);
        try {
            await axios.post(`${apiUrl}/api/files/folder`, {
                name: newItemName,
                parent_id: currentFolderId,
                user_id: user?.id,
                type,
            });

            await fetchFiles(currentFolderId);
            setNewItemName('');
            setShowNewModal(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Error creating folder:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files);

        for (const file of files) {
            setUploadProgress({ name: file.name, progress: 0 });

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('user_id', user?.id);
                if (currentFolderId) {
                    formData.append('parent_id', currentFolderId.toString());
                }

                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const progress = (e.loaded / e.total) * 100;
                        setUploadProgress({ name: file.name, progress });
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200 || xhr.status === 201) {
                        fetchFiles(currentFolderId);
                        setUploadProgress(null);
                    } else {
                        setError('Upload failed');
                        setUploadProgress(null);
                    }
                });

                xhr.addEventListener('error', () => {
                    setError('Upload failed');
                    setUploadProgress(null);
                });

                xhr.open('POST', `${apiUrl}/api/files/upload`);
                xhr.send(formData);

            } catch (err) {
                setError(err.message);
                setUploadProgress(null);
                console.error('Error uploading file:', err);
            }
        }
    };

    const deleteItem = async(id: number) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/files/${id}`);

            // Optimistic update: remove item from state immediately using the returned ID
            if (response.data.status === 'success') {
                setItems(prevItems => prevItems.filter(item => item.id !== response.data.id));

                toast({
                    title: "Berhasil",
                    description: response.data.message || "File berhasil dihapus",
                    duration: 3000,
                    action: <CheckCircle className="h-4 w-4 text-green-600" />,
                });
            }

            setContextMenu(null);
        } catch (error: any) {
            console.error("Gagal untuk hapus:", error);

            let errorMessage = "Ada kesalahan saat menghapus data. Silahkan coba lagi.";

            if (error.response) {
                switch (error.response.status) {
                    case 403:
                        errorMessage = "Anda tidak memiliki izin untuk menghapus file ini.";
                        break;
                    case 404:
                        errorMessage = "File tidak ditemukan.";
                        break;
                    case 500:
                        errorMessage = "Terjadi kesalahan pada server.";
                        break;
                    default:
                        errorMessage = error.response.data?.message || errorMessage;
                }
            }

            toast({
                title: "Gagal",
                description: errorMessage,
                duration: 3000,
                variant: "destructive",
                action: <AlertTriangle className="h-4 w-4 text-white" />,
            });
        }
    };

    const updatePermissions = (itemId: number, permission: Permission) => {
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.id === itemId) {
                    const sharedWith = [...item.sharedWith];
                    const idx = sharedWith.findIndex(u => u.email === permission.email);

                    if (idx > -1) {
                        // hapus user yang sudah ada
                        sharedWith.splice(idx, 1);
                    } else {
                        // tambahkan user baru
                        sharedWith.push(permission);
                    }

                    return { ...item, sharedWith };
                }

                return item;
            })
        );
    };

    const updateAccessLevel = (itemId: number, access: Item['access']) => {
        setItems(items.map(item =>
            item.id === itemId ? { ...item, access } : item
        ));
    };

    const addSharedUser = (itemId: number, email: string, role: string) => {
        if (!email.trim()) return;
        setItems(items.map(item => {
            if (item.id === itemId) {
                const sharedWith = [...item.sharedWith];
                const existing = sharedWith.find(u => u.email === email);
                if (existing) {
                    existing.role = role;
                } else {
                    sharedWith.push({ email, role });
                }
                return { ...item, sharedWith };
            }
            return item;
        }));
    };

    const openFolder = (folder: Folder) => {
        setCurrentFolderId(folder.id);
        setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
        setSelectedItems([]);
    };

    const navigateToFolder = (folderId: number, index:number) => {
        setCurrentFolderId(folderId);
        setFolderPath(folderPath.slice(0, index + 1));
        setSelectedItems([]);
    };

    const openFileViewer = async (item: Item) => {
        const viewerKind = getViewerKind(item);

        if (viewerKind === 'unsupported') {
            navigate(`/edit-file/${item.id}`);
            return;
        }

        const directUrl = getDirectFileUrl(item);
        if (directUrl) {
            setViewerState({ item, source: directUrl, kind: viewerKind });
            return;
        }

        setViewerLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/files/${item.id}`);
            const mergedItem = { ...item, ...response.data };
            const resolvedUrl = getDirectFileUrl(mergedItem);

            setViewerState({
                item: mergedItem,
                source: resolvedUrl,
                kind: getViewerKind(mergedItem),
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Gagal membuka preview file';
            setError(errorMessage);
        } finally {
            setViewerLoading(false);
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Library</CardTitle>
            </CardHeader>
            <CardContent >
                <div className="flex min-h-[calc(100svh-8rem)] flex-col bg-white">
                    {/* Header */}
                    <div className="flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAddMenu((prev) => !prev);
                                        setContextMenu(null);
                                    }}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                                >
                                    <Plus size={20} /> New
                                </button>

                                {showAddMenu && (
                                    <div
                                        className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-lg py-2 w-48 z-50 border"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => {
                                                setShowNewModal('folder');
                                                setShowAddMenu(false);
                                                setContextMenu(null);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <FolderOpen size={16} /> Buat Folder
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowNewModal('file');
                                                setShowAddMenu(false);
                                                setContextMenu(null);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <File size={16} /> Buat File
                                        </button>
                                        <hr className="my-2" />
                                        <button
                                            onClick={() => {
                                                fileInputRef.current?.click();
                                                setShowAddMenu(false);
                                                setContextMenu(null);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <Upload size={16} /> Upload file
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex w-full items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 sm:w-96">
                                <Search size={20} className="text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Cari"
                                    className="bg-transparent outline-none w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {loading && <Loader2 size={20} className="animate-spin text-blue-500" />}
                            {viewerLoading && <Loader2 size={20} className="animate-spin text-slate-500" />}
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="p-2 hover:bg-gray-100 rounded-full">
                                {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4">
                            <p className="text-red-700">{error}</p>
                            <button onClick={() => setError(null)} className="text-red-500 text-sm underline mt-1">
                                Dismiss
                            </button>
                        </div>
                    )}
                    {/* Main Content */}
                    <div className="flex-1 flex overflow-hidden">

                        {/* Files Area */}
                        <div
                            className="flex-1 overflow-auto p-3 sm:p-6"
                            onContextMenu={handleContextMenu}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                {folderPath.map((folder, index) => (
                                    <React.Fragment key={folder.id}>
                                        <button
                                            onClick={() => navigateToFolder(folder.id || 0, index)}
                                            className="text-xl font-normal hover:text-blue-600"
                                        >
                                            {folder.name}
                                        </button>
                                        {index < folderPath.length - 1 && (
                                            <ChevronRight size={20} className="text-gray-400" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {uploadProgress && (
                                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{uploadProgress.name}</span>
                                        <span className="text-sm text-gray-600">{Math.round(uploadProgress.progress)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all"
                                            style={{ width: `${uploadProgress.progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4' : 'space-y-1'}>
                                {items.map(item => (
                                    <div
                                        key={item.id}
                                        className={`${
                                            viewMode === 'grid'
                                                ? 'p-4 border rounded-lg hover:bg-gray-50 cursor-pointer'
                                                : 'flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer rounded'
                                        } ${selectedItems.includes(item.id) ? 'bg-blue-50 border-blue-300' : ''}`}
                                        onContextMenu={(e) => handleContextMenu(e, item)}
                                        onClick={() => {
                                            if (selectedItems.includes(item.id)) {
                                                setSelectedItems(selectedItems.filter(id => id !== item.id));
                                            } else {
                                                setSelectedItems([...selectedItems, item.id]);
                                            }
                                        }}
                                        onDoubleClick={() => {
                                            if (item.type === 'folder') {
                                                openFolder(item);
                                            }
                                            else {
                                                openFileViewer(item)
                                            }
                                        }}
                                    >
                                        {viewMode === 'grid' ? (
                                            <>
                                                <div className="flex justify-center mb-2">
                                                    {item.type === 'folder' ? (
                                                        <FolderOpen size={48} className="text-gray-400" />
                                                    ) : (
                                                        <File size={48} className="text-blue-500" />
                                                    )}
                                                </div>
                                                <p className="text-sm truncate">{item.name}</p>
                                                {item.access !== 'private' && (
                                                    <div className="flex gap-1 mt-1">
                                                        <Share2 size={12} className="text-gray-400" />
                                                        <span className="text-xs text-gray-500">
                                  {item.access === 'anyone' ? 'Anyone' : `${item.sharedWith.length} people`}
                                </span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {item.type === 'folder' ? (
                                                    <FolderOpen size={20} className="text-gray-400" />
                                                ) : (
                                                    <File size={20} className="text-blue-500" />
                                                )}
                                                <span className="flex-1">{item.name}</span>
                                                {item.access !== 'private' && (
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Share2 size={12} />
                                                        {item.access === 'anyone' ? 'Anyone' : `${item.sharedWith.length} people`}
                              </span>
                                                )}
                                                <span className="text-sm text-gray-500 w-24">{item.owner}</span>
                                                <span className="text-sm text-gray-500 w-32">{item.modified}</span>
                                                <span className="text-sm text-gray-500 w-24">{item.size || '—'}</span>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Context Menu */}
                    {contextMenu && (
                        <div
                            className="fixed bg-white shadow-lg rounded-lg py-2 w-48 z-50 border"
                            style={{ left: contextMenu.x, top: contextMenu.y }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {!contextMenu.item ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowNewModal('folder');
                                            setContextMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <FolderOpen size={16} /> Buat Folder
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowNewModal('file');
                                            setContextMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <File size={16} /> Buat File
                                    </button>
                                    <hr className="my-2" />
                                    <button
                                        onClick={() => {
                                            fileInputRef.current?.click();
                                            setContextMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <Upload size={16} /> Upload file
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowRenameModal(contextMenu?.item ?? null);
                                            setRenameValue(contextMenu?.item?.name ?? '');
                                            setContextMenu(null);
                                        }}>
                                        <Edit size={16} /> Rename
                                    </button>
                                    <hr className="my-2" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteConfirm(contextMenu?.item ?? null);
                                            setContextMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* New Item Modal */}
                    {showNewModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="w-[calc(100vw-2rem)] max-w-sm rounded-lg bg-white p-4 sm:p-6">
                                <h3 className="text-xl mb-4">New {showNewModal}</h3>
                                <input
                                    type="text"
                                    placeholder={`${showNewModal} name`}
                                    className="w-full border rounded px-3 py-2 mb-4"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && createItem(showNewModal)}
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setShowNewModal(null);
                                            setNewItemName('');
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => createItem(showNewModal)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Share Modal */}
                    {showShareModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="max-h-[85svh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto rounded-lg bg-white p-4 sm:p-6">
                                <h3 className="text-xl font-medium mb-4">Share "{showShareModal.name}"</h3>

                                {/* Add People */}
                                <div className="mb-6">
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="email"
                                            placeholder="Add people by email"
                                            className="flex-1 border rounded-lg px-3 py-2"
                                            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                if (e.key === 'Enter') {
                                                    const email = e.currentTarget.value.trim();
                                                    addSharedUser(showShareModal!.id, email, 'viewer');
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <select className="border rounded-lg px-3 py-2 bg-white">
                                            <option value="viewer">Viewer</option>
                                            <option value="commenter">Commenter</option>
                                            <option value="editor">Editor</option>
                                        </select>
                                    </div>

                                    {/* Current shared users */}
                                    {showShareModal.sharedWith.length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            <h4 className="text-sm font-medium text-gray-700">People with access</h4>
                                            {showShareModal.sharedWith.map((user, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                                                            {user.email[0].toUpperCase()}
                                                        </div>
                                                        <span className="text-sm">{user.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => addSharedUser(showShareModal.id, user.email, e.target.value)}
                                                            className="border rounded px-2 py-1 text-sm bg-white"
                                                        >
                                                            <option value="viewer">Viewer</option>
                                                            <option value="commenter">Commenter</option>
                                                            <option value="editor">Editor</option>
                                                        </select>
                                                        <button
                                                            onClick={() => updatePermissions(showShareModal.id, user)}
                                                            className="text-gray-400 hover:text-gray-600"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <hr className="my-4" />

                                {/* General Access */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">General access</h4>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="radio"
                                                name="access"
                                                checked={showShareModal.access === 'private'}
                                                onChange={() => updateAccessLevel(showShareModal.id, 'private')}
                                                className="w-4 h-4"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">Restricted</div>
                                                <div className="text-xs text-gray-500">Only people with access can open</div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="radio"
                                                name="access"
                                                checked={showShareModal.access === 'restricted'}
                                                onChange={() => updateAccessLevel(showShareModal.id, 'restricted')}
                                                className="w-4 h-4"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">Anyone with the link</div>
                                                <div className="text-xs text-gray-500">Anyone on the internet with the link can view</div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="radio"
                                                name="access"
                                                checked={showShareModal.access === 'anyone'}
                                                onChange={() => updateAccessLevel(showShareModal.id, 'anyone')}
                                                className="w-4 h-4"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">Anyone on the internet</div>
                                                <div className="text-xs text-gray-500">Anyone can find and access</div>
                                            </div>
                                        </label>
                                    </div>

                                    {showShareModal.access !== 'private' && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <select className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white">
                                                <option value="viewer">Viewer</option>
                                                <option value="commenter">Commenter</option>
                                                <option value="editor">Editor</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Copy Link */}
                                {showShareModal.access !== 'private' && (
                                    <div className="mb-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={`https://drive.example.com/file/${showShareModal.id}`}
                                                readOnly
                                                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
                                            />
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`https://drive.example.com/file/${showShareModal.id}`);
                                                }}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                                            >
                                                Copy link
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowShareModal(null)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewerState && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4">
                            <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                                <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                                    <div className="min-w-0">
                                        <p className="truncate text-lg font-medium">{viewerState.item.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {getViewerLabel(viewerState.kind)} preview
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {viewerState.source && (
                                            <button
                                                type="button"
                                                onClick={() => window.open(viewerState.source!, '_blank', 'noopener,noreferrer')}
                                                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                                            >
                                                <ExternalLink size={16} />
                                                Buka tab baru
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setViewerState(null)}
                                            className="rounded-lg p-2 hover:bg-gray-100"
                                            aria-label="Tutup preview"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-auto bg-slate-100 p-4">
                                    {!viewerState.source && (
                                        <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
                                            {isOfficeViewerKind(viewerState.kind) ? <Presentation size={40} className="text-orange-500" /> : <File size={40} className="text-slate-400" />}
                                            <p className="text-base font-medium">URL file belum tersedia dari API</p>
                                            <p className="max-w-xl text-sm text-gray-500">
                                                Tambahkan salah satu field `preview_url`, `download_url`, `file_url`, `url`, atau `path` pada response file agar preview bisa ditampilkan.
                                            </p>
                                        </div>
                                    )}

                                    {viewerState.source && viewerState.kind === 'image' && (
                                        <div className="flex h-full items-center justify-center rounded-lg bg-white p-4">
                                            <img
                                                src={viewerState.source}
                                                alt={viewerState.item.name}
                                                className="max-h-full max-w-full rounded-lg object-contain"
                                            />
                                        </div>
                                    )}

                                    {viewerState.source && viewerState.kind === 'pdf' && (
                                        <iframe
                                            src={viewerState.source}
                                            title={viewerState.item.name}
                                            className="h-full w-full rounded-lg bg-white"
                                        />
                                    )}

                                    {viewerState.source && isOfficeViewerKind(viewerState.kind) && (
                                        isLocalOfficeSource(viewerState.source) ? (
                                            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg bg-white p-8 text-center">
                                                <Presentation size={40} className="text-orange-500" />
                                                <p className="text-base font-medium">Office Viewer tidak bisa dipakai dari URL lokal</p>
                                                <p className="max-w-xl text-sm text-gray-500">
                                                    File Office saat ini berasal dari `localhost` atau `127.0.0.1`, sehingga server Office Web Viewer tidak dapat mengaksesnya. Gunakan URL publik agar preview DOCX, XLSX, atau PPTX bisa ditampilkan.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => window.open(viewerState.source!, '_blank', 'noopener,noreferrer')}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                                                >
                                                    <ExternalLink size={16} />
                                                    Buka file
                                                </button>
                                            </div>
                                        ) : getOfficeViewerUrl(viewerState.source) ? (
                                            <iframe
                                                src={getOfficeViewerUrl(viewerState.source)!}
                                                title={viewerState.item.name}
                                                className="h-full w-full rounded-lg bg-white"
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg bg-white p-8 text-center">
                                                <Presentation size={40} className="text-orange-500" />
                                                <p className="text-base font-medium">Preview {getViewerLabel(viewerState.kind)} butuh URL publik</p>
                                                <p className="max-w-xl text-sm text-gray-500">
                                                    Browser tidak bisa me-render file Office secara native. Untuk embed, file harus bisa diakses oleh Office Web Viewer melalui URL publik.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => window.open(viewerState.source!, '_blank', 'noopener,noreferrer')}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                                                >
                                                    <ExternalLink size={16} />
                                                    Buka file
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </div>
            </CardContent>
            {showRenameModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="w-[calc(100vw-2rem)] max-w-sm rounded-lg bg-white p-4 sm:p-6">
                        <h3 className="text-xl mb-4">Rename</h3>
                        <input
                            type="text"
                            placeholder="Enter new name"
                            className="w-full border rounded px-3 py-2 mb-4"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && renameItem(showRenameModal?.id)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowRenameModal(null);
                                    setRenameValue('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => renameItem(showRenameModal?.id)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Rename
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="w-[calc(100vw-2rem)] max-w-sm rounded-lg bg-white p-4 sm:p-6">
                        <h3 className="text-xl mb-4">Konfirmasi Hapus</h3>
                        <p className="mb-4 text-gray-600">
                            Apakah Anda yakin ingin menghapus "{showDeleteConfirm.name}"? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    deleteItem(showDeleteConfirm.id);
                                    setShowDeleteConfirm(null);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </Card>

    )
};

export default FileManagerPage;
