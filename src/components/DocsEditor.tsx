import React from "react"

import { useState, useRef, useCallback } from "react"
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
    ImageIcon,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type {DataRepresentative} from "@/utils/vartype.ts";
import {bulanIndo, convertIndonesiaFormat, getCurrentDateFormatted} from "@/utils/helpers.ts";

const DocsEditor = ({dataProgress}: DataRepresentative) =>  {
    const [documentTitle, setDocumentTitle] = useState("Untitled Document")
    const [fontSize, setFontSize] = useState("14")
    const [fontFamily, setFontFamily] = useState("Calibri")
    const editorRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

            // Clear selection and place cursor after the formatted text
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

            // Check if selection is already formatted
            if (node.nodeType === Node.TEXT_NODE) {
                parentElement = (node as Text).parentElement
            } else if (node instanceof HTMLElement) {
                parentElement = node
            }
            if (!parentElement) return

            const existingElement = (parentElement as Element)?.closest(tagName.toLowerCase())

            if (existingElement) {
                // Remove formatting
                const parent = existingElement.parentNode
                while (existingElement.firstChild) {
                    parent?.insertBefore(existingElement.firstChild, existingElement)
                }
                parent?.removeChild(existingElement)
            } else {
                // Apply formatting
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

        // Find the closest block element
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

        const listTag = ordered ? "ol" : "ul"
        const list = document.createElement(listTag)
        const listItem = document.createElement("li")

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const selectedContent = range.extractContents()

            if (selectedContent.textContent?.trim()) {
                listItem.appendChild(selectedContent)
            } else {
                listItem.innerHTML = "<br>"
            }

            list.appendChild(listItem)
            range.insertNode(list)

            // Position cursor in the list item
            const newRange = document.createRange()
            newRange.setStart(listItem, 0)
            newRange.setEnd(listItem, 0)
            selection.removeAllRanges()
            selection.addRange(newRange)
        }

        editorRef.current.focus()
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

        // Find the closest block element
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
                // If no selection, apply to future typing
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
                // If no selection, apply to future typing
                if (editorRef.current) {
                    editorRef.current.style.fontSize = `${size}px`
                }
                return
            }

            applyFormatting("span", { fontSize: `${size}px` })
        },
        [applyFormatting],
    )

    const exportToPDF = useCallback(async () => {
        if (!editorRef.current) return

        // Dynamic import to avoid SSR issues
        const html2pdf = (await import("html2pdf.js")).default

        const element = editorRef.current
        const opt = {
            margin: 1,
            filename: `${documentTitle}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        }

        html2pdf().set(opt).from(element).save()
    }, [documentTitle])

    const handleFontSizeChange = useCallback(
        (size: string) => {
            setFontSize(size)
            changeFontSize(size)
        },
        [changeFontSize],
    )

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

        // Check if file is an image
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.")
            return
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image size should be less than 5MB.")
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const imageUrl = e.target?.result as string

            // Create image element
            const img = document.createElement("img")
            img.src = imageUrl
            img.style.maxWidth = "100%"
            img.style.height = "auto"
            img.style.display = "block"
            img.style.margin = "10px 0"
            img.style.cursor = "pointer"

            // Add click handler for image selection/resizing
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

            // Insert image at cursor position
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                range.deleteContents()
                range.insertNode(img)

                // Move cursor after image
                range.setStartAfter(img)
                range.setEndAfter(img)
                selection.removeAllRanges()
                selection.addRange(range)
            } else {
                // If no selection, append to editor
                editorRef.current?.appendChild(img)
            }

            editorRef.current?.focus()
        }

        reader.readAsDataURL(file)

        // Reset file input
        event.target.value = ""
    }, [])

    const triggerImageUpload = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    // Undo/Redo functionality using browser's built-in history
    const handleUndo = useCallback(() => {
        if (editorRef.current) {
            editorRef.current.focus()
            document.execCommand("undo") // This specific command is still supported for undo/redo
        }
    }, [])

    const handleRedo = useCallback(() => {
        if (editorRef.current) {
            editorRef.current.focus()
            document.execCommand("redo") // This specific command is still supported for undo/redo
        }
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-2">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <span className="text-xl font-medium text-gray-700">Docs</span>
                        </div>
                        <Input
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                            className="text-lg font-medium border-none shadow-none focus-visible:ring-0 px-2 py-1 h-auto"
                            placeholder="Untitled Document"
                        />
                    </div>
                    <Button onClick={exportToPDF} className="gap-2">
                        <Download className="w-4 h-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-2">
                <div className="flex items-center gap-2 max-w-6xl mx-auto">
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
            <div className="flex justify-center py-8">
                <div className="bg-white shadow-lg" style={{ width: "8.5in", minHeight: "11in" }}>
                    <div
                        ref={editorRef}
                        contentEditable
                        className="p-16 min-h-full outline-none prose prose-lg max-w-none"
                        style={{
                            fontFamily: fontFamily,
                            fontSize: `${fontSize}px`,
                            lineHeight: "1.5",
                        }}
                        suppressContentEditableWarning={true}
                        onInput={(e) => {
                            // Keep the editor focused and maintain cursor position
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
                                <p>&nbsp;</p>
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
                                            {/* Judul tugas */}
                                            <p><strong>{idx + 1}. {task.task_name}</strong></p>

                                            {/* Daftar masalah & solusi */}
                                            {task.masalah?.length > 0 &&
                                                task.masalah.map((item, idxMasalah) => (
                                                    <React.Fragment key={idxMasalah}>
                                                        <p className="ml-3">{idx + 1}.{idxMasalah + 1}. {item.note}. <strong>{item.nomor} - {convertIndonesiaFormat(item.tanggal)}</strong></p>
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
                                            {/* Judul tugas */}
                                            <p><strong>{String.fromCharCode(97 + idx)}. Progress Periode {bulanIndo[parseInt(periode.periode.bulan)-1]} {periode.periode.tahun}</strong></p>

                                            {/* Daftar masalah & solusi */}
                                            <p className="ml-3"><strong>- Todo</strong></p>
                                            {periode.periode.task?.length > 0 &&
                                                periode.periode.task.map((item, idxMasalah) => (
                                                    <React.Fragment key={idxMasalah}>
                                                        <p className="ml-6">{idxMasalah + 1}. {item.task_name} {item.selesai !== '' ? <strong>{`(Selesai tgl ${convertIndonesiaFormat(item.selesai)})`}</strong> : ''}</p>
                                                        {
                                                            item.progress.length > 0 && item.progress.map((itemJob, idxJob) => (
                                                                <React.Fragment key={idxJob}>
                                                                    <p className="ml-9">{idxJob + 1}. {itemJob.note}. <strong>{itemJob.nomor} - {convertIndonesiaFormat(itemJob.tanggal)}</strong></p>

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
                            </div>
                                : null }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DocsEditor
