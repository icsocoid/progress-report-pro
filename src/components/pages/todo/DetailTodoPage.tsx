import {useNavigate, useParams} from "react-router-dom";
import * as React from "react";
import axios from "axios";
import {useEffect} from "react";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {convertIndonesiaFormat} from "@/utils/helpers.ts";
import {InitTodo, type Todo} from "@/models/todo.ts";

const DetailTodoPage = () => {
    const navigate = useNavigate()
    const [dataTodo, setDataTodo] = React.useState<Todo>(InitTodo)
    const [loading, setLoading] = React.useState(true)

    const goToSolusiList = () => {
        navigate("/todo")
    }

    const {id} = useParams()
    const fetchTodo = async () => {
        setLoading(true)
        await axios.get(`${import.meta.env.VITE_API_URL}/api/todo/${id}`)
            .then(response => {
                setLoading(false)
                if(response.data.status){
                    setDataTodo(response.data.data)
                }

            })
            .catch(error => {
                setLoading(false)
                console.error(error);
            });
    }
    useEffect(() => {
        fetchTodo()
    }, [])

    if(loading){
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" onClick={goToSolusiList} className="mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali
                    </Button>
                    <h1 className="text-2xl font-bold">Detail Todo</h1>
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
                <h1 className="text-2xl font-bold">Detail Todo</h1>
            </div>
            <Card className="mb-8">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>Detail</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <label className="text-sm font-medium">Tanggal: {convertIndonesiaFormat(dataTodo.tanggal)}</label>
                        <label className="text-sm font-medium">Client: {dataTodo.client.company_name}</label>
                        <label className="text-sm font-medium">Pembuat: {dataTodo.user.employee_name}</label>
                        <CardTitle className="mt-2">Daftar Todo</CardTitle>
                        {
                            dataTodo.tasks?.map((task, index) => {
                                return (
                                    <div key={index} className="mb-2">
                                        <div className="p-1 font-medium">{index + 1}. {task.task_name}</div>
                                        <div className="ml-4">
                                            {task.todo?.map((sub, subIndex) => (
                                                <div key={subIndex} className="p-1 text-sm text-gray-600">
                                                    - {sub.task_name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <Separator />
                </CardContent>
            </Card>
        </div>
    )
}

export default DetailTodoPage