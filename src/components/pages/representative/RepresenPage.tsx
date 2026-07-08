import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label";
import type {Client} from "@/models/client.ts";
import {SearchableSelect} from "@/components/SearchableSelect.tsx";
import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import axios from "axios";
import DocsEditor from "@/components/DocsEditor.tsx";
import {CalendarIcon, Loader2, X} from "lucide-react";
import {InitRepresentative, type Representative} from "@/models/representative.ts";
import {format} from "date-fns";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {Calendar} from "@/components/ui/calendar.tsx";


const RepresenPage = () => {

    const urlMarketing = import.meta.env.VITE_MARKETING_API_URL
    const urlApi = import.meta.env.VITE_API_URL

    const [selectedClient, setSelectedClient] = useState<Client>();
    const [loading, setLoading] = useState(false)
    const [progressReport, setProgressReport] = useState<Representative>(InitRepresentative)
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined
        to?: Date | undefined // <- to opsional!
    }>({
        from: undefined,
        to: undefined,
    })
    const [isOpen, setIsOpen] = useState(false)

    const handleDateSelect = (range: { from: Date | undefined; to?: Date | undefined } | undefined) => {
        setDateRange(range ?? { from: undefined })
    }

    const clearDateRange = () => {
        setDateRange({ from: undefined, to: undefined })
    }

    const applyDateFilter = () => {
        setIsOpen(false)
        console.log(dateRange.from)
        // Here you would typically apply the filter to your data
        console.log("Applying filter with date range:", dateRange)
    }

    const formatDateRange = () => {
        if (!dateRange.from) return "Select date range"
        if (!dateRange.to) return format(dateRange.from, "MMM dd, yyyy")
        return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
    }

    const hasDateRange = dateRange.from || dateRange.to

    /*const fetchJobByClient = () => {
        axios.get(`${urlApi}/api/progress/find-job-by-client`, {
            params: {
                client_code:selectedClient?.customer_code
            }
        })
        .then(response => {
            if(response.data.status){
                setJobs(response.data.data)
            }

        })
        .catch(error => {
            console.error(error);
        })
    }

    React.useEffect(() => {
        fetchJobByClient()
    }, [selectedClient])*/

    const fetchProgressReport = async () => {
        setLoading(true)
        await axios.get(`${urlApi}/api/progress/find-progress-report-by-filter`, {
            params: {
                client_code:selectedClient?.customer_code,
                from_date: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "",
                to_date: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""
            }
        })
            .then(response => {
                setProgressReport(response.data)

            })
            .catch(error => {
                console.error(error);
            }).finally(() => {
                setLoading(false)
            })
    }

    const mapClient = (client: any) => ({
        value: client,
        label: `${client.company_name} (${client.customer_code})`,
    })

    const isEqualClient = (a?: Client, b?: Client) => a?.id === b?.id

    const applyFilter = async() => {
        await fetchProgressReport()
    }


    return(
        <div className="w-full min-w-0">
            <Card className="min-w-0">
                <CardHeader>
                    <CardTitle>Representative Letter </CardTitle>
                    <CardDescription>Manage representative letter</CardDescription>
                </CardHeader>
                <CardContent className="min-w-0">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                        <div className="space-y-2">
                            <Label htmlFor="client">Client</Label>
                            <SearchableSelect<Client>
                                apiUrl={`${urlMarketing}client/search-by`}
                                value={selectedClient}
                                onChange={(client) => setSelectedClient(client)}
                                mapOption={mapClient}
                                isEqual={isEqualClient}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="job">Tanggal</Label>
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                <Popover open={isOpen} onOpenChange={setIsOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal sm:w-[300px]",
                                                !hasDateRange && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDateRange()}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[calc(100vw-2rem)] max-w-[640px] p-0" align="start">
                                        <div className="p-4 space-y-4">
                                            <Calendar
                                                mode="range"
                                                selected={dateRange}
                                                onSelect={handleDateSelect}
                                                numberOfMonths={2}
                                                className="rounded-md"
                                            />
                                            <div className="flex justify-between gap-2">
                                                <Button variant="outline" size="sm" onClick={clearDateRange} disabled={!hasDateRange}>
                                                    Clear
                                                </Button>
                                                <Button size="sm" onClick={applyDateFilter} disabled={!hasDateRange}>
                                                    Apply Filter
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {hasDateRange && (
                                    <Button variant="ghost" size="sm" onClick={clearDateRange} className="h-10 px-3">
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Clear date range</span>
                                    </Button>
                                )}
                                <Button variant="outline" onClick={applyFilter} className="w-full sm:w-auto">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : ("Submit")}
                                </Button>
                            </div>
                        </div>

                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">

                    </div>
                    <div className="mt-4 min-w-0">
                        <DocsEditor dataProgress={progressReport} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default RepresenPage;
