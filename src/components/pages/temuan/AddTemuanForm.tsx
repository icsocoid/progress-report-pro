import {createTemuanNote, InitTemuan} from "@/models/temuan.ts";
import React, {useEffect, useState} from "react";
import {useToast} from "@/hooks/use-toast.ts";
import {useUser} from "@/models/user.ts";
import {type Client, InitClient} from "@/models/client.ts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {AlertTriangle, CalendarIcon, Check, Loader2, PlusCircle, Trash2} from "lucide-react";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar.tsx";
import {SearchableSelect} from "@/components/SearchableSelect.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import SingleFileUpload from "@/components/SingleFileUpload.tsx";
import type {FileWithPreview} from "@/models/progress.ts";
import axios from "axios";
import {InitJob, type Job} from "@/models/job.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {SOLUSITYPE} from "@/utils/vartype.ts";


const AddTemuanForm = () => {

    const [dataTemuan, setDataTemuan] = useState(InitTemuan)
    const [jobs, setJobs] = useState<Job[]>([])
    const [date, setDate] = useState<Date>(new Date())
    const [selectedJob, setSelectedJob] = useState<Job>(InitJob)
    const { toast } = useToast()
    const user = useUser()
    //const apiUrl = import.meta.env.VITE_API_URL
    const [isLoading, setIsLoading] = useState(false)

    const urlMarketing = import.meta.env.VITE_MARKETING_API_URL
    const urlApi = import.meta.env.VITE_API_URL

    const setSelectedClient = (clientVar?: Client) => {
        setDataTemuan({...dataTemuan, client: clientVar || InitClient, client_code: clientVar?.customer_code || ""})

    }
    const removeNote = (noteId: string) => {
        setDataTemuan(prevData => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    note: prevData.note.filter(note => note.id !== noteId)
                }
            }
        )
    }

    const addNote = (taskId: string) => {
        setDataTemuan(prevData => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    note: [...(prevData.note || []), createTemuanNote(taskId)]
                }
            }
        )
    }

    const updateNote = (noteId: string,newValue: string) => {
        setDataTemuan(prevData => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    note: prevData.note.map(catatan =>
                        catatan.id === noteId ? { ...catatan, note: newValue } : catatan
                    )
                }
            }
        )
    }

    const fetchJobs = async () => {

            await axios.get(`${urlApi}/api/jobs/all`)
                .then(response => {
                    if(response.data.status){
                        setJobs(response.data.data)
                    }

                })
                .catch(error => {
                    console.error(error);
                });


    }

    useEffect(() => {
        fetchJobs()
    },[])

    const resetForm = () => {
        setDataTemuan(InitTemuan)
        setDate(new Date())
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        //const submitTemuan: Temuan = {...dataTemuan, user_id: user?.id || "0"}
        const formData = new FormData()
        formData.append('user_id', user?.id || '0')
        formData.append('job_id', selectedJob.id || '0')
        formData.append('tipe', SOLUSITYPE.TEMUAN)
        formData.append('client_code', dataTemuan.client.customer_code)
        dataTemuan.note && dataTemuan.note.length > 0 && dataTemuan.note.map((nt, ind) => {
            formData.append(`note[${ind}]`, JSON.stringify(nt))
        })

        dataTemuan.files && dataTemuan.files?.length > 0 && dataTemuan.files.forEach((f, i) => {
            formData.append(`files[${i}]`, f.file)
        })
        const response = await axios.post(`${urlApi}/api/temuan/save`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.status) {
            setIsLoading(false)
            resetForm()
            toast({
                title: "Temuan berhasil disimpan!",
                description: response.data.message,
                duration: 3000,
                action: (
                    <Check className="h-4 w-4 text-green-600" />
                ),
            })

            // You can redirect, show a message, etc.
        } else {
            setIsLoading(false)
            toast({
                title: "Peringatan!",
                description:  response.data.message,
                duration: 3000,
                action: (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                ),
            })

        }
    }

    const mapClient = (client: any) => ({
        value: client,
        label: `${client.company_name} (${client.customer_code})`,
    })

    const isEqualClient = (a?: Client, b?: Client) => a?.id === b?.id

    const onSelectFileUpload = (files: FileWithPreview[]) => {
        setDataTemuan(prev => ({
            ...prev,
            files: files,
        }))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Temuan Form</CardTitle>
            </CardHeader>
            <CardContent >
                <form onSubmit={handleSubmit} id="temuan-global-form">
                    <div className="grid gap-6">
                        {/* Date Picker */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Tanggal</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Client</label>
                            <SearchableSelect<Client>
                                apiUrl={`${urlMarketing}client/search-by`}
                                value={dataTemuan.client}
                                onChange={(client) => setSelectedClient(client)}
                                mapOption={mapClient}
                                isEqual={isEqualClient}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Pekerjaan</label>
                            <Select
                                value={selectedJob.id}
                                onValueChange={(value) => {
                                    const selectJob = jobs.find(job => job.id === value)
                                    if(selectJob) {
                                        setSelectedJob(selectJob)
                                    }

                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Pekerjaan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        jobs && jobs.map((job) => (
                                            <SelectItem  key={job.id} value={job.id}>
                                                {job.jasa.product_name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Temuan</label>
                            </div>
                            {
                                selectedJob.tasks && selectedJob.tasks.length > 0 && selectedJob.tasks.map((task) => {
                                    return(
                                        <div key={task.id} className="p-4">
                                            <div className="grid gap-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="gap-3">
                                                        <label
                                                            htmlFor={`task-${task.id}`}
                                                            className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {task.task_name}
                                                        </label>
                                                    </div>
                                                    <Button type="button" variant="outline" size="sm"
                                                            onClick={() => addNote(task.id)}>
                                                        <PlusCircle className="h-4 w-4 mr-2"/>
                                                        Tambah
                                                    </Button>
                                                </div>
                                                {
                                                    dataTemuan.note && dataTemuan.note.length > 0 && dataTemuan.note.map(note => (
                                                        note.job_task_id === task.id ? <div key={note.id} className="flex items-center gap-2">
                                                            <div className="flex-1">
                                                                <Textarea
                                                                    placeholder="Tulis Note..."
                                                                    value={note.note}
                                                                    onChange={(e) => updateNote(note.id, e.target.value)}
                                                                    className="min-h-[80px] resize-none"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeNote(note.id)}
                                                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-4 w-4"/>
                                                                <span className="sr-only">Remove Temuan</span>
                                                            </Button>
                                                        </div> : null
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                })

                            }

                            <div className="grid gap-4 mt-3">

                                <div className="grid gap-6">

                                    <SingleFileUpload fileUploads={dataTemuan.files || []}
                                                      onSelectFiles={onSelectFileUpload}/>
                                </div>
                            </div>

                        </div>
                    </div>
                    <Button type="submit" form="temuan-global-form" className="w-full mt-4" disabled={dataTemuan.note.length === 0 || isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : ("Submit Temuan")}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default AddTemuanForm