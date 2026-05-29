export type UploadProgress = { name: string; progress: number } | null;
export interface Permission {
    email: string;
    role: 'viewer' | 'editor' | 'owner' | string; // tambahkan opsi lain kalau ada
}



export interface Item {
    id: number;
    name: string;
    type: 'file' | 'folder';
    owner: string;
    access: 'private' | 'restricted' | 'anyone' | string;
    sharedWith: Permission[];
    size?: string; // optional karena folder tidak punya size
    modified: string;
    content?: string;
    parentId: number | null;
    url?: string;
    file_url?: string;
    preview_url?: string;
    download_url?: string;
    path?: string;
    mime_type?: string;
    mimeType?: string;
    extension?: string;
}

export interface Folder {
    id: number | null;
    name: string;
}

export interface ContextMenuState {
    x: number;
    y: number;
    item: Item | null;
}

export interface ContextItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
}
