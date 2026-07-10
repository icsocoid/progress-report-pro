import {Bell, Layers, Search} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {UserNav} from "@/components/partials/usernav.tsx";
import {Input} from "@/components/ui/input.tsx";
import { useNavigate } from "react-router-dom";


const Header = () => {

    const navigate = useNavigate()

    const handleFocus = () => {
        navigate("/search")
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-primary/10 bg-background/95 px-4 shadow-[0_4px_20px_rgba(226,35,26,0.04)] backdrop-blur md:px-6">
            <div className="flex min-w-0 items-center gap-2 md:hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
                    <Layers className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="truncate text-lg font-semibold">ALS</span>
            </div>
            <div className="hidden md:flex md:flex-1">
                <form className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        onFocus={handleFocus}
                        className="w-full border-primary/15 bg-white pl-8 focus-visible:ring-primary/30 md:w-[300px] lg:w-[400px]"
                    />
                </form>
            </div>
            <div className="flex items-center gap-2 md:ml-auto">
                <Button variant="outline" size="icon" className="rounded-full border-primary/20 bg-white text-primary md:hidden" onClick={handleFocus}>
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full border-primary/20 bg-white text-primary">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Notifications</span>
                </Button>
                <UserNav />
            </div>
        </header>
    )
}

export default Header
