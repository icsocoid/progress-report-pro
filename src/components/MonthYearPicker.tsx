import {useEffect, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {id} from "date-fns/locale";

interface MonthYearPickerProps {
    value: Date | null | undefined
    month: string
    year?: string
    onChange: (value: Date) => void
}

export default function MonthYearPicker({value, onChange, month}: MonthYearPickerProps) {
    const [date, setDate] = useState<Date | undefined>(value ?? undefined)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        setDate(value ?? undefined)
    }, [value])


    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: currentYear - 1900 + 20 }, (_, i) => 1900 + i)

    // Month names
    const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ]

    const handleMonthChange = (month: string) => {
        const newDate = date ? new Date(date) : new Date()
        newDate.setMonth(months.indexOf(month))
        setDate(newDate)
        onChange(newDate)
    }

    const handleYearChange = (year: string) => {
        const newDate = date ? new Date(date) : new Date()
        newDate.setFullYear(Number.parseInt(year))
        setDate(newDate)
        onChange(newDate)
    }

    const handlePrevMonth = () => {
        const newDate = date ? new Date(date) : new Date()
        newDate.setMonth(newDate.getMonth() - 1)
        setDate(newDate)
        onChange(newDate)
    }

    const handleNextMonth = () => {
        const newDate = date ? new Date(date) : new Date()
        newDate.setMonth(newDate.getMonth() + 1)
        setDate(newDate)
        onChange(newDate)
    }

    return (
        <div className="w-full max-w-sm">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date !== undefined ? format(date, "MMMM yyyy", { locale: id }) : <span>Pilih periode bulan & tahun</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous month</span>
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                            <Select value={date !== undefined ? months[month !== '' && !isNaN(parseInt(month)) ? parseInt(month) - 1 : date.getMonth()] : undefined} onValueChange={handleMonthChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent className="z-50">
                                    {

                                        months.map((bulan) => (
                                        <SelectItem key={bulan} value={bulan}>
                                            {bulan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={date !== undefined ? date.getFullYear().toString() : new Date().getFullYear().toString()} onValueChange={handleYearChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="z-50">
                                    {years.map((tahun) => (
                                        <SelectItem key={tahun} value={tahun.toString()}>
                                            {tahun}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button variant="outline" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next month</span>
                        </Button>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button size="sm" onClick={() => setIsOpen(false)}>
                            Tutup
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
