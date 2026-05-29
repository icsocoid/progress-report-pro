import {useState} from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {type Client, InitClient} from "@/models/client.ts";
import {SearchableSelect} from "@/components/SearchableSelect.tsx";
import axios from "axios";
import MonthYearPicker from "@/components/MonthYearPicker.tsx";
import type {DataProgress} from "@/utils/vartype.ts";
import {useUser} from "@/models/user.ts";



const InformasiForm = ({dataProgress, setDataProgress}: DataProgress) => {

    //const [spks, setSpks] = React.useState<Spk[]>([])
    const [date, setDate] = useState<Date>(new Date())
    const user = useUser()

    const handleSubmit = () => {

    }

    const mapClient = (client: any) => ({
        value: client,
        label: `${client.company_name} (${client.customer_code})`,
    })

    const isEqualClient = (a?: Client, b?: Client) => a?.id === b?.id

    //const urlMarketing = import.meta.env.VITE_MARKETING_API_URL
    const urlApi = import.meta.env.VITE_API_URL
    const setSelectedClient = (clientVar?: Client) => {
        setDataProgress(prevReport => (
            {
                ...prevReport, client:clientVar || InitClient, client_code: clientVar?.customer_code || "", bulan: "", tahun: "", tanggal_periode: undefined,
            }
        ))

        fetchJob(clientVar?.customer_code || "")
    }

    const fetchJob = async (clientCode: string) => {
        await axios.get(`${urlApi}/api/jobs/findjobspk`, {
            params: {
                client_code:clientCode,
                asal_pt: user?.asal_pt
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => {
                if(response.data.status){
                    setDataProgress(prevReport => (
                        {
                            ...prevReport, spks: response.data.spk
                        }
                    ))
                }

            })
            .catch(error => {
                console.error(error);
            });
    }

    const fetchDataProgress = async (bln: string, thn: string, tgl: Date) => {
        if(dataProgress.client_code !== "" && bln !== "" && thn !== ""){
            await axios.get(`${urlApi}/api/progress/find-exists`, {
                params: {
                    client_code:dataProgress.client_code,
                    bulan:bln,
                    tahun:thn,
                    no_spk:dataProgress.no_spk
                }
            })
                .then(response => {
                    if(response.data.status){
                        setDataProgress({...dataProgress, old_job: response.data.data, bulan: bln, tahun: thn, tanggal_periode: tgl})
                    } else {
                        setDataProgress({...dataProgress, old_job: [], bulan: bln, tahun: thn, tanggal_periode: tgl})
                    }

                })
                .catch(error => {
                    console.error(error);
                });
        }

    }

    const handleMonthYearPickerChange = (tgl: Date) => {
        setDate(tgl)
        const month = tgl.getMonth() + 1; // getMonth() returns 0-11
        const year = tgl.getFullYear();
        fetchDataProgress(month.toString(), year.toString(), tgl)
    }

    const handleSelectDate = (tgl: Date) => {
        const month = tgl.getMonth() + 1; // getMonth() returns 0-11
        const year = tgl.getFullYear();
        const tanggal = tgl.getDate()
        setDataProgress(prevReport => (
            {
                ...prevReport, tanggal: `${year}-${month}-${tanggal}`
            }
        ))
        setDate(tgl)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Progress Report Form</CardTitle>
            </CardHeader>
            <CardContent >
                <form onSubmit={handleSubmit} id="progress-report-form">
                    <div className="grid gap-6">
                        {/* Date Picker */}
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Tanggal</label>
                            <Popover open={false}>
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
                                apiUrl={`https://${user?.asal_pt}/api/customer/findExistCustomer`}
                                value={dataProgress.client}
                                onChange={(client) => setSelectedClient(client)}
                                mapOption={mapClient}
                                isEqual={isEqualClient}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Pekerjaan</label>
                            <Select
                                value={dataProgress.no_spk}
                                onValueChange={(value) => {
                                    const selectedSpk = dataProgress.spks?.find(spk => spk.no_spk === value)
                                    if (selectedSpk) {
                                        setDataProgress({
                                            ...dataProgress,
                                            no_spk: selectedSpk.no_spk,
                                            jenis_spk: selectedSpk.jenis,
                                            spk: selectedSpk,
                                        })
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Pekerjaan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        dataProgress.spks && dataProgress.spks.map((spk) => (
                                        <SelectItem  key={spk.no_spk} value={spk.no_spk}>
                                            {spk.nama_jasa}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {dataProgress.jenis_spk === "Retainer" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Periode</label>
                                    <MonthYearPicker month={dataProgress.bulan} year={dataProgress.tahun} value={dataProgress.tanggal_periode} onChange={(date) => handleMonthYearPickerChange(date)} />
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </CardContent>
            <CardFooter>

            </CardFooter>
        </Card>
    )
}

export default InformasiForm