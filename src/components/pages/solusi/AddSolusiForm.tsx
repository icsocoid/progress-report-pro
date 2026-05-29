import React, {useState} from "react";
import {InitSolusi, type KasusSolusi, type Solusi, type SolusiNote} from "@/models/solusi.ts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    AlertTriangle,
    CalendarIcon,
    Check,
    ChevronDown,
    ChevronRight,
    Loader2,
    PlusCircle,
    ReplyIcon, Send,
    Trash2
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { SearchableSelect } from "@/components/SearchableSelect";
import {Textarea} from "@/components/ui/textarea.tsx";
import axios from "axios";
import {useToast} from "@/hooks/use-toast.ts";
import { useUser } from "@/models/user";
import {type Client, InitClient} from "@/models/client.ts";
import {SOLUSITYPE} from "@/utils/vartype.ts";
import {bulanIndo} from "@/utils/helpers.ts";

const AddSolusiForm = () => {
    const [dataSolusi, setDataSolusi] = useState(InitSolusi)
    const [dataCase, setDataCase] = useState<KasusSolusi[]>([])
    const [date, setDate] = useState<Date>(new Date())
    const [solusiItem, setSolusiItem] = useState<SolusiNote[]>([])
    const { toast } = useToast()
    const user = useUser()
    //const apiUrl = import.meta.env.VITE_API_URL
    const [isLoading, setIsLoading] = useState(false)

    const urlMarketing = import.meta.env.VITE_MARKETING_API_URL
    const urlApi = import.meta.env.VITE_API_URL

    const setSelectedClient = (clientVar?: Client) => {
        setDataSolusi({...dataSolusi, client:clientVar || InitClient, client_code: clientVar?.customer_code || ""})
        fetchCase(clientVar?.customer_code || "")
    }

    const removeSolusi = (solusiId: string, jobTaskId: string) => {
        setDataCase(prev =>
            prev.map(kasusSolusi => {
                if (kasusSolusi.job_task_id !== jobTaskId) {
                    return kasusSolusi; // biarkan yang tidak sesuai job_task_id
                }

                return {
                    ...kasusSolusi,
                    notes: kasusSolusi.notes.map(kasus => ({
                        ...kasus,
                        solusi: kasus.solusi.filter(solusi => solusi.id !== solusiId)
                    }))
                };
            })
        );
    };

    const fetchCase = async (clientCode: string) => {
        await axios.get(`${urlApi}/api/progress/find-case`, {
            params: {
                client_code:clientCode
            }
        })
        .then(response => {
            if(response.data.status){
                setDataCase(
                    response.data.data.map((task: any) => ({
                        ...task,
                        notes: task.notes.map((kasus: any) => ({
                            ...kasus,
                            solusi: Array.isArray(kasus.solusi) ? kasus.solusi : []
                        }))
                    }))
                );
            }

        })
        .catch(error => {
            console.error(error);
        });
    }

    const resetForm = () => {
        setDataSolusi(InitSolusi)
        setDataCase([])
        setSolusiItem([])
        setDate(new Date())
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const submitSolusi: Solusi = {...dataSolusi, kasus: dataCase.flatMap(kasusSolusi => kasusSolusi.notes), solusi_items: solusiItem, user_id: user?.id || "0"}
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/solusi/save`, submitSolusi);

        if (response.data.status) {
            setIsLoading(false)
            resetForm()
            toast({
                title: "Solusi berhasil disimpan!",
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

    const addSolusi = (case_id: string, jobTaskId: string) => {
        setDataCase(prevData =>
            prevData.map(kasusSolusi => {
                if (kasusSolusi.job_task_id !== jobTaskId) {
                    return kasusSolusi; // tidak cocok, biarkan
                }

                return {
                    ...kasusSolusi,
                    notes: kasusSolusi.notes.map(kasus => {
                        if (kasus.id === case_id) {
                            const newSolusi: SolusiNote = {
                                id: crypto.randomUUID(),
                                progress_report_case_id: case_id,
                                progress_solusi_id: '', // isi jika ada value
                                note: ''
                            };
                            return {
                                ...kasus,
                                solusi: [...kasus.solusi, newSolusi]
                            };
                        }
                        return kasus;
                    })
                };
            })
        );
        setSolusiItem([...solusiItem, { id: crypto.randomUUID(), progress_solusi_id: "", progress_report_case_id: case_id, note: "" }])
    }

    const updateSolusiName = (solusiId: string, newNote: string) => {
        setDataCase(prevData =>
            prevData.map(kasusSolusi => ({
                ...kasusSolusi,
                notes: kasusSolusi.notes.map(kasus => ({
                    ...kasus,
                    solusi: kasus.solusi.map(solusi =>
                        solusi.id === solusiId
                            ? { ...solusi, note: newNote }
                            : solusi
                    )
                }))
            }))
        );
    }

    const setIsCollapsed = (case_id: string, newIsCollapsed: boolean) => {
        setDataCase(prevData =>
            prevData.map(kasusSolusi => ({
                ...kasusSolusi,
                notes: kasusSolusi.notes.map(kasus =>
                    kasus.id === case_id
                        ? { ...kasus, isCollapsed: newIsCollapsed }
                        : kasus
                )
            }))
        );
    }

    const setShowReplyForm = (case_id: string, newShowReply: boolean) => {
        setDataCase(prevData =>
            prevData.map(kasusSolusi => ({
                ...kasusSolusi,
                notes: kasusSolusi.notes.map(kasus =>
                    kasus.id === case_id
                        ? { ...kasus, showReply: newShowReply }
                        : kasus
                )
            }))
        );
    }

    const setReplyContent = (case_id: string, newReplyConten: string) => {
        setDataCase(prevData =>
            prevData.map(kasusSolusi => ({
                ...kasusSolusi,
                notes: kasusSolusi.notes.map(kasus =>
                    kasus.id === case_id
                        ? { ...kasus, replyContent: newReplyConten }
                        : kasus
                )
            }))
        );
    }

    const handleSubmitReply = async (case_id: string, content: string) => {
        const formData = new FormData()
        formData.append('user_id', user?.id || '0')
        formData.append('case_id', case_id)
        formData.append('reply', content)
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/temuan/save-reply`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.status) {
            setDataCase(prevData =>
                prevData.map(kasusSolusi => ({
                    ...kasusSolusi,
                    notes: kasusSolusi.notes.map(kasus =>
                        kasus.id === case_id
                            ? { ...kasus, reply: response.data.data }
                            : kasus
                    )
                }))
            );
            toast({
                title: "Sukses!",
                description: response.data.message,
                duration: 3000,
                action: (
                    <Check className="h-4 w-4 text-green-600" />
                ),
            })

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
    }


    const mapClient = (client: any) => ({
        value: client,
        label: `${client.company_name} (${client.customer_code})`,
    })

    const isEqualClient = (a?: Client, b?: Client) => a?.id === b?.id

    return (
        <Card>
            <CardHeader>
                <CardTitle>Solusi Form</CardTitle>
            </CardHeader>
            <CardContent >
                <form onSubmit={handleSubmit} id="progress-report-form">
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
                                value={dataSolusi.client}
                                onChange={(client) => setSelectedClient(client)}
                                mapOption={mapClient}
                                isEqual={isEqualClient}
                            />
                        </div>


                        <div className="grid gap-6">
                            {
                                dataCase && dataCase.map((task, indexTask) => {
                                    return (
                                        <div key={task.job_task_id} className="p-4">
                                            <div className="grid gap-4">
                                                <div className="flex items-center justify-between gap-3 mb-1">
                                                    <div className="gap-3">
                                                        <label
                                                            htmlFor={`task-${task.job_task_id}`}
                                                            className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {indexTask + 1}. {task.task_name}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            {
                                                task.notes.map((kasus, indexKasus) => {
                                                    return (
                                                        <div key={kasus.id} className="border rounded-md overflow-hidden">
                                                            <div className="bg-muted p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="font-medium">{indexKasus+1}. {kasus?.note || ""} <a target="_blank" className="text-sm" style={{color: '#3DCF8E'}} href={`/${kasus.tipe === SOLUSITYPE.KASUS ? `progress` : `temuan`}/detail/${kasus.tipe === SOLUSITYPE.KASUS ? kasus.progress_report_id : kasus.temuan_id}`} >{kasus?.nomor}</a>{kasus.bulan ? ` (${bulanIndo[parseInt(kasus.bulan) - 1]} ${kasus.tahun})` : ""}</h4>
                                                                    {
                                                                        kasus.solusi.length === 0 ? (
                                                                            <Button type="button" variant="outline" size="sm" onClick={() => addSolusi(kasus.id, task.job_task_id)}>
                                                                                <PlusCircle className="h-4 w-4 mr-2"/>
                                                                                Tambah Solusi
                                                                            </Button>
                                                                        ) : null
                                                                    }

                                                                </div>
                                                                {
                                                                    kasus.tipe === SOLUSITYPE.TEMUAN ? (
                                                                        <div className="flex items-center space-x-2">
                                                                            <Button
                                                                                type={"button"}
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => setShowReplyForm(kasus.id,!kasus.showReply)}
                                                                                className="h-7 px-2 text-xs">
                                                                                <ReplyIcon className="w-3 h-3 mr-1" />
                                                                                Reply
                                                                            </Button>
                                                                            {kasus.reply && kasus.reply.length > 0 && (
                                                                                <Button
                                                                                    type={"button"}
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => setIsCollapsed(kasus.id,!kasus.isCollapsed)}
                                                                                    className="h-7 px-2 text-xs"
                                                                                >
                                                                                    {kasus.isCollapsed ? (
                                                                                        <>
                                                                                            <ChevronRight className="w-3 h-3 mr-1" />
                                                                                            Show {kasus.reply.length} {kasus.reply.length === 1 ? "reply" : "replies"}
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <ChevronDown className="w-3 h-3 mr-1" />
                                                                                            Hide {kasus.reply.length} {kasus.reply.length === 1 ? "reply" : "replies"}
                                                                                        </>
                                                                                    )}
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    ) : null
                                                                }

                                                                {
                                                                    kasus.reply && kasus.reply.length > 0 ? (
                                                                        <div className="pl-4">
                                                                            {
                                                                                kasus.reply.map((reply) => {
                                                                                    return (<p className="text-muted-foreground">- {reply.note}</p>)
                                                                                })
                                                                            }

                                                                        </div>
                                                                    ) : null
                                                                }
                                                                {kasus.showReply && (
                                                                    <div className="mt-4 ml-11">
                                                                        <Textarea
                                                                            placeholder="Write a reply..."
                                                                            value={kasus.replyContent}
                                                                            onChange={(e) => setReplyContent(kasus.id, e.target.value)}
                                                                            className="min-h-[80px] resize-none"
                                                                        />
                                                                        <div className="flex justify-end space-x-2 mt-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setShowReplyForm(kasus.id, !kasus.showReply)
                                                                                }}>
                                                                                Cancel
                                                                            </Button>
                                                                            <Button type={"button"} size="sm" onClick={() => handleSubmitReply(kasus.id, kasus.replyContent || "")}>
                                                                                <Send className="w-3 h-3 mr-1" />
                                                                                Reply
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            </div>
                                                            <div className="p-4">
                                                                <div className="grid gap-4">
                                                                    {kasus.solusi && kasus.solusi.map((solusi, indexs) => (
                                                                        <div key={solusi.id} className="flex items-center gap-2">
                                                                            <div className="flex-1">
                                                                                <Textarea
                                                                                    key={indexs}
                                                                                    placeholder="Keterangan..."
                                                                                    value={solusi.note || ""}
                                                                                    onChange={(e) =>
                                                                                        updateSolusiName(solusi.id, e.target.value)
                                                                                    }
                                                                                    className="min-h-[80px]"
                                                                                />
                                                                            </div>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => removeSolusi(solusi.id, task.job_task_id)}
                                                                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                                            >
                                                                                <Trash2 className="h-4 w-4"/>
                                                                                <span className="sr-only">Remove task</span>
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    )

                                })
                            }
                        </div>
                    </div>
                    <Button type="submit" form="progress-report-form" className="w-full mt-4" disabled={solusiItem.length === 0 || isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : ("Submit Solusi")}
                    </Button>
                </form>

            </CardContent>

        </Card>
    )
}

export default AddSolusiForm