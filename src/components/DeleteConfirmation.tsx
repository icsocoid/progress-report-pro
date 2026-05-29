import { Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import type { FC } from "react"

type DialogProps = {
    showModal: boolean
    onClose: (val: boolean) => void
    onSubmit: (val: boolean) => void
}

const DeleteConfirmation: FC<DialogProps> = (props) => {
    const onSubmit = (val: boolean) => {
        if (typeof props.onSubmit === "function") {
            props.onSubmit(val)
        }
    }

    return(
        <Dialog open={props.showModal} onOpenChange={props.onClose}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Konfirmasi Hapus</DialogTitle>
                    <DialogDescription>
                        Anda yakin mau hapus data ini? Jika sudah terhapus data tidak bisa dikembalikan
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                    <Button variant="outline" onClick={() => props.onClose(false)}>
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={() => onSubmit(false)}>
                        Hapus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteConfirmation