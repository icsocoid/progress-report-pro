import {useEffect, useState} from "react";
import type {Client, PaginatedClients} from "@/models/client.ts";
import axios from "axios";
import {Button} from "@/components/ui/button.tsx";
import {ChevronDown, ChevronLeft, ChevronRight, Filter, Loader2, Users} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion.tsx";
import {InitJobTask, type JobTask} from "@/models/job.ts";
import {SearchableSelect} from "@/components/SearchableSelect.tsx";
import * as React from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Label} from "@/components/ui/label.tsx";
import {useUser} from "@/models/user.ts";

type MasalahItem = {
    keterangan: string;
    nomor: string;
    pr_id: string;
};

type PekerjaanItem = {
    nama_pekerjaan: string;
    masalah: MasalahItem[];
};

type IssueGroup = {
    periode: string;
    data: PekerjaanItem[];
};

const MasalahPage = () => {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [loadingChild, setLoadingChild] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const [meta, setMeta] = useState<PaginatedClients | null>(null)
    const urlApi = import.meta.env.VITE_API_URL
    const [progressReport, setProgressReport] = useState<IssueGroup[]>([])
    const [totalPage, setTotalPage] = useState<number>(1)
    const [selectedTask, setSelectedTask] = React.useState<JobTask>()
    const [selectedClient, setSelectedClient] = React.useState<Client>()
    //const [selectedClientCode, setSelectedClientCode] = React.useState<string>("")
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
    const [isClear, setIsClear] = React.useState(false)
    //const [metaProgress, setMetaProgress] = useState<PaginatedProgress | null>(null)
    const user = useUser()

    const urlMarketing = import.meta.env.VITE_MARKETING_API_URL
    useEffect(() => {
        fetchClients();
    }, [page, isClear]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await axios.get<PaginatedClients>(urlMarketing+'client/with-problem', {
                params: {
                    page,
                    asal_pt: user?.asal_pt,
                    client_code: selectedClient?.customer_code
                },
            });
            setClients(res.data.data || []);
            setMeta(res.data)
            const totalPages = Math.ceil((res.data.total ?? 0) / (res.data.per_page ?? 10))
            setTotalPage(totalPages)
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const getFilterSummary = () => {
        const totalFilters =
            (selectedClient ? 1 : 0) +
            (selectedTask ? 1 : 0)
        if (totalFilters === 0) return "Select filters"
        return `${totalFilters} filter${totalFilters > 1 ? "s" : ""} selected`
    }

    const mapClient = (client: any) => ({
        value: client,
        label: `${client.company_name} (${client.customer_code})`,
    })

    const isEqualClient = (a?: Client, b?: Client) => a?.id === b?.id

    const applyFilters = async () => {
       await fetchCaseClient(selectedClient?.customer_code || "", selectedTask?.id || "", 'yes')
    }

    const clearFilters = () => {
        setSelectedClient(undefined)
        setSelectedTask(undefined)
        setIsClear(true)
    }

    const renderParentPagination = () => {
        //if (meta?.total <= 1) return null

        return (
            <div className="mb-6 flex flex-col gap-3 rounded-lg bg-gray-50 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {meta?.current_page} of {meta?.last_page}
                </div>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between sm:w-auto sm:min-w-[200px]">
                            <Filter className="w-4 h-4 mr-2" />
                            {getFilterSummary()}
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-80 p-4" align="end">
                        <div className="space-y-4">
                            <div className="text-sm font-medium text-gray-900">Filter Options</div>

                            {/* Client filter */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Client</Label>
                                <SearchableSelect<Client>
                                    apiUrl={`${urlMarketing}client/search-by`}
                                    value={selectedClient}
                                    onChange={(client) => setSelectedClient(client)}
                                    mapOption={mapClient}
                                    isEqual={isEqualClient}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Todo</Label>
                                <SearchableSelect<JobTask>
                                    apiUrl={`${urlApi}/api/progress/get-list-task?client_code=${selectedClient?.customer_code}`}
                                    value={selectedTask}
                                    onChange={(task) => handleChangeTask(task || InitJobTask)}
                                    mapOption={mapTask}
                                    isEqual={isEqualTask}
                                />
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2 pt-2 border-t">
                                <Button onClick={() => {
                                    applyFilters()
                                    setIsPopoverOpen(false)
                                }} className="flex-1">
                                    Apply Filters
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        clearFilters()
                                        setIsPopoverOpen(false)
                                    }}
                                    className="flex-1"
                                >
                                    Clear All
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>

                    <div className="flex max-w-full flex-wrap items-center gap-1">
                        {Array.from({ length: totalPage ?? 0 }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={i + 1 === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPage(i + 1)}
                                className="w-8 h-8 p-0"
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => (meta && p < meta.last_page ? p + 1 : p))}
                        disabled={!meta || page === meta.last_page}
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        )
    }

    const fetchCaseClient = async (clientCode: string, taskId: string, fromFilter: string) => {
        setLoadingChild(true);
        try {
            const res = await axios.get(urlApi+'/api/progress/get-case-by-client-with-paginate', {
                params: {
                    client_code: clientCode,
                    task_id: taskId,
                    filter: fromFilter
                },
            });
            if(fromFilter === 'yes'){
                setClients(res.data.client || [])
            }
            
            // Handle if the data is wrapped in another object property like res.data.data
            const progressData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setProgressReport(progressData);
        } catch (err) {

        }
        setLoadingChild(false);
    }

    const handleAccordionChange = async(clientCode: string) => {
       // setSelectedClientCode(clientCode)
        await fetchCaseClient(clientCode, selectedTask?.id || "", '')
    }

    const handleChangeTask = (task: JobTask) => {
        setSelectedTask(task)
        //fetchCaseClient(selectedClientCode, task.id)
    }

    const renderGenericList = (items: IssueGroup[]) => (
        <div className="space-y-3">
            {items?.map((item, index) => (
                <div key={index}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">{item.periode}</h4>
                        </div>
                        <div className="text-right">

                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[640px]">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pekerjaan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temuan</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {item.data?.map((kasus) => (
                            <tr key={kasus.nama_pekerjaan} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">{kasus.nama_pekerjaan}</td>
                                <td className="px-6 py-4 whitespace-normal break-words max-w-sm">
                                    <ul className="list-decimal list-inside space-y-1">
                                        {kasus.masalah?.map((masalah, k) => (
                                            <li key={k}>
                                                {masalah.keterangan}{' '}
                                                <a
                                                    href={`/progress/detail/${masalah.pr_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    ({masalah.nomor})
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            ))}
        </div>
    )

    if (loading) {
        return (<div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6"><Skeleton className="h-8 w-40" /></h1>
            <Skeleton className="h-8 w-40" /></div>)
    }

    const mapTask = (task: JobTask) => ({
        value: task,
        label: task.task_name,
    })

    const isEqualTask = (a?: JobTask, b?: JobTask) => a?.id === b?.id

    return(
        <div className="mx-auto w-full min-w-0">
            <h1 className="text-2xl font-bold mb-6">Temuan</h1>
            {renderParentPagination()}
            <Accordion type="single" collapsible className="w-full">
                {clients?.map((category) => {
                    const IconComponent = Users

                    return (
                        <AccordionItem key={category.id} value={category.customer_code}>
                            <AccordionTrigger onClick={() => handleAccordionChange(category.customer_code)} className="text-left">
                                <div className="flex items-center gap-2">
                                    <IconComponent className="w-5 h-5" />
                                    {category.company_name}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {loadingChild ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span className="ml-2">Loading {category.company_name.toLowerCase()}...</span>
                                    </div>
                                ) : progressReport?.length > 0 ? (
                                    <>
                                        {renderGenericList(progressReport)}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground py-4">No {category.company_name.toLowerCase()} data available</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>

            {meta && meta.total > 1 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center text-sm text-muted-foreground">
                    Gunakan paginasi atas untuk melanjutkan
                </div>
            )}
        </div>
    )
}

export default MasalahPage
