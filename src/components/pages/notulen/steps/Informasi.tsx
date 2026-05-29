import type {DataTemuan} from "@/utils/vartype.ts";
import  {useEffect, useState} from "react";
import {type Client, InitClient} from "@/models/client.ts";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar.tsx";
import {SearchableSelect} from "@/components/SearchableSelect.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import type {Job} from "@/models/job.ts";
import axios from "axios";

const InformasiForm = ({dataTemuan, setDataTemuan}: DataTemuan) => {

    //const [spks, setSpks] = React.useState<Spk[]>([])
    const [date, setDate] = useState<Date>(new Date())
    const [jobs, setJobs] = useState<Job[]>([])
    const urlMarketing = import.meta.env.VITE_MARKETING_API_URL


    const mapClient = (client: any) => ({
        value: client,
        label: `${client.company_name} (${client.customer_code})`,
    })

    const urlApi = import.meta.env.VITE_API_URL

    const isEqualClient = (a?: Client, b?: Client) => a?.id === b?.id

    //const urlMarketing = import.meta.env.VITE_MARKETING_API_URL
    const setSelectedClient = (clientVar?: Client) => {
        setDataTemuan(prevReport => (
            {
                ...prevReport, client:clientVar || InitClient, client_code: clientVar?.customer_code || ""
            }
        ))
    }

    const handleSelectDate = (tgl: Date) => {
        const month = tgl.getMonth() + 1; // getMonth() returns 0-11
        const year = tgl.getFullYear();
        const tanggal = tgl.getDate()
        setDataTemuan(prevReport => (
            {
                ...prevReport, tanggal: `${year}-${month}-${tanggal}`
            }
        ))
        setDate(tgl)
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notulen Meeting Form</CardTitle>
            </CardHeader>
            <CardContent >
                <form id="progress-report-form">
                    <div className="grid gap-6">
                        {/* Date Picker */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Tanggal</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={(date) => date && handleSelectDate(date)} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Client Selection */}
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
                                value={dataTemuan.job_id}
                                onValueChange={(value) => {
                                    const selectJob = jobs.find(job => job.id === value)
                                    if(selectJob) {
                                        setDataTemuan(prevReport => (
                                            {
                                                ...prevReport, job_id: selectJob.id, job: selectJob
                                            }
                                        ))
                                    }

                                }}>
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
                    </div>
                </form>
            </CardContent>
            <CardFooter>

            </CardFooter>
        </Card>
    )
}

export default InformasiForm