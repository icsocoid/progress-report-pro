import React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Download,
    FileText,
    Undo,
    Redo,
    List,
    ListOrdered,
    Indent,
    Outdent,
    ImageIcon, AlignJustify,
    Loader2,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type {DataRepresentative} from "@/utils/vartype.ts";
import {bulanIndo, convertIndonesiaFormat, getCurrentDateFormatted} from "@/utils/helpers.ts";
import {getNoteImageUrls} from "@/utils/noteImages.ts";

const KOP_SURAT_IMAGE_URL = "/kop_surat.jpg"
const PAGE_HEIGHT = "11.69in"
const PAGE_WIDTH = "8.27in"

// ---- Word-like page geometry (all in inches, matches jsPDF unit: "in") ----
const PAGE_WIDTH_IN = 8.27            // A4 portrait width — matches jsPDF format "a4"
const HEADER_GAP_IN = 0.0             // whitespace between letterhead and body text (like Word's header distance)
const BOTTOM_MARGIN_IN = 0.7          // reserved space at bottom for footer / page number
const SIDE_MARGIN_IN = 0.8            // left/right margin, like Word's 1" (slightly tighter to match original design)
const FALLBACK_KOP_SURAT_HEIGHT_IN = 1.1 // only used for an instant before the real image dimensions load

const MAX_IMAGE_HEIGHT_IN = 5
const getImageAspectRatio = (src: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img.naturalHeight / img.naturalWidth)
        img.onerror = reject
        img.src = src
    })
}

const NoteImages = ({note}: {note: unknown}) => {
    const imageUrls = getNoteImageUrls(note)

    if (imageUrls.length === 0) return null

    const handleResize = (img: HTMLImageElement) => {
        const currentWidth = img.style.width || ""
        const newWidth = prompt("Enter image width (in pixels, or leave empty for auto):", currentWidth ? currentWidth.replace("px", "") : "400")
        if (newWidth !== null) {
            if (newWidth === "") {
                img.style.width = ""
                img.className = "h-auto max-h-40 max-w-[220px] rounded border object-contain cursor-pointer"
            } else {
                const width = Number.parseInt(newWidth)
                if (!isNaN(width) && width > 0) {
                    img.style.width = `${width}px`
                    img.style.maxWidth = "none"
                    img.style.maxHeight = "none"
                }
            }
        }
    }

    return (
        <div className="ml-9 my-2 flex flex-wrap gap-2">
            {imageUrls.map((imageUrl, index) => (
                <img
                    key={`${imageUrl}-${index}`}
                    src={imageUrl}
                    alt={`Gambar catatan ${index + 1}`}
                    className="h-auto max-h-40 max-w-[220px] rounded border object-contain cursor-pointer"
                    onClick={(e) => handleResize(e.currentTarget)}
                />
            ))}
        </div>
    )
}

// Fetches an image (works for files served from /public, e.g. the letterhead) and
// converts it to a base64 data URL so jsPDF can embed it reliably on every page.
const loadImageAsBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url)
    const blob = await response.blob()
    return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

