import {FileText, ImageIcon, Music, Video} from "lucide-react";

export const getFileIcon = (file: File) => {
    const type = file?.type || "";

    if (type.startsWith("image/")) return ImageIcon;
    if (type.startsWith("video/")) return Video;
    if (type.startsWith("audio/")) return Music;
    if (type.includes("text") || type.includes("document")) return FileText;

    return FileText;
}

export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const bulanIndo = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
]

export const convertIndonesiaFormat = (tanggal: string) => {
    const [tahun, bulan, hari] = tanggal.split("-");
    const namaBulan = bulanIndo[parseInt(bulan, 10) - 1];

    return `${parseInt(hari)} ${namaBulan} ${tahun}`;
}

export const getCurrentDateFormatted = (format = '') => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const date = String(now.getDate()).padStart(2, '0');
    const tgl = `${year}-${month}-${date}`
    if(format === 'indonesian') {
        return convertIndonesiaFormat(tgl)
    }
    return tgl;
}

export const shortenEmail = (email: string) => {

        if (!email) return '';

        const [localPart, domain] = email.split('@');
        if (!localPart || !domain) return email;

        // split the local part into words by dot
        const parts = localPart.split('.');

        if (parts.length >= 3) {
            // keep the first and last part, replace middle with '...'
            return `${parts[0]}....${parts[parts.length - 1]}@${domain}`;
        } else if (localPart.length > 15) {
            // if no dots, just truncate the local part
            return localPart.substring(0, 5) + '...' + localPart.substring(localPart.length - 3) + '@' + domain;
        } else {
            return email;
        }

}

export const shortenTextCustom= (text: string, maxLength=10, separator = "...")=> {
    if (text.length <= maxLength) {
        return text;
    }

    const availableLength = maxLength - separator.length;
    const startLength = Math.ceil(availableLength / 2);
    const endLength = Math.floor(availableLength / 2);

    const start = text.substring(0, startLength);
    const end = text.substring(text.length - endLength);

    return start + separator + end;
}

export const getInitialsLimited = (name: string, limit = 2)=> {
    return name
        .replace(/\./g, '')           // Remove periods
        .split(/\s+/)                 // Split by spaces
        .filter(word => word.length > 0)
        .slice(0, limit)              // Take only first N words
        .map(word => word.charAt(0))  // Get first character
        .join('')                     // Join without spaces
        .toUpperCase();               // Convert to uppercase
}