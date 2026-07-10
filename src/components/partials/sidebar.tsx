import {
    BarChart3,
    LayoutDashboard,
    Layers, Notebook, Search, LetterText, Code, Receipt, LucideListTodo, Library, ShieldCheck,
    Menu, Wrench,
    type LucideIcon,
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
    useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {useUser} from "@/models/user.ts";
import {getInitialsLimited, shortenEmail} from "@/utils/helpers.ts";
import {Link, useLocation} from "react-router-dom";
import {cn} from "@/lib/utils.ts";

type NavigationItem = {
    title: string;
    path: string;
    icon: LucideIcon;
    section?: "main" | "master" | "management" | "setting";
    adminOnly?: boolean;
    external?: boolean;
    match?: string[];
}

const navigationItems: NavigationItem[] = [
    {
        title: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        section: "main",
        match: ["/", "/dashboard"],
    },
    {
        title: "Pekerjaan",
        path: "/jobs",
        icon: BarChart3,
        section: "master",
        match: ["/jobs", "/job"],
    },
    {
        title: "Todo",
        path: "/todo",
        icon: LucideListTodo,
        section: "master",
        match: ["/todo", "/addtodo"],
    },
    {
        title: "Progress",
        path: "/progress",
        icon: Receipt,
        section: "management",
        match: ["/progress", "/addprogress"],
    },
    {
        title: "Temuan",
        path: "/temuan",
        icon: Search,
        section: "management",
        match: ["/temuan", "/addtemuan"],
    },
    {
        title: "Solusi",
        path: "/solusi",
        icon: Code,
        section: "management",
        match: ["/solusi", "/addsolusi"],
    },
    {
        title: "Representative",
        path: "/representative",
        icon: LetterText,
        section: "management",
        match: ["/representative"],
    },
    {
        title: "Notulen",
        path: "/notulen",
        icon: Notebook,
        section: "management",
        match: ["/notulen", "/addnotulen"],
    },
    {
        title: "Library",
        path: "/file-manager",
        icon: Library,
        section: "management",
        match: ["/file-manager", "/edit-file"],
    },
    {
        title: "Toolbox",
        path: "https://toolbox.icso.biz.id/",
        icon: Wrench,
        section: "management",
        external: true,
    },
    {
        title: "Approval",
        path: "/akses-approval",
        icon: ShieldCheck,
        section: "setting",
        adminOnly: true,
        match: ["/akses-approval"],
    },
]

const mobilePrimaryPaths = ["/dashboard", "/progress", "/temuan", "/solusi"];
const mobilePrimaryItems = navigationItems.filter((item) => mobilePrimaryPaths.includes(item.path));

const canAccessItem = (item: NavigationItem, accessApprovalSetting: boolean) => {
    return !item.adminOnly || accessApprovalSetting;
}

const isNavigationItemActive = (pathname: string, item: NavigationItem) => {
    const matches = item.match ?? [item.path];

    return matches.some((path) => {
        if (path === "/") {
            return pathname === "/";
        }

        return pathname === path || pathname.startsWith(`${path}/`);
    });
}

function SidebarNavigationItem({item, active}: { item: NavigationItem; active: boolean }) {
    const Icon = item.icon;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={item.title}
                className={cn(
                    "border border-transparent text-sidebar-foreground/80 hover:border-primary/25 hover:bg-primary/10 hover:text-primary",
                    active && "border-[#211313] bg-primary/10 text-primary shadow-sm"
                )}
            >
                {item.external ? (
                    <a href={item.path} target="_blank" rel="noreferrer" className="group">
                        <Icon className="h-4 w-4 transition-colors" />
                        <span>{item.title}</span>
                    </a>
                ) : (
                    <Link to={item.path} className="group">
                        <Icon className="h-4 w-4 transition-colors" />
                        <span>{item.title}</span>
                    </Link>
                )}
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

export function DashboardSidebar() {
    const user = useUser()
    const location = useLocation();
    const {isMobile} = useSidebar();
    const canAccessApprovalSetting = [1, 2, 3].includes(user?.jabatan?.tingkat ?? 0);
    const getItems = (section: NavigationItem["section"]) => navigationItems
        .filter((item) => item.section === section && canAccessItem(item, canAccessApprovalSetting))
        .filter((item) => !isMobile || !mobilePrimaryPaths.includes(item.path));
    const mainItems = getItems("main");
    const masterItems = getItems("master");
    const managementItems = getItems("management");
    const settingItems = getItems("setting");

    return (
        <Sidebar className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader className="pb-0">
                <div className="flex items-center gap-2 px-4 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shadow-sm">
                        <Layers className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-sidebar-foreground">ALS</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {mainItems.length > 0 ? (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {mainItems.map((item) => (
                                    <SidebarNavigationItem
                                        key={item.path}
                                        item={item}
                                        active={isNavigationItemActive(location.pathname, item)}
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ) : null}
                {masterItems.length > 0 ? (
                    <SidebarGroup>
                        <SidebarGroupLabel>Master</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {masterItems.map((item) => (
                                    <SidebarNavigationItem
                                        key={item.path}
                                        item={item}
                                        active={isNavigationItemActive(location.pathname, item)}
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ) : null}

                <SidebarSeparator />

                {managementItems.length > 0 ? (
                    <SidebarGroup>
                        <SidebarGroupLabel>Management</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {managementItems.map((item) => (
                                    <SidebarNavigationItem
                                        key={item.path}
                                        item={item}
                                        active={isNavigationItemActive(location.pathname, item)}
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ) : null}

                <SidebarSeparator />

                {settingItems.length > 0 ? (
                    <SidebarGroup>
                        <SidebarGroupLabel>Setting</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {settingItems.map((item) => (
                                    <SidebarNavigationItem
                                        key={item.path}
                                        item={item}
                                        active={isNavigationItemActive(location.pathname, item)}
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ) : null}
            </SidebarContent>

            <SidebarFooter>
                <div className="min-w-0 p-4">
                    <div className="flex min-w-0 items-center gap-3 overflow-hidden rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src="/placeholder.svg?height=36&width=36" alt="@username" />
                            <AvatarFallback className="bg-primary text-primary-foreground">{getInitialsLimited(user?.employee_name || "AL")}</AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                            <span className="truncate text-sm font-medium">{user?.employee_name}</span>
                            <span className="block max-w-full truncate text-xs text-muted-foreground" title={user?.email || ""}>
                                {shortenEmail(user?.email || "")}
                            </span>
                        </div>
                    </div>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

export function MobileBottomNavigation() {
    const user = useUser()
    const location = useLocation();
    const {setOpenMobile} = useSidebar();
    const canAccessApprovalSetting = [1, 2, 3].includes(user?.jabatan?.tingkat ?? 0);
    const items = mobilePrimaryItems.filter((item) => canAccessItem(item, canAccessApprovalSetting));
    const isMenuActive = navigationItems
        .filter((item) => !mobilePrimaryPaths.includes(item.path) && canAccessItem(item, canAccessApprovalSetting))
        .some((item) => isNavigationItemActive(location.pathname, item));

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/15 bg-background/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-8px_24px_rgba(226,35,26,0.08)] backdrop-blur md:hidden">
            <div className="grid grid-cols-5 gap-1 px-1">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = isNavigationItemActive(location.pathname, item);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-md border border-transparent px-1 py-2 text-center text-[10px] font-medium leading-tight text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                                active && "border-[#211313] bg-primary/10 text-primary"
                            )}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            <span className="line-clamp-2 min-h-6 max-w-full">{item.title}</span>
                        </Link>
                    )
                })}
                <button
                    type="button"
                    aria-current={isMenuActive ? "page" : undefined}
                    onClick={() => setOpenMobile(true)}
                    className={cn(
                        "flex min-w-0 flex-col items-center justify-center gap-1 rounded-md border border-transparent px-1 py-2 text-center text-[10px] font-medium leading-tight text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                        isMenuActive && "border-[#211313] bg-primary/10 text-primary"
                    )}
                >
                    <Menu className="h-5 w-5 shrink-0" />
                    <span className="min-h-6">Menu</span>
                </button>
            </div>
        </nav>
    )
}
