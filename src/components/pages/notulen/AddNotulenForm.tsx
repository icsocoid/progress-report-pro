
import {useState} from "react";
import {useToast} from "@/hooks/use-toast.ts";
import {useUser} from "@/models/user.ts";
import {AlertTriangle, Check, Loader2} from "lucide-react";
import axios from "axios";
import {Button} from "@/components/ui/button.tsx";
import {InitTemuan} from "@/models/temuan";
import SuccessForm from "@/components/pages/notulen/steps/SuccessForm.tsx";
import InformasiForm from "@/components/pages/notulen/steps/Informasi.tsx";
import TeamForm from "@/components/pages/notulen/steps/TeamForm.tsx";
import CaseForm from "@/components/pages/notulen/steps/CaseForm.tsx";
import OtherForm from "@/components/pages/notulen/steps/OtherForm.tsx";
import {SOLUSITYPE} from "@/utils/vartype.ts";
import {Card, CardContent} from "@/components/ui/card.tsx";

const AddNotulenForm = () => {
    const [isComplete, setIsComplete] = useState(false)
    const [dataTemuan, setDataTemuan] = useState(InitTemuan)
    const [submittedTemuanId, setSubmittedTemuanId] = useState("")
    const { toast } = useToast()
    const user = useUser()
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('user_id', user?.id || '0')
            formData.append('tipe', SOLUSITYPE.NOTULEN)
            formData.append('tanggal', dataTemuan.tanggal)
            formData.append('client_code', dataTemuan.client.customer_code)
            formData.append('job_id', dataTemuan.job_id || '0')
            formData.append('data', JSON.stringify(dataTemuan)) // exclude files

            dataTemuan.note && dataTemuan.note.length > 0 && dataTemuan.note.map((nt, ind) => {
                formData.append(`note[${ind}]`, JSON.stringify(nt))
            })

            dataTemuan.team && dataTemuan.team.length > 0 && dataTemuan.team.map((nt, ind) => {
                formData.append(`team[${ind}]`, JSON.stringify(nt))
            })

            dataTemuan.informasi_lain && dataTemuan.informasi_lain.length > 0 && dataTemuan.informasi_lain.map((nt, ind) => {
                formData.append(`informasi[${ind}]`, JSON.stringify(nt))
            })

            dataTemuan.files && dataTemuan.files.forEach((f, i) => {
                formData.append(`files[${i}]`, f.file)
            })
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/temuan/save`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.status) {
                setSubmittedTemuanId(String(response.data?.data?.id || response.data?.id || ""))
                setIsComplete(true)
                toast({
                    title: "Pekerjaan berhasil disimpan!",
                    description: response.data.message,
                    duration: 3000,
                    action: (
                        <Check className="h-4 w-4 text-green-600" />
                    ),
                })

                // You can redirect, show a message, etc.
            } else {
                toast({
                    title: "Peringatan!",
                    description:  response.data.message,
                    duration: 3000,
                    action: (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    ),
                })

            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                toast({
                    title: "Peringatan!",
                    description:  error.response.data.message,
                    duration: 3000,
                    action: (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    ),
                })

            } else {
                toast({
                    title: "Peringatan!",
                    description:  "Ada kesalahan saat menyimpan data. Silahkan coba lagi.",
                    duration: 3000,
                    action: (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    ),
                })
            }
        }finally {
            setIsLoading(false); // Stop loading
        }
    }

    if (isComplete) {
        return <SuccessForm temuanId={submittedTemuanId} fallbackTemuan={{...dataTemuan, pembuat: user || undefined}} />
    }

    return (
        <div className="w-full space-y-6">
            {/* Informasi Section */}

                    <InformasiForm dataTemuan={dataTemuan} setDataTemuan={setDataTemuan} />


            {/* Team Section */}

                    <TeamForm dataTemuan={dataTemuan} setDataTemuan={setDataTemuan} />


            {/* Case/Temuan Section */}

                    <CaseForm dataTemuan={dataTemuan} setDataTemuan={setDataTemuan} />

            {/* Other Information Section */}
            <Card>

                <CardContent className="p-4">

                    <OtherForm dataTemuan={dataTemuan} setDataTemuan={setDataTemuan} />

                </CardContent>
            </Card>

            {/* Submit Button */}

                <div className="flex justify-end p-6">
                    <Button onClick={handleSubmit} disabled={isLoading} size="lg">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : ("Submit")}
                    </Button>
                </div>

        </div>
    )
}

export default AddNotulenForm
