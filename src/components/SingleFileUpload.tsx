import React, {useCallback, useEffect, useRef, useState} from "react";
import type {FileWithPreview} from "@/models/progress.ts";
import {Upload, X} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {Progress} from "@/components/ui/progress.tsx";
import {formatFileSize, getFileIcon} from "@/utils/helpers.ts";




interface fileUploadsProps {
    fileUploads: FileWithPreview[],
    onSelectFiles: (files: FileWithPreview[]) => void
    accept?: string
    title?: string
    description?: string
}

const SingleFileUpload = ({
    fileUploads,
    onSelectFiles,
    accept = "*/*",
    title = "Upload Files",
    description = "Drag and drop files here or click to browse",
} : fileUploadsProps) => {
    const [files, setFiles] = useState<FileWithPreview[]>(fileUploads)
    const [isDragOver, setIsDragOver] = useState<boolean>(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const filesRef = useRef<FileWithPreview[]>(fileUploads)
    const dragCounterRef = useRef(0)

    useEffect(() => {
        setFiles(fileUploads)
        filesRef.current = fileUploads
    }, [fileUploads])

    const processFiles = useCallback((fileList: FileList) => {
        const newFiles: FileWithPreview[] = Array.from(fileList).map((file) => {
            const fileWithPreview: FileWithPreview = {
                id: Math.random().toString(36).substring(7),
                progress: 0,
                file: file
            }

            // Create preview for images
            if (file.type.startsWith("image/")) {
                fileWithPreview.preview = URL.createObjectURL(file)
            }

            return fileWithPreview
        })

        const updatedFiles = [...filesRef.current, ...newFiles]
        filesRef.current = updatedFiles
        setFiles(updatedFiles)


        // Simulate upload progress
        newFiles.forEach((file) => {
            const interval = setInterval(() => {
                setFiles((prev) => {
                    const nextFiles = prev.map((f) =>
                        f.id === file.id ? { ...f, progress: Math.min((f.progress || 0) + 10, 100) } : f,
                    )
                    filesRef.current = nextFiles
                    return nextFiles
                })
            }, 200)

            setTimeout(() => {
                clearInterval(interval)
                setFiles((prev) => {
                    const nextFiles = prev.map((f) => (f.id === file.id ? { ...f, progress: 100 } : f))
                    filesRef.current = nextFiles
                    return nextFiles
                })
            }, 2000)
        })
        onSelectFiles(updatedFiles)
    }, [onSelectFiles])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            dragCounterRef.current = 0
            setIsDragOver(false)

            const droppedFiles = e.dataTransfer.files
            if (droppedFiles.length > 0) {
                processFiles(droppedFiles)
            }
        },
        [processFiles],
    )

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounterRef.current += 1
        setIsDragOver(true)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        e.dataTransfer.dropEffect = "copy"
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounterRef.current = Math.max(0, dragCounterRef.current - 1)

        if (dragCounterRef.current === 0) {
            setIsDragOver(false)
        }
    }, [])

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = e.target.files
            if (selectedFiles && selectedFiles.length > 0) {
                processFiles(selectedFiles)
            }
            e.target.value = ""
        },
        [processFiles],
    )

    const removeFile = useCallback((fileId: string) => {
        setFiles((prev) => {
            const fileToRemove = prev.find((f) => f.id === fileId)
            if (fileToRemove?.preview) {
                URL.revokeObjectURL(fileToRemove.preview)
            }
            const updatedFiles = prev.filter((f) => f.id !== fileId)
            filesRef.current = updatedFiles
            onSelectFiles(updatedFiles)
            return updatedFiles
        })
    }, [onSelectFiles])

    const openFileDialog = () => {
        fileInputRef.current?.click()
    }

    const clearUploadFiles = () => {
        files.forEach((file) => {
            if (file.preview) {
                URL.revokeObjectURL(file.preview)
            }
        })
        filesRef.current = []
        setFiles([])
        onSelectFiles([])
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-muted-foreground">{description}</p>
            </div>

            {/* Upload Area */}
            <Card
                className={cn(
                    "border-2 border-dashed transition-colors cursor-pointer",
                    isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                )}
                onDrop={handleDrop}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFileDialog}
            >
                <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                    <Upload
                        className={cn("h-12 w-12 mb-4 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")}
                    />
                    <div className="text-center space-y-2">
                        <p className="text-lg font-medium">{isDragOver ? "Drop files here" : "Choose files or drag and drop"}</p>
                        <p className="text-sm text-muted-foreground">Support for images, documents, videos, and more</p>
                    </div>
                    <Button variant="outline" className="mt-4" type="button">
                        Browse Files
                    </Button>
                </CardContent>
            </Card>

            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} accept={accept} />

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Uploaded Files ({files.length})</h3>
                    <div className="space-y-3">
                        {files.map((file) => {
                            const FileIcon = getFileIcon(file.file)
                            const isComplete = (file.progress || 0) === 100

                            return (
                                <Card key={file.id} className="p-4">
                                    <div className="flex items-center space-x-4">
                                        {/* File Preview/Icon */}
                                        <div className="flex-shrink-0">
                                            {file.preview ? (
                                                <img
                                                    src={file.preview || "/placeholder.svg"}
                                                    alt={file.file.name}
                                                    className="h-12 w-12 object-cover rounded-md"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                                                    <FileIcon className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.file.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatFileSize(file.file.size)}</p>

                                            {/* Progress Bar */}
                                            {!isComplete && (
                                                <div className="mt-2">
                                                    <Progress value={file.progress || 0} className="h-2" />
                                                    <p className="text-xs text-muted-foreground mt-1">{file.progress || 0}% uploaded</p>
                                                </div>
                                            )}

                                            {isComplete && <p className="text-xs text-green-600 mt-1">Upload complete</p>}
                                        </div>

                                        {/* Remove Button */}
                                        <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="flex-shrink-0">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Upload Actions */}
            {files.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                        {files.filter((f) => (f.progress || 0) === 100).length} of {files.length} files uploaded
                    </p>
                    <div className="space-x-2">
                        <Button variant="outline" onClick={() => clearUploadFiles()}>
                            Clear All
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SingleFileUpload