const DocsEditor = ({dataProgress}: DataRepresentative) =>  {
    const [documentTitle, setDocumentTitle] = useState("Untitled Document")
    const [fontSize, setFontSize] = useState("14")
    const [fontFamily, setFontFamily] = useState("Calibri")
    const [isExporting, setIsExporting] = useState(false)
    // Auto-detected from kop_surat.jpg's real aspect ratio — starts at the
    // fallback so the layout doesn't jump once the real value loads.
    const [kopSuratHeightIn, setKopSuratHeightIn] = useState(FALLBACK_KOP_SURAT_HEIGHT_IN)
    const editorRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        getImageAspectRatio(KOP_SURAT_IMAGE_URL)
            .then((ratio) => setKopSuratHeightIn(PAGE_WIDTH_IN * ratio))
            .catch(() => {
                // keep the fallback height if the image fails to load for some reason
            })
    }, [])

    // Modern formatting functions using Selection API
    const applyFormatting = useCallback((tagName: string, style?: { [key: string]: string }) => {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        if (range.collapsed) return

        try {
            const selectedContent = range.extractContents()
            const wrapper = document.createElement(tagName)

            if (style) {
                Object.assign(wrapper.style, style)
            }

            wrapper.appendChild(selectedContent)
            range.insertNode(wrapper)

            selection.removeAllRanges()
            const newRange = document.createRange()
            newRange.setStartAfter(wrapper)
            newRange.setEndAfter(wrapper)
            selection.addRange(newRange)
        } catch (error) {
            console.error("Formatting error:", error)
        }

        editorRef.current?.focus()
    }, [])

    const toggleFormatting = useCallback(
        (tagName: string) => {
            const selection = window.getSelection()
            if (!selection || selection.rangeCount === 0) return

            const range = selection.getRangeAt(0)
            const node = range.commonAncestorContainer
            let parentElement: HTMLElement | null = null

            if (node.nodeType === Node.TEXT_NODE) {
                parentElement = (node as Text).parentElement
            } else if (node instanceof HTMLElement) {
                parentElement = node
            }
            if (!parentElement) return

            const existingElement = (parentElement as Element)?.closest(tagName.toLowerCase())

            if (existingElement) {
                const parent = existingElement.parentNode
                while (existingElement.firstChild) {
                    parent?.insertBefore(existingElement.firstChild, existingElement)
                }
                parent?.removeChild(existingElement)
            } else {
                applyFormatting(tagName)
            }
        },
        [applyFormatting],
    )

    const applyAlignment = useCallback((alignment: string) => {
        const selection = window.getSelection()
        if (!selection || !editorRef.current) return

        let element: Element | null = null

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            element = range.commonAncestorContainer as Element

            if (element.nodeType === Node.TEXT_NODE) {
                element = element.parentElement
            }
        }

        while (element && element !== editorRef.current) {
            if (element.tagName && ["DIV", "P", "H1", "H2", "H3", "H4", "H5", "H6"].includes(element.tagName)) {
                ;(element as HTMLElement).style.textAlign = alignment
                break
            }
            element = element.parentElement
        }

        editorRef.current.focus()
    }, [])

    const createList = useCallback((ordered: boolean) => {
        const selection = window.getSelection()
        if (!selection || !editorRef.current) return

        editorRef.current.focus()

        const command = ordered ? "insertOrderedList" : "insertUnorderedList"
        const didCreateList = document.execCommand(command)

        if (!didCreateList || selection.rangeCount === 0) return

        let currentNode: Node | null = selection.anchorNode
        let currentElement: HTMLElement | null =
            currentNode instanceof HTMLElement ? currentNode : currentNode?.parentElement ?? null

        const list = currentElement?.closest("ol, ul") as HTMLOListElement | HTMLUListElement | null

        if (list) {
            list.style.listStyleType = ordered ? "decimal" : "disc"
            list.style.paddingLeft = "1.5rem"
        }
    }, [])

    const adjustIndent = useCallback((increase: boolean) => {
        const selection = window.getSelection()
        if (!selection || !editorRef.current) return

        let element: Element | null = null

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            element = range.commonAncestorContainer as Element

            if (element.nodeType === Node.TEXT_NODE) {
                element = element.parentElement
            }
        }

        while (element && element !== editorRef.current) {
            if (element.tagName && ["DIV", "P", "LI"].includes(element.tagName)) {
                const currentMargin = Number.parseInt((element as HTMLElement).style.marginLeft || "0")
                const newMargin = increase ? currentMargin + 20 : Math.max(0, currentMargin - 20)
                ;(element as HTMLElement).style.marginLeft = `${newMargin}px`
                break
            }
            element = element.parentElement
        }

        editorRef.current.focus()
    }, [])

    const changeFontFamily = useCallback(
        (family: string) => {
            const selection = window.getSelection()
            if (!selection || selection.rangeCount === 0) return

            const range = selection.getRangeAt(0)
            if (range.collapsed) {
                if (editorRef.current) {
                    editorRef.current.style.fontFamily = family
                }
                return
            }

            applyFormatting("span", { fontFamily: family })
        },
        [applyFormatting],
    )

    const changeFontSize = useCallback(
        (size: string) => {
            const selection = window.getSelection()
            if (!selection || selection.rangeCount === 0) return

            const range = selection.getRangeAt(0)
            if (range.collapsed) {
                if (editorRef.current) {
                    editorRef.current.style.fontSize = `${size}px`
                }
                return
            }

            applyFormatting("span", { fontSize: `${size}px` })
        },
        [applyFormatting],
    )

    const imagesToBase64 = async (img: HTMLImageElement): Promise<void> => {
        const src = img.getAttribute("src")
        if (!src || src.startsWith("data:")) return

        try {
            const response = await fetch(src, { mode: "cors", credentials: "omit" })
            const blob = await response.blob()
            const reader = new FileReader()
            await new Promise<void>((resolve, reject) => {
                reader.onload = () => {
                    img.setAttribute("src", reader.result as string)
                    resolve()
                }
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })
        } catch {
            // silently fail, keep original src
        }
    }
    const exportToPDF = useCallback(async () => {
        if (!editorRef.current) return

        const editorHtml = editorRef.current.innerHTML

        const wrapper = document.createElement("div")
        wrapper.style.cssText = `
            width: ${PAGE_WIDTH};
            background: white;
            margin: 0 auto;
            padding: 0;
        `
        wrapper.innerHTML = `
            <div style="
                width: 100%;
                font-family: ${fontFamily};
                font-size: ${fontSize}px;
                line-height: 1.5;
                background: white;
                box-sizing: border-box;
            ">
                ${editorHtml}
            </div>
        `

        const images = Array.from(wrapper.querySelectorAll("img"))
        await Promise.all(images.map(imagesToBase64))

        // 1. Ambil semua gambar dan berikan style pelindung agar tidak terpotong
        images.forEach((img) => {
            img.style.maxHeight = `${MAX_IMAGE_HEIGHT_IN}in`
            img.style.height = "auto"
            img.style.maxWidth = "100%"
            img.style.display = "block"

            // Paksa browser dan html2pdf untuk memindahkan gambar ke halaman baru jika tidak muat
            img.style.breakInside = "avoid"
            ;(img.style as unknown as Record<string, string>).pageBreakInside = "avoid"
        })

        // 2. Ambil semua div pembungkus gambar (komponen NoteImages) di dalam wrapper
        // atau paragraf temuan yang berisi gambar agar satu kesatuan tidak terpotong terpisah
        const imageContainers = Array.from(wrapper.querySelectorAll(".flex-wrap, p"))
        imageContainers.forEach((container) => {
            if (container.querySelector("img")) {
                ;(container as HTMLElement).style.breakInside = "avoid"
                ;((container as HTMLElement).style as unknown as Record<string, string>).pageBreakInside = "avoid"
                // Kadang flexbox bermasalah saat kalkulasi pagebreak html2canvas, ubah jadi block saat render PDF jika perlu
                ;(container as HTMLElement).style.display = "block"
            }
        })

        const textElements = Array.from(wrapper.querySelectorAll("p, li, .flex-wrap, h1, h2, h3, strong"));
        textElements.forEach((el) => {
            const element = el as HTMLElement;
            element.style.breakInside = "avoid";
            (element.style as any).pageBreakInside = "avoid";

            // Khusus flexbox (seperti div pembungkus gambar), ubah ke block saat export PDF
            // karena html2canvas sering salah kalkulasi tinggi pada layout flex/grid
            if (element.classList.contains("flex") || element.classList.contains("flex-wrap")) {
                element.style.display = "block";
            }
        });

        document.body.appendChild(wrapper)
        const kopSuratBase64 = await loadImageAsBase64(KOP_SURAT_IMAGE_URL)

        const kopSuratRatio = await getImageAspectRatio(kopSuratBase64).catch(
            () => kopSuratHeightIn / PAGE_WIDTH_IN,
        )
        const effectiveKopSuratHeightIn = PAGE_WIDTH_IN * kopSuratRatio
        const topMarginIn = effectiveKopSuratHeightIn + HEADER_GAP_IN

        const html2pdf = (await import("html2pdf.js")).default

        const opt = {
            margin: [topMarginIn, SIDE_MARGIN_IN, BOTTOM_MARGIN_IN, SIDE_MARGIN_IN],
            filename: `${documentTitle}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, allowTaint: true },
            pagebreak: { mode: ["css"], avoid: ["img", "tr"] },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        }

        const worker = html2pdf().set(opt).from(wrapper)

        // Build the paginated PDF first, then grab the underlying jsPDF
        // instance so we can draw on top of every page.
        const pdf = await worker.toPdf().get("pdf")

        const totalPages = pdf.internal.getNumberOfPages()
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()

        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i)

            // Header: letterhead banner, edge-to-edge, on every page — sized by
            // its real aspect ratio so it's never stretched or squished.
            pdf.addImage(kopSuratBase64, "JPEG", 0, 0, pageWidth, effectiveKopSuratHeightIn)

            // Footer: simple page-number footer, like Word's default.
            pdf.setFontSize(9)
            pdf.setTextColor(120, 120, 120)
            pdf.text(
                `Halaman ${i} dari ${totalPages}`,
                pageWidth / 2,
                pageHeight - 0.4,
                { align: "center" }
            )
        }

        document.body.removeChild(wrapper)

        await worker.save()
    }, [documentTitle, fontFamily, fontSize, kopSuratHeightIn])

    const handleFontSizeChange = useCallback(
        (size: string) => {
            setFontSize(size)
            changeFontSize(size)
        },
        [changeFontSize],
    )

    const handleExportPDF = useCallback(async () => {
        setIsExporting(true)
        try {
            await exportToPDF()
        } finally {
            setIsExporting(false)
        }
    }, [exportToPDF])

    const handleFontFamilyChange = useCallback(
        (family: string) => {
            setFontFamily(family)
            changeFontFamily(family)
        },
        [changeFontFamily],
    )

    const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file || !editorRef.current) return

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.")
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Image size should be less than 5MB.")
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const imageUrl = e.target?.result as string

            const img = document.createElement("img")
            img.src = imageUrl
            img.style.maxWidth = "100%"
            img.style.height = "auto"
            img.style.display = "block"
            img.style.margin = "10px 0"
            img.style.cursor = "pointer"

            img.onclick = () => {
                const newWidth = prompt("Enter image width (in pixels, or leave empty for auto):", "400")
                if (newWidth !== null) {
                    if (newWidth === "") {
                        img.style.width = "auto"
                    } else {
                        const width = Number.parseInt(newWidth)
                        if (!isNaN(width) && width > 0) {
                            img.style.width = `${width}px`
                        }
                    }
                }
            }

            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                range.deleteContents()
                range.insertNode(img)

                range.setStartAfter(img)
                range.setEndAfter(img)
                selection.removeAllRanges()
                selection.addRange(range)
            } else {
                editorRef.current?.appendChild(img)
            }

            editorRef.current?.focus()
        }

        reader.readAsDataURL(file)

        event.target.value = ""
    }, [])

    const triggerImageUpload = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleUndo = useCallback(() => {
        if (editorRef.current) {
            editorRef.current.focus()
            document.execCommand("undo")
        }
    }, [])

    const handleRedo = useCallback(() => {
        if (editorRef.current) {
            editorRef.current.focus()
            document.execCommand("redo")
        }
    }, [])

    const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
        const items = event.clipboardData?.items
        if (!items || !editorRef.current) return

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                // Mencegah aksi paste bawaan jika yang di-paste adalah gambar
                event.preventDefault()

                const file = items[i].getAsFile()
                if (!file) continue

                const reader = new FileReader()
                reader.onload = (e) => {
                    const imageUrl = e.target?.result as string

                    // Buat elemen gambar baru
                    const img = document.createElement("img")
                    img.src = imageUrl
                    img.style.maxWidth = "100%"
                    img.style.height = "auto"
                    img.style.display = "block"
                    img.style.margin = "10px 0"
                    img.style.cursor = "pointer"

                    // Fitur ubah ukuran saat diklik (sama seperti fitur upload Anda)
                    img.onclick = () => {
                        const newWidth = prompt("Enter image width (in pixels, or leave empty for auto):", "400")
                        if (newWidth !== null) {
                            if (newWidth === "") {
                                img.style.width = "auto"
                            } else {
                                const width = Number.parseInt(newWidth)
                                if (!isNaN(width) && width > 0) {
                                    img.style.width = `${width}px`
                                }
                            }
                        }
                    }

                    // Sisipkan gambar ke posisi kursor saat ini
                    const selection = window.getSelection()
                    if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0)
                        range.deleteContents()
                        range.insertNode(img)

                        // Pindahkan kursor ke setelah gambar
                        range.setStartAfter(img)
                        range.setEndAfter(img)
                        selection.removeAllRanges()
                        selection.addRange(range)
                    } else {
                        editorRef.current?.appendChild(img)
                    }
                }

                reader.readAsDataURL(file)
                break // Stop perulangan setelah menemukan satu gambar
            }
        }
    }, [])

    return (
        <div className="min-h-screen min-w-0 overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-2">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <span className="text-xl font-medium text-gray-700">Docs</span>
                        </div>
                        <Input
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                            className="h-auto min-w-0 px-2 py-1 text-lg font-medium border-none shadow-none focus-visible:ring-0"
                            placeholder="Untitled Document"
                        />
                    </div>
                    <Button onClick={handleExportPDF} disabled={isExporting} className="w-full gap-2 sm:w-auto">
                        {isExporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        {isExporting ? "Exporting..." : "Export PDF"}
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-2">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleUndo} className="p-2">
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleRedo} className="p-2">
                        <Redo className="w-4 h-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
                        <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                            <SelectItem value="Calibri">Calibri</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={fontSize} onValueChange={handleFontSizeChange}>
                        <SelectTrigger className="w-16 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="11">11</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="14">14</SelectItem>
                            <SelectItem value="16">16</SelectItem>
                            <SelectItem value="18">18</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="24">24</SelectItem>
                            <SelectItem value="28">28</SelectItem>
                            <SelectItem value="32">32</SelectItem>
                        </SelectContent>
                    </Select>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    <Button variant="ghost" size="sm" onClick={() => toggleFormatting("strong")} className="p-2">
                        <Bold className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleFormatting("em")} className="p-2">
                        <Italic className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleFormatting("u")} className="p-2">
                        <Underline className="w-4 h-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    <Button variant="ghost" size="sm" onClick={() => applyAlignment("left")} className="p-2">
                        <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => applyAlignment("center")} className="p-2">
                        <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => applyAlignment("right")} className="p-2">
                        <AlignRight className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => applyAlignment("justify")} className="p-2">
                        <AlignJustify className="w-4 h-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    <Button variant="ghost" size="sm" onClick={() => createList(false)} className="p-2">
                        <List className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => createList(true)} className="p-2">
                        <ListOrdered className="w-4 h-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    <Button variant="ghost" size="sm" onClick={() => adjustIndent(true)} className="p-2">
                        <Indent className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => adjustIndent(false)} className="p-2">
                        <Outdent className="w-4 h-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    <Button variant="ghost" size="sm" onClick={triggerImageUpload} className="p-2">
                        <ImageIcon className="w-4 h-4" />
                    </Button>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
            </div>

            {/* Document Editor */}
            <div className="overflow-x-auto px-3 py-6 sm:px-6 sm:py-8">
                <div
                    className="mx-auto bg-white shadow-lg relative"
                    style={{
                        width: "100%",
                        maxWidth: PAGE_WIDTH,
                        minHeight: PAGE_HEIGHT,
                    }}
                >
                    {/* On-screen preview of the letterhead, so what you see roughly matches
                        the first page of the export. It is NOT part of the exported HTML —
                        the export stamps its own copy on every page (see exportToPDF).
                        Using a real <img> with width:100%/height:auto (rather than a CSS
                        background-size with a guessed height) means it always keeps its
                        true aspect ratio — this is what fixes the stretched/squished look. */}
                    <img
                        src={KOP_SURAT_IMAGE_URL}
                        alt="Kop Surat"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "auto",
                            display: "block",
                            pointerEvents: "none",
                        }}
                    />
                    <div
                        ref={editorRef}
                        contentEditable
                        onPaste={handlePaste} // <--- TAMBAHKAN INI DI SINI
                        className="min-h-full max-w-none p-6 outline-none prose prose-sm sm:prose-lg sm:p-16"
                        style={{
                            fontFamily: fontFamily,
                            fontSize: `${fontSize}px`,
                            lineHeight: "1.5",
                            minHeight: PAGE_HEIGHT,
                            paddingTop: `${kopSuratHeightIn + HEADER_GAP_IN}in`,
                            paddingBottom: "0.5in",
                            position: "relative",
                        }}
                        suppressContentEditableWarning={true}
                        onInput={(e) => {
                            const target = e.target as HTMLDivElement
                            if (target.innerHTML === "" || target.innerHTML === "<br>") {
                                target.innerHTML = "<div><br></div>"
                            }
                        }}
                    >
                        {
                            dataProgress.id !== "" ?
                                <div>
                                    <p><strong>Representative letter</strong></p>
                                    <p className="text-right">Surabaya, {getCurrentDateFormatted('indonesian')}</p>
                                    <p>Kepada Yth,</p>
                                    <p>{dataProgress.client.customer_name}</p>
                                    <p><u><strong>{dataProgress.client.company_name}</strong></u></p>
                                    <p>{dataProgress.client.address}</p>
                                    <p>&nbsp;</p>
                                    <p>Dengan hormat,</p>
                                    <p>Melalui surat ini, terdapat beberapa hal yang ingin kami sampaikan kepada Direksi terkait
                                        hasil progress report yang ada pada <strong>{dataProgress.client.company_name}</strong>. Hal ini
                                        bertujuan agar Direksi mengetahui kondisi badan usaha saat ini.</p>
                                    <p>Beberapa hal yang ingin kami sampaikan, yaitu:&nbsp;</p>
                                    <p><strong>TEMUAN:</strong></p>
                                    {dataProgress.job_task?.length > 0 &&
                                        dataProgress.job_task.map((task, idx) => (
                                            <React.Fragment key={idx}>
                                                <p><strong>{idx + 1}. {task.task_name}</strong></p>

                                                {task.masalah?.length > 0 &&
                                                    task.masalah.map((item, idxMasalah) => (
                                                        <React.Fragment key={idxMasalah}>
                                                            <p className="ml-3">{idx + 1}.{idxMasalah + 1}. {item.note}. <strong>{item.nomor} - {convertIndonesiaFormat(item.tanggal)}</strong></p>
                                                            <NoteImages note={item} />
                                                            {
                                                                item.solusi !== '' && item.solusi !== null ? (
                                                                    <><p className="ml-10"><strong>- Solusi</strong>: {item.solusi}</p></>) : ""
                                                            }

                                                        </React.Fragment>
                                                    ))
                                                }
                                            </React.Fragment>
                                        ))
                                    }
                                    <p><strong>Progress Report</strong></p>
                                    {dataProgress.progress?.length > 0 &&
                                        dataProgress.progress.map((periode, idx) => (
                                            <React.Fragment key={idx}>
                                                <p><strong>{String.fromCharCode(97 + idx)}. Progress Periode {bulanIndo[parseInt(periode.periode.bulan)-1]} {periode.periode.tahun}</strong></p>

                                                <p className="ml-3"><strong>- Todo</strong></p>
                                                {periode.periode.task?.length > 0 &&
                                                    periode.periode.task.map((item, idxMasalah) => (
                                                        <React.Fragment key={idxMasalah}>
                                                            <p className="ml-6">{idxMasalah + 1}. {item.task_name} {item.selesai !== '' ? <strong>{`(Selesai tgl ${convertIndonesiaFormat(item.selesai)})`}</strong> : ''}</p>
                                                            {
                                                                item.progress.length > 0 && item.progress.map((itemJob, idxJob) => (
                                                                    <React.Fragment key={idxJob}>
                                                                        <p className="ml-9">{idxJob + 1}. {itemJob.note}. <strong>{itemJob.nomor} - {convertIndonesiaFormat(itemJob.tanggal)}</strong></p>
                                                                        <NoteImages note={itemJob} />

                                                                    </React.Fragment>
                                                                ))
                                                            }
                                                        </React.Fragment>
                                                    ))
                                                }
                                                <p className="ml-3"><strong>- Informasi Lain</strong></p>
                                                {periode.periode.informasi?.length > 0 &&
                                                    periode.periode.informasi.map((item, idxMasalah) => (
                                                        <React.Fragment key={idxMasalah}>
                                                            <p className="ml-6">{idxMasalah + 1}. {item.note}</p>
                                                        </React.Fragment>
                                                    ))
                                                }
                                            </React.Fragment>
                                        ))
                                    }
                                    <p>&nbsp;</p>
                                    <p>Akhir kata, kami dari ALS AccounTax Management Consultant ingin mengucapkan terima kasih yang sebesar-besarnya atas kerja sama yang baik yang telah terjalin selama ini.</p>
                                    <p>Semoga dengan kehadiran kami, dapat membawa dampak dan perubahan yang baik bagi <strong>{dataProgress.client.company_name}</strong>. </p>
                                    <p>&nbsp;</p>
                                    <p>&nbsp;</p>

                                </div>
                                : null }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DocsEditor
