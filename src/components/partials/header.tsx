import {SidebarTrigger} from "@/components/ui/sidebar.tsx";
import {Bell, Search} from "lucide-react";
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
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="hidden md:flex md:flex-1">
                <form className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        onFocus={handleFocus}
                        className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
                    />
                </form>
            </div>
            <div className="flex items-center gap-2 md:ml-auto">
                <Button variant="outline" size="icon" className="rounded-full">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Notifications</span>
                </Button>
                <UserNav />
            </div>
        </header>
    )
}

export default Header