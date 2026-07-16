import {type ChangeEvent, useEffect, useRef} from "react";
import {ImagePlus, X} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import type {FileWithPreview} from "@/models/progress.ts";
import {formatFileSize} from "@/utils/helpers.ts";
import {useToast} from "@/hooks/use-toast.ts";

const MAX_IMAGE_SIZE = 1024 * 1024;

type NoteImageUploadProps = {
    images?: FileWithPreview[]
    onChange: (images: FileWithPreview[]) => void
}

const NoteImageUpload = ({images = [], onChange}: NoteImageUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {toast} = useToast();

    useEffect(() => {
        return () => {
            images.forEach((image) => {
                if (image.preview) {
                    URL.revokeObjectURL(image.preview);
                }
            });
        };
    }, []);

    const handleSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        const validImages: FileWithPreview[] = [];
        const rejectedNames: string[] = [];

        selectedFiles.forEach((file) => {
            if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) {
                rejectedNames.push(file.name);
                return;
            }

            validImages.push({
                id: crypto.randomUUID(),
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                preview: URL.createObjectURL(file),
            });
        });

        if (rejectedNames.length > 0) {
            toast({
                title: "Peringatan!",
                description: `File harus berupa gambar dan maksimal 1 MB: ${rejectedNames.join(", ")}`,
                duration: 3000,
            });
        }

        if (validImages.length > 0) {
            images.forEach((image) => {
                if (image.preview) {
                    URL.revokeObjectURL(image.preview);
                }
            });
            onChange([validImages[0]]);
        }

        event.target.value = "";
    };

    const removeImage = (imageId: string) => {
        const imageToRemove = images.find((image) => image.id === imageId);
        if (imageToRemove?.preview) {
            URL.revokeObjectURL(imageToRemove.preview);
        }

        onChange(images.filter((image) => image.id !== imageId));
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className="h-4 w-4 mr-2"/>
                    Gambar
                </Button>
                <span className="text-xs text-muted-foreground">Maks. 1 MB</span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSelectFiles}
            />

            {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((image) => (
                        <div key={image.id} className="relative rounded-md border bg-muted/20 p-2">
                            <img
                                src={image.preview}
                                alt={image.file.name}
                                className="h-20 w-full rounded object-cover"
                            />
                            <div className="mt-1 min-w-0">
                                <p className="truncate text-xs font-medium">{image.file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(image.file.size)}</p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1 h-7 w-7 bg-background/90"
                                onClick={() => removeImage(image.id)}
                            >
                                <X className="h-4 w-4"/>
                                <span className="sr-only">Hapus gambar</span>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NoteImageUpload;
