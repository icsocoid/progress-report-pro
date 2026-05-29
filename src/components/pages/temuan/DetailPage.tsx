import {useNavigate, useParams} from "react-router-dom";
import * as React from "react";
import axios from "axios";
import {useEffect} from "react";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {convertIndonesiaFormat, formatFileSize, getFileIcon} from "@/utils/helpers.ts";
import {InitTemuan, type Temuan} from "@/models/temuan.ts";
import {Badge} from "@/components/ui/badge.tsx";

const DetailTemuanPage = () => {
    const navigate = useNavigate()
    const [dataTemuan, setDataTemuan] = React.useState<Temuan>(InitTemuan)
    const [loading, setLoading] = React.useState(true)

    const goToSolusiList = () => {
        navigate("/temuan")
    }

    const {id} = useParams()
    const fetchTemuan = async () => {
        setLoading(true)
        await axios.get(`${import.meta.env.VITE_API_URL}/api/temuan/${id}`)
            .then(response => {
                setLoading(false)
                if(response.data.status){
                    setDataTemuan(response.data.data)
                }

            })
            .catch(error => {
                setLoading(false)
                console.error(error);
            });
    }
    useEffect(() => {
        fetchTemuan()
    }, [])

    if(loading){
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" onClick={goToSolusiList} className="mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali
                    </Button>
                    <h1 className="text-2xl font-bold">Detail Temuan</h1>
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
        <div className="container mx-auto py-8 px-4 max-w-4xl overflow-y-auto max-h-[630px]">
            <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={goToSolusiList} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                </Button>
                <h1 className="text-2xl font-bold">Detail Temuan</h1>
            </div>
            <Card className="mb-8">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>Detail</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <label className="text-sm font-medium">Tanggal: {convertIndonesiaFormat(dataTemuan.tanggal)}</label>
                        <label className="text-sm font-medium">Client: {dataTemuan.client.company_name}</label>
                        <CardTitle className="mt-2">Temuan</CardTitle>
                        {
                            dataTemuan.note?.map((kasus, index) => {
                                return <>
                                    <div key={index} className="p-1">{index + 1}. {kasus.note}</div>
                                </>
                            })
                        }
                    </div>
                    <Separator />
                    {dataTemuan.files && dataTemuan.files.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-semibold mb-3">Attachments ({dataTemuan.files.length})</h3>
                                <div className="space-y-2">
                                    {dataTemuan.files.map((attachedFile) => {
                                        const FileIcon = getFileIcon(attachedFile.file)
                                        const filePreview = attachedFile && attachedFile?.preview?.startsWith('http') ? attachedFile.preview : `${import.meta.env.VITE_API_URL}${attachedFile.preview}`
                                        return <><div key={attachedFile.id}
                                                      className="flex items-center space-x-2 text-sm">
                                            <FileIcon className="w-4 h-4"/>
                                            <a
                                                href={filePreview}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline text-blue-600"
                                            >
                                                {attachedFile.name}
                                            </a>
                                            <Badge variant="secondary" className="text-xs">
                                                {formatFileSize(attachedFile.size || 0)}
                                            </Badge>
                                        </div></>
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default DetailTemuanPage