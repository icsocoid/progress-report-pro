import type {DataTemuan} from "@/utils/vartype.ts";
import type {FileWithPreview} from "@/models/progress.ts";
import {Button} from "@/components/ui/button.tsx";
import {PlusCircle, Trash2} from "lucide-react";
import {Textarea} from "@/components/ui/textarea.tsx";
import SingleFileUpload from "@/components/SingleFileUpload.tsx";

const OtherForm = ({dataTemuan, setDataTemuan}: DataTemuan) => {

    const addInformation = () => {
        setDataTemuan(prev => ({
            ...prev,
            informasi_lain: [...(prev.informasi_lain ?? []), { id: crypto.randomUUID(), note: "" }]
        }))
    }

    const updateNote = (index: number, value: string) => {
        const updatedInformasi = [...(dataTemuan.informasi_lain ?? [])]
        updatedInformasi[index].note = value
        setDataTemuan({ ...dataTemuan, informasi_lain: updatedInformasi })
    }

    const removeInformation = (index: number) => {
        const updatedInformasi = [...(dataTemuan.informasi_lain ?? [])]
        updatedInformasi.splice(index, 1)
        setDataTemuan({ ...dataTemuan, informasi_lain: updatedInformasi })
    }

    const onSelectFileUpload = (files: FileWithPreview[]) => {
        setDataTemuan(prev => ({
            ...prev,
            files: files,
        }))
    }


    return (
        <div>
            <div className="grid gap-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Informasi Lain</label>
                    <Button type="button" variant="outline" size="sm" onClick={addInformation}>
                        <PlusCircle className="h-4 w-4 mr-2"/>
                        Tambah
                    </Button>
                </div>

                {dataTemuan?.informasi_lain?.map((inp, index) => (
                    <div key={inp.id} className="flex items-center gap-2">
                        <div className="flex-1">
                            <Textarea
                                placeholder="Keterangan..."
                                value={inp.note}
                                onChange={(e) => updateNote(index, e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeInformation(index)}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4"/>
                            <span className="sr-only">Hapus Informasi</span>
                        </Button>
                    </div>
                ))}
            </div>
            <div className="grid gap-4 mt-3">

                <div className="grid gap-6">

                    <SingleFileUpload fileUploads={dataTemuan.files || []} onSelectFiles={onSelectFileUpload} />
                </div>
            </div>
        </div>
    )
}

export default OtherForm