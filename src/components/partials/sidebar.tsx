import {
    BarChart3,
    LayoutDashboard,
    Layers, Notebook, Search, LetterText, Code, Receipt, LucideListTodo, Library, ShieldCheck,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {useUser} from "@/models/user.ts";
import {getInitialsLimited, shortenEmail} from "@/utils/helpers.ts";
import {Link, useLocation} from "react-router-dom";

export function DashboardSidebar() {
    const user = useUser()
    const location = useLocation();
    const canAccessApprovalSetting = [1, 2, 3].includes(user?.jabatan?.tingkat ?? 0);



    const isActive = (path: string) => location.pathname === path
    return (
        <Sidebar className="border-r">
            <SidebarHeader className="pb-0">
                <div className="flex items-center gap-2 px-4 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                        <Layers className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold">ALS</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive('/dashboard')} tooltip="Dashboard">
                                    <Link to="/dashboard" className="group">
                                        <LayoutDashboard className="h-4 w-4 transition-colors group-hover:text-primary" />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Master</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive('/jobs')} tooltip="Analytics">
                                    <Link to="/jobs" className="group">
                                        <BarChart3 className="h-4 w-4 transition-colors group-hover:text-primary" />
                                        <span>Pekerjaan</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive('/todo')} tooltip="Analytics">
                                    <Link to="/todo" className="group">
                                        <LucideListTodo className="h-4 w-4 transition-colors group-hover:text-primary" />
                                        <span>Todo</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive('/progress')} tooltip="Products">
                                    <Link to="/progress" className="group">
                                        <Receipt className="h-4 w-4 transition-colors group-hover:text-primary" />
                                        <span>Progress Report</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive('/temuan')} tooltip="Solusi">
                                    <Link to="/temuan" className="group">
                                        <Search className="h-4 w-4 transition-colors group-hover:text-primary" />
                                        <span>Temuan</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive('/solusi')} tooltip="Solusi">
                                    <Link to="/solusi" className="group">
                                        <Code className="h-4 w-4 transition-colors group-hover:text-primary" />
                                        <span>Solusi</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive('/representative')} tooltip="Solusi">
                                    <Link to="/representative" className="group">
                                        <LetterText className="h-4 w-4 transition-colors group-hover:text-primary" />
                                        <span>Representative Letter</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive('/notulen')} tooltip="Solusi">
                                    <Link to="/notulen" className="group">
                                        <Notebook className="h-4 w-4 transition-colors group-hover:text-primary" />
                                        <span>Notulen Meeting</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive('/file-manager')} tooltip="Solusi">
                                    <Link to="/file-manager" className="group">
                                        <Library className="h-4 w-4 transition-colors group-hover:text-primary" />
                                        <span>Library</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {canAccessApprovalSetting ? (
                    <SidebarGroup>
                        <SidebarGroupLabel>Setting</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isActive('/akses-approval')} tooltip="Akses Approval">
                                        <Link to="/akses-approval" className="group">
                                            <ShieldCheck className="h-4 w-4 transition-colors group-hover:text-primary" />
                                            <span>Akses Approval</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ) : null}
            </SidebarContent>

            <SidebarFooter>
                <div className="p-4">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="/placeholder.svg?height=36&width=36" alt="@username" />
                            <AvatarFallback>{getInitialsLimited(user?.employee_name || "AL")}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{user?.employee_name}</span>
                            <span className="text-xs text-muted-foreground">{shortenEmail(user?.email || "")}</span>
                        </div>
                    </div>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
