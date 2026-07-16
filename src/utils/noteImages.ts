type ImageLike = {
    attachment?: string | ImageLike | Array<string | ImageLike>
    attachments?: Array<string | ImageLike>
    download_url?: string
    file?: string | ImageLike
    files?: Array<string | ImageLike>
    preview_url?: string
    preview?: string
    file_url?: string
    url?: string
    path?: string
    file_path?: string
    image?: string | ImageLike | Array<string | ImageLike>
    images?: Array<string | ImageLike>
    image_url?: string
    image_path?: string
    gambar?: string | ImageLike | Array<string | ImageLike>
    foto?: string | ImageLike | Array<string | ImageLike>
    media?: Array<string | ImageLike>
    note_image?: string | ImageLike | Array<string | ImageLike>
    note_images?: Array<string | ImageLike>
    progress_image?: string | ImageLike | Array<string | ImageLike>
    progress_images?: Array<string | ImageLike>
    progress_note_image?: string | ImageLike | Array<string | ImageLike>
    progress_note_images?: Array<string | ImageLike>
    original_url?: string
    src?: string
}

const toAbsoluteUrl = (value?: string) => {
    if (!value) return ""
    if (value.startsWith("blob:") || value.startsWith("data:")) {
        return value
    }

    const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")

    let directUrl: string
    if (value.startsWith("http")) {
        directUrl = value
    } else {
        const pathWithoutLeadingSlash = value.replace(/^\/+/, "")
        const storagePath = pathWithoutLeadingSlash.startsWith("storage/") || pathWithoutLeadingSlash.startsWith("public/storage/")
            ? pathWithoutLeadingSlash
            : `storage/${pathWithoutLeadingSlash}`
        directUrl = `${baseUrl}/${storagePath}`
    }

    if (baseUrl && directUrl.startsWith(baseUrl)) {
        return `${baseUrl}/api/progress/image-proxy?url=${encodeURIComponent(directUrl)}`
    }

    return directUrl
}

const imageToUrl = (image: string | ImageLike): string => {
    if (typeof image === "string") {
        return toAbsoluteUrl(image)
    }

    return toAbsoluteUrl(
        image.preview_url ||
        image.preview ||
        image.file_url ||
        image.url ||
        image.path ||
        image.file_path ||
        image.image_url ||
        image.image_path ||
        image.download_url ||
        image.original_url ||
        image.src,
    )
}

const collectImageUrls = (value: unknown): string[] => {
    if (!value) return []

    if (typeof value === "string") {
        return [toAbsoluteUrl(value)]
    }

    if (Array.isArray(value)) {
        return value.flatMap(collectImageUrls)
    }

    if (typeof value !== "object") {
        return []
    }

    const image = value as ImageLike
    return [
        imageToUrl(image),
        ...collectImageUrls(image.images),
        ...collectImageUrls(image.image),
        ...collectImageUrls(image.files),
        ...collectImageUrls(image.file),
        ...collectImageUrls(image.attachments),
        ...collectImageUrls(image.attachment),
        ...collectImageUrls(image.gambar),
        ...collectImageUrls(image.foto),
        ...collectImageUrls(image.media),
        ...collectImageUrls(image.note_images),
        ...collectImageUrls(image.note_image),
        ...collectImageUrls(image.progress_images),
        ...collectImageUrls(image.progress_image),
        ...collectImageUrls(image.progress_note_images),
        ...collectImageUrls(image.progress_note_image),
    ]
}

export const getNoteImageUrls = (note: unknown) => {
    const noteData = note as {
        attachment?: string | ImageLike | Array<string | ImageLike>
        attachments?: Array<string | ImageLike>
        file?: string | ImageLike
        files?: Array<string | ImageLike>
        gambar?: string | ImageLike | Array<string | ImageLike>
        foto?: string | ImageLike | Array<string | ImageLike>
        image?: string | ImageLike | Array<string | ImageLike>
        images?: Array<string | ImageLike>
        image_url?: string
        image_path?: string
        preview_url?: string
        file_url?: string
        download_url?: string
        original_url?: string
        url?: string
        path?: string
        file_path?: string
        media?: Array<string | ImageLike>
        note_image?: string | ImageLike | Array<string | ImageLike>
        note_images?: Array<string | ImageLike>
        progress_image?: string | ImageLike | Array<string | ImageLike>
        progress_images?: Array<string | ImageLike>
        progress_note_image?: string | ImageLike | Array<string | ImageLike>
        progress_note_images?: Array<string | ImageLike>
        src?: string
    }

    const urls = [
        ...collectImageUrls(noteData.images),
        ...collectImageUrls(noteData.files),
        ...collectImageUrls(noteData.file),
        ...collectImageUrls(noteData.attachments),
        ...collectImageUrls(noteData.attachment),
        ...collectImageUrls(noteData.gambar),
        ...collectImageUrls(noteData.foto),
        ...collectImageUrls(noteData.media),
        ...collectImageUrls(noteData.note_images),
        ...collectImageUrls(noteData.note_image),
        ...collectImageUrls(noteData.progress_images),
        ...collectImageUrls(noteData.progress_image),
        ...collectImageUrls(noteData.progress_note_images),
        ...collectImageUrls(noteData.progress_note_image),
        toAbsoluteUrl(noteData.image_url),
        toAbsoluteUrl(noteData.image_path),
        toAbsoluteUrl(noteData.preview_url),
        toAbsoluteUrl(noteData.file_url),
        toAbsoluteUrl(noteData.download_url),
        toAbsoluteUrl(noteData.original_url),
        toAbsoluteUrl(noteData.url),
        toAbsoluteUrl(noteData.path),
        toAbsoluteUrl(noteData.file_path),
        toAbsoluteUrl(noteData.src),
    ]

    return Array.from(new Set(urls.filter(Boolean)))
}
