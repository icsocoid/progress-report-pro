import {useEffect, useState} from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {ChevronLeft, ChevronRight, Loader2, Users} from "lucide-react";
import type { Client, PaginatedClients } from "@/models/client";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import type {PaginatedProgress, ProgressReport} from "@/models/progress.ts";
import {Card} from "@/components/ui/card.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {bulanIndo, convertIndonesiaFormat} from "@/utils/helpers.ts";
import {useUser} from "@/models/user.ts";

const DashboardClientPage = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [progressReport, setProgressReport] = useState<ProgressReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingChild, setLoadingChild] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [totalPage, setTotalPage] = useState<number>(1);
    const [meta, setMeta] = useState<PaginatedClients | null>(null);
    const [metaProgress, setMetaProgress] = useState<PaginatedProgress | null>(null);
    const [error, setError] = useState<string | null>(null);
    const urlApi = import.meta.env.VITE_API_URL
    const user = useUser()


    const urlMarketing = import.meta.env.VITE_MARKETING_API_URL
    useEffect(() => {
        fetchClients();
    }, [page]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await axios.get<PaginatedClients>(urlMarketing+'client/with-progress', {
                params: {
                    page,
                    asal_pt: user?.asal_pt
                },
            });
            setClients(res.data.data);
            setMeta(res.data);
            const totalPages = Math.ceil((res.data.total ?? 0) / (res.data.per_page ?? 10))
            setTotalPage(totalPages);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load client data.');
        }
        setLoading(false);
    }

    const renderParentPagination = () => {
        //if (meta?.total <= 1) return null

        return (
            <div className="mb-6 flex min-w-0 flex-col gap-3 rounded-lg border border-primary/10 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-4">
                <div className="shrink-0 text-sm text-muted-foreground">
                    Showing {meta?.current_page} of {meta?.last_page}
                </div>
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>

                    <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                        {
                            Array.from({ length: totalPage ?? 0 }, (_, i) => (
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

    const handleAccordionChange = async(clientCode: string) => {
        setLoadingChild(true);
        try {
            const res = await axios.get<PaginatedProgress>(urlApi+'/api/progress/get-by-client-with-paginate', {
                params: {
                    client_code: clientCode,
                },
            });
            setProgressReport(res.data.data);
            setMetaProgress(res.data);
            setError(null);
        } catch (err) {

        }
        setLoadingChild(false);
    }

    const renderChildPagination = () => {
        //if (meta?.total <= 1) return null

        return (
            <div className="mt-4 flex min-w-0 flex-col gap-3 border-t pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="shrink-0 text-sm text-muted-foreground">
                    Showing {metaProgress?.current_page} of {metaProgress?.last_page}
                </div>
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>

                    <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                        {Array.from({ length: metaProgress?.last_page ?? 0 }, (_, i) => (
                            <Button
                                key={i + 1}
                                variant={i + 1 === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                className="w-8 h-8 p-0"
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => (metaProgress && p < metaProgress.last_page ? p + 1 : p))}
                        disabled={!metaProgress || page === metaProgress.last_page}
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        )
    }

    const renderGenericList = (items: ProgressReport[]) => (
        <div className="space-y-3">
            {items.map((item) => (
                <Card key={item.id} className="min-w-0 p-3 sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <h4 className="font-medium">{bulanIndo[parseInt(item.bulan, 10) - 1]} {item.tahun}</h4>
                            <p className="break-words text-sm text-muted-foreground">
                                {item.nama_jasa}
                            </p>
                        </div>
                        <div className="min-w-0 text-left sm:text-right">
                           <a href={`/progress/detail/${item.id}`} target="_blank" className="block break-all text-primary hover:underline">{item.nomor} / {convertIndonesiaFormat(item.tanggal)}</a>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )

    if(loading) {
        return ( <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6"><Skeleton className="h-8 w-40" /></h1>
            <Skeleton className="h-8 w-40" /></div>)
    }

    if(error) {
        return ( <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">{error}</h1>
        </div>)
    }

    return (
        <div className="mx-auto w-full min-w-0">
            <h1 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">Progress Report</h1>

            {renderParentPagination()}

            <Accordion type="single" collapsible className="w-full min-w-0">
                {clients.map((category) => {
                    const IconComponent = Users

                    return (
                        <AccordionItem key={category.id} value={category.customer_code} className="min-w-0">
                            <AccordionTrigger onClick={() => handleAccordionChange(category.customer_code)} className="min-w-0 text-left">
                                <div className="flex min-w-0 items-center gap-2">
                                    <IconComponent className="h-5 w-5 shrink-0" />
                                    <span className="truncate">{category.company_name}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="min-w-0">
                                {loadingChild ? (
                                    <div className="flex min-w-0 items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 shrink-0 animate-spin" />
                                        <span className="ml-2 truncate">Loading {category.company_name.toLowerCase()}...</span>
                                    </div>
                                ) : progressReport.length > 0 ? (
                                    <>
                                        {renderGenericList(progressReport)}
                                        {renderChildPagination()}
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

export default DashboardClientPage
