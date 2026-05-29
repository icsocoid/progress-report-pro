import {useNavigate, useParams} from "react-router-dom";
import * as React from "react";
import {type DetailKasus, InitSolusi, type Kasus, type Solusi} from "@/models/solusi.ts";
import axios from "axios";
import {useEffect} from "react";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {convertIndonesiaFormat} from "@/utils/helpers.ts";

const DetailSolusiPage = () => {
    const navigate = useNavigate()
    const [dataSolusi, setDataSolusi] = React.useState<Solusi>(InitSolusi)
    const [loading, setLoading] = React.useState(true)
    const [dataKasus, setDataKasus] = React.useState<DetailKasus[]>([])

    const goToSolusiList = () => {
        navigate("/solusi")
    }

    const {id} = useParams()
    const fetchSolusi = async () => {
        setLoading(true)
        await axios.get(`${import.meta.env.VITE_API_URL}/api/solusi/${id}`)
            .then(response => {
                setLoading(false)
                if(response.data.status){
                    setDataSolusi(response.data.data)
                    setDataKasus(response.data.data.kasus)
                }

            })
            .catch(error => {
                setLoading(false)
                console.error(error);
            });
    }
    useEffect(() => {
        fetchSolusi()
    }, [])

    if(loading){
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" onClick={goToSolusiList} className="mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali
                    </Button>
                    <h1 className="text-2xl font-bold">Detail Solusi</h1>
                </div>

                {/* Job Details Loading Skeleton */}
                <Card className="mb-8">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-9 w-20" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <div className="col-span-2">
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-5 w-48" />
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <Skeleton className="h-4 w-32 mb-2" />
                                <Skeleton className="h-6 w-full" />
                            </div>

                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </div>
                        <div className="grid mt-2 gap-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="border rounded-md p-4"><Skeleton className="h-5 w-48" /></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl overflow-y-auto max-h-[830px]">
            <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={goToSolusiList} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                </Button>
                <h1 className="text-2xl font-bold">Detail Solusi</h1>
            </div>
            <Card className="mb-8">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>Detail</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <label className="text-sm font-medium">Tanggal: {convertIndonesiaFormat(dataSolusi.tanggal)}</label>
                        <label className="text-sm font-medium">Client: {dataSolusi.client.company_name}</label>
                        <label className="text-sm font-medium">Pembuat: {dataSolusi.pembuat?.employee_name || ""}</label>
                        <CardTitle className="mt-2">Temuan</CardTitle>
                        {
                            dataKasus.length > 0 && dataKasus.map((kasus, index) => {
                                return (
                                    <React.Fragment key={index}>
                                        <div className="p-0"><strong>{index + 1}. {kasus.task_name}</strong></div>
                                        {
                                            kasus.notes.length > 0 ? kasus.notes.map((note: Kasus, noteIndex: number) => {
                                                return (
                                                    <React.Fragment key={noteIndex}>
                                                        <div className="ml-2"> - {note.temuan}</div>
                                                        <div className="ml-5">   {note.note}</div>
                                                    </React.Fragment>
                                                )
                                            }) : null
                                        }
                                    </React.Fragment>
                                )
                            })

                        }
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default DetailSolusiPage