import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import {cn, type Option} from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface SearchableSelectProps<T> {
    placeholder?: string
    emptyMessage?: string
    apiUrl: string
    value?: T
    onChange: (value: T | undefined) => void
    className?: string
    debounceMs?: number

    // Map raw API response to the shape of Option<T>
    mapOption: (item: any) => Option<T>

    isEqual: (a: T, b: T) => boolean
}

export function SearchableSelect<T>({
                                        placeholder = "Pilih",
                                        emptyMessage = "No results found.",
                                        apiUrl,
                                        value,
                                        onChange,
                                        className,
                                        debounceMs = 300,
                                        mapOption,
                                        isEqual,
                                    }: SearchableSelectProps<T>) {
    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<Option<T>[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const fetchOptions = async (query: string) => {
        try {
            setLoading(true)
            const url = `${apiUrl}${query ? `?search=${encodeURIComponent(query)}` : ""}`
            const response = await axios.get(url,{
                headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }})
            if(response){
                const mapped = (response.data.data ?? response.data).map((item: any) => mapOption(item))
                if (value && (value as any).id !== '') {
                    let newObject = { value: value, label: (value as any).company_name+ " (" + (value as any).customer_code+")" }
                    const exists = mapped.some((obj: any) => obj.value.id === (value as any).id)

                    if (!exists) {
                        mapped.push(newObject);
                    } else {
                        console.log("Object with this ID already exists.");
                    }
                }

                setOptions(mapped)
            }

        } catch (error) {
            console.error("Error fetching options:", error)
            setOptions([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 0)
        }
    }, [open])

    useEffect(() => {
        fetchOptions("")
        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
        }
    }, [apiUrl])

    const handleSearchChange = (query: string) => {
        setSearchQuery(query)
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
        debounceTimeout.current = setTimeout(() => {
            fetchOptions(query)
        }, debounceMs)
    }

    const selectedOption = options.find((option) => value && isEqual(option.value, value))

    return (
        <div className={cn("relative", className)}>
            <Button
                type={"button"}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                onClick={() => setOpen((prev) => !prev)}
            >
                {selectedOption ? selectedOption.label : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div className="absolute z-50 w-full rounded-md border bg-white shadow-md">
                    <Command shouldFilter={false}>
                        <CommandInput
                            ref={inputRef}
                            value={searchQuery}
                            onValueChange={handleSearchChange}
                            placeholder="Search..."
                            className="h-9"
                            autoFocus
                        />
                        {loading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <CommandList>
                                <CommandEmpty>{emptyMessage}</CommandEmpty>
                                <CommandGroup className="max-h-60 overflow-auto">
                                    {options.map((option) => (
                                        <CommandItem
                                            key={JSON.stringify(option.value)}
                                            onSelect={() => {
                                                onChange(isEqual(option.value, value!) ? undefined : option.value)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", value && isEqual(option.value, value) ? "opacity-100" : "opacity-0")} />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        )}
                    </Command>
                </div>
            )}
        </div>
    )
}
