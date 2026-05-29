import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import * as React from "react";
import {InitJob, type Job} from "@/models/job.ts";
import {useEffect} from "react";
import { Button } from "@/components/ui/button";
import {ArrowLeft, Edit} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx";
import {AddJobForm} from "@/components/pages/Job/AddJobForm.tsx";
import {Badge} from "@/components/ui/badge.tsx";

const JobDetailPage = () => {
    const [jobs, setJobs] = React.useState<Job>(InitJob)
    const [loading, setLoading] = React.useState(true)
    const [isAddJobOpen, setIsAddJobOpen] = React.useState(false)
    const navigate = useNavigate();

    const goToJobList = () => {
        navigate("/jobs");
    };

    const {id} = useParams()
    const fetchJob = async () => {
        setLoading(true)
        await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`)
            .then(response => {
                setLoading(false)
                if(response.data.status){
                    setJobs(response.data.data)
                }

            })
            .catch(error => {
                setLoading(false)
                console.error(error);
            });
    }
    useEffect(() => {
        fetchJob()
    }, [])

    const onSuccessForm = (condition: boolean) => {
        if(condition){
            fetchJob()
        }
    }

    if(loading){
        return (
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" onClick={goToJobList} className="mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali
                    </Button>
                    <h1 className="text-2xl font-bold">Detail Pekerjaan</h1>
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
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={goToJobList} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                </Button>
                <h1 className="text-2xl font-bold">Detail Todo</h1>
            </div>

            {/* Job Details Card */}
            <Card className="mb-8">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>Informasi Pekerjaan</CardTitle>
                            <Dialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => setIsAddJobOpen(true)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="z-[9999]">
                                    <DialogHeader>
                                        <DialogTitle>Edit Todo</DialogTitle>
                                    </DialogHeader>
                                    <AddJobForm jobData={jobs} onSuccess={onSuccessForm} />
                                </DialogContent>
                            </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">ID Pekerjaan</p>
                                <p className="font-mono text-sm">{jobs.id}</p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Nama Pekerjaan</p>
                            <p className="text-lg font-medium">{jobs.jasa.product_name}</p>

                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Jumlah Task</p>
                            <Badge variant="outline" className="text-sm">
                                {jobs.tasks.length} {jobs.tasks.length === 1 ? "task" : "tasks"}
                            </Badge>
                        </div>
                        <CardTitle>Daftar Task</CardTitle>
                        {jobs && jobs.tasks.map((task, index) => (
                            <div key={index} className="border rounded-md p-4">{task.task_name}
                                <div className="m-1 flex items-center justify-between">
                                    <label className="text-sm font-medium">Todo</label>
                                </div>
                                {
                                    task.todo && task.todo.length > 0 ? task.todo.map((td, ind) => (
                                        <div key={ind} className="p-3 flex items-center gap-2 mt-1">
                                            - {td.task_name}
                                        </div>
                                    )) : null

                                }
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
export default JobDetailPage