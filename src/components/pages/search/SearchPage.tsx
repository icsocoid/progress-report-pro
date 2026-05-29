import {Loader2, Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import SearchResultItem from "@/components/pages/search/SearchResultItem.tsx";

type SearchResult = {
    id: number
    snippet: string
    source: string
    url: string
}

type Pagination = {
    current_page: number
    per_page: number
    total: number
    last_page: number
}

const SearchPage = () => {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const perPage = 10

    useEffect(() => {
        // Auto-focus input saat halaman dibuka
        inputRef.current?.focus()
    }, [])

    const fetchData = async (searchText: string, pageNum = 1) => {
        if (!searchText.trim()) {
            setResults([])
            setPagination(null)
            return
        }

        setLoading(true)
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/search`, {
                params: { q: searchText, page: pageNum, per_page: perPage },
            })
            setResults(res.data.results)
            setPagination(res.data.pagination)
        } catch (error) {
            console.error("Error fetching search results:", error)
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        fetchData(query, newPage)
    }

    useEffect(() => {
        if (query.trim()) fetchData(query, page)
    }, [page, query])


    return(
        <div className="min-h-screen mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-2">Cari</h1>
                <p className="text-muted-foreground">Silahkan lakukan pencarian</p>
            </div>
            <div className="mb-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Ketikan kata kunci yang mau Anda cari"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 py-6 text-base bg-card border-input"
                    />
                </div>
            </div>
            {loading ? (
                <div className="flex justify-center py-8 text-gray-500">
                    <Loader2 className="animate-spin mr-2" /> Loading...
                </div>
            ) : (
                <>
                    {results.length === 0 && query && (
                        <p className="text-center text-gray-500">Tidak ada hasil ditemukan.</p>
                    )}

                    <ul className="space-y-4">
                        {results.map((item) => (
                            <SearchResultItem key={`${item.source}-${item.id}`} title={item.source} description={item.snippet} url={item.url} />
                        ))}
                    </ul>

                    {pagination && pagination.last_page > 1 && (
                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                                className="px-3 py-1 border rounded-lg disabled:opacity-50"
                            >
                                ← Prev
                            </button>
                            <span className="text-gray-600 text-sm">
                Halaman {pagination.current_page} dari {pagination.last_page}
              </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= pagination.last_page}
                                className="px-3 py-1 border rounded-lg disabled:opacity-50"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default SearchPage