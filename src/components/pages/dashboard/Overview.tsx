import {useEffect, useState} from "react";
import axios from "axios";
import {
    AlertCircle,
    BarChart3,
    CheckCircle2,
    FileText,
    Users,
} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {bulanIndo, convertIndonesiaFormat} from "@/utils/helpers.ts";

type DashboardSummary = {
    total_progress: number;
    total_tasks: number;
    completed_tasks: number;
    task_completion_rate: number;
    total_todos: number;
    completed_todos: number;
    todo_completion_rate: number;
};

type StatusSummary = {
    status_progress: string;
    total: number;
};

type ClientSummary = {
    client_code: string;
    total: number;
};

type ClientRekap = {
    client_code: string;
    no_spk: string;
    total_reports: number;
    approved: number | string;
    rejected: number | string;
    pending: number | string;
    min_bulan: string;
    max_bulan: string;
    min_tahun: number;
    max_tahun: number;
    latest_date: string;
    latest_report_id: number;
    total_tasks: number;
    completed_tasks: number | string;
    task_completion_rate: number;
    total_todos: number;
    completed_todos: number | string;
    todo_completion_rate: number;
    open_cases: number;
};

type ClientSummaryResponse = ClientSummary[] | {
    clients_rekap: ClientRekap[];
};

type MonthlySummary = {
    bulan: string;
    tahun: number;
    total: number;
};

type RecentApproval = {
    id: number;
    progress_report_id: number;
    status_progress: string;
    approved_by: number;
    approved_by_name: string;
    nomor: string;
    client_code: string;
    no_spk: string;
    created_at: string;
};

type RecentReport = {
    id: number;
    nomor: string;
    tanggal: string;
    client_code: string;
    status_progress: string;
};

type DashboardData = {
    summary: DashboardSummary;
    per_status: StatusSummary[];
    per_client?: ClientSummaryResponse;
    clients_rekap?: ClientRekap[];
    per_month: MonthlySummary[];
    recent_approvals: RecentApproval[];
    recent_reports: RecentReport[];
};

type DashboardResponse = {
    status: boolean;
    message: string;
    data: DashboardData;
};

const emptyDashboard: DashboardData = {
    summary: {
        total_progress: 0,
        total_tasks: 0,
        completed_tasks: 0,
        task_completion_rate: 0,
        total_todos: 0,
        completed_todos: 0,
        todo_completion_rate: 0,
    },
    per_status: [],
    per_client: [],
    clients_rekap: [],
    per_month: [],
    recent_approvals: [],
    recent_reports: [],
};

const toNumber = (value: number | string | undefined) => Number(value ?? 0);

const formatNumber = (value: number | string | undefined) => new Intl.NumberFormat("id-ID").format(toNumber(value));

const formatPercent = (value: number | string | undefined) => `${toNumber(value).toFixed(0)}%`;

const getStatusBadgeVariant = (status: string) => {
    const normalizedStatus = status.trim().toLowerCase();

    if (["approve", "approved"].includes(normalizedStatus)) {
        return "default" as const;
    }

    if (["reject", "rejected"].includes(normalizedStatus)) {
        return "destructive" as const;
    }

    return "secondary" as const;
};

const getMonthLabel = (bulan: string, tahun: number) => {
    const monthIndex = parseInt(bulan, 10) - 1;
    const monthName = bulanIndo[monthIndex] ?? bulan;

    return `${monthName} ${tahun}`;
};

const getClientRekap = (dashboardData: DashboardData): ClientRekap[] => {
    if (dashboardData.clients_rekap && dashboardData.clients_rekap.length > 0) {
        return dashboardData.clients_rekap;
    }

    const perClient = dashboardData.per_client;

    if (!perClient) {
        return [];
    }

    if (Array.isArray(perClient)) {
        return perClient.map((client) => ({
            client_code: client.client_code,
            no_spk: "-",
            total_reports: client.total,
            approved: 0,
            rejected: 0,
            pending: 0,
            min_bulan: "",
            max_bulan: "",
            min_tahun: 0,
            max_tahun: 0,
            latest_date: "",
            latest_report_id: 0,
            total_tasks: 0,
            completed_tasks: 0,
            task_completion_rate: 0,
            total_todos: 0,
            completed_todos: 0,
            todo_completion_rate: 0,
            open_cases: 0,
        }));
    }

    return perClient.clients_rekap ?? [];
};

const getPeriodLabel = (client: ClientRekap) => {
    if (!client.min_bulan || !client.max_bulan || !client.min_tahun || !client.max_tahun) {
        return "-";
    }

    const start = getMonthLabel(client.min_bulan, client.min_tahun);
    const end = getMonthLabel(client.max_bulan, client.max_tahun);

    return start === end ? start : `${start} - ${end}`;
};

const DashboardOverview = () => {
    const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            try {
                const response = await axios.get<DashboardResponse>(`${apiUrl}/api/progress/dashboard`);

                if (response.data.status) {
                    setDashboard(response.data.data);
                    setError(null);
                } else {
                    setError(response.data.message || "Data dashboard tidak tersedia.");
                }
            } catch (err) {
                console.error(err);
                setError("Gagal memuat ringkasan dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [apiUrl]);

    if (loading) {
        return (
            <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <Card key={item}>
                            <CardContent className="p-5">
                                <Skeleton className="mb-4 h-4 w-24" />
                                <Skeleton className="h-8 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/40 bg-destructive/5">
                <CardContent className="flex items-center gap-3 p-5 text-sm text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </CardContent>
            </Card>
        );
    }

    const clientsRekap = getClientRekap(dashboard);

    const summaryCards = [
        {
            title: "Total Progress",
            value: dashboard.summary.total_progress,
            detail: "Progress report",
            icon: FileText,
            cardClassName: "border-primary/20 bg-[#fff1ef]",
            iconClassName: "bg-primary text-primary-foreground",
            titleClassName: "text-primary",
        },
        {
            title: "Client Diproses",
            value: clientsRekap.length,
            detail: "Jumlah client sedang diproses",
            icon: Users,
            cardClassName: "border-sky-200 bg-sky-50",
            iconClassName: "bg-sky-500 text-white",
            titleClassName: "text-sky-700",
        },
    ];

    return (
        <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Card key={item.title} className={item.cardClassName}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className={`text-sm font-medium ${item.titleClassName}`}>{item.title}</p>
                                        <p className="mt-2 text-2xl font-bold">{formatNumber(item.value)}</p>
                                    </div>
                                    <div className={`rounded-md p-2 shadow-sm ${item.iconClassName}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-muted-foreground">{item.detail}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Card className="border-primary/15 bg-white xl:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg text-primary">
                            <BarChart3 className="h-5 w-5" />
                            Ringkasan Pekerjaan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="font-medium">Task selesai</span>
                                <span className="text-muted-foreground">
                                    {formatPercent(dashboard.summary.task_completion_rate)}
                                </span>
                            </div>
                            <Progress value={dashboard.summary.task_completion_rate} />
                            <p className="mt-2 text-xs text-muted-foreground">
                                {formatNumber(dashboard.summary.completed_tasks)} dari {formatNumber(dashboard.summary.total_tasks)} task
                            </p>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="font-medium">Todo selesai</span>
                                <span className="text-muted-foreground">
                                    {formatPercent(dashboard.summary.todo_completion_rate)}
                                </span>
                            </div>
                            <Progress value={dashboard.summary.todo_completion_rate} />
                            <p className="mt-2 text-xs text-muted-foreground">
                                {formatNumber(dashboard.summary.completed_todos)} dari {formatNumber(dashboard.summary.total_todos)} todo
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {dashboard.per_status.map((item) => (
                                <div key={item.status_progress} className="rounded-md border border-primary/10 bg-[#fff8f7] p-3">
                                    <Badge variant={getStatusBadgeVariant(item.status_progress)}>
                                        {item.status_progress}
                                    </Badge>
                                    <p className="mt-3 text-xl font-semibold">{formatNumber(item.total)}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-[#fff1ef]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-primary">Per Bulan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
                            {dashboard.per_month.map((item) => (
                                <div key={`${item.bulan}-${item.tahun}`} className="flex items-center justify-between gap-3 rounded-md bg-white/80 px-3 py-2 shadow-sm">
                                    <span className="text-sm">{getMonthLabel(item.bulan, item.tahun)}</span>
                                    <span className="font-semibold text-primary">{formatNumber(item.total)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <Card className="border-primary/15 bg-white xl:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg text-primary">
                            <Users className="h-5 w-5" />
                            Rekap Client
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[960px]">
                                <thead className="bg-[#fff1ef]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary">Client</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary">SPK</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary">Periode</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-primary">Report</th>
                                    {/*<th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-primary">Status</th>*/}
                                    {/*<th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-primary">Task</th>*/}
                                    {/*<th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-primary">Todo</th>*/}
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-primary">Temuan</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/10 bg-white">
                                {clientsRekap.length > 0 ? clientsRekap.map((client) => (
                                    <tr key={`${client.client_code}-${client.no_spk}`} className="hover:bg-[#fff8f7]">
                                        <td className="px-4 py-3">
                                            <a
                                                href={client.latest_report_id ? `/progress/detail/${client.latest_report_id}` : undefined}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-primary hover:underline"
                                            >
                                                {client.client_code}
                                            </a>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Terbaru {client.latest_date ? convertIndonesiaFormat(client.latest_date) : "-"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{client.no_spk}</td>
                                        <td className="px-4 py-3 text-sm">{getPeriodLabel(client)}</td>
                                        <td className="px-4 py-3 text-right font-medium">{formatNumber(client.total_reports)}</td>
                                        {/*<td className="px-4 py-3 text-right">*/}
                                        {/*    <div className="flex justify-end gap-1">*/}
                                        {/*        <Badge variant="default">{formatNumber(client.approved)}</Badge>*/}
                                        {/*        <Badge variant="secondary">{formatNumber(client.pending)}</Badge>*/}
                                        {/*        <Badge variant="destructive">{formatNumber(client.rejected)}</Badge>*/}
                                        {/*    </div>*/}
                                        {/*</td>*/}
                                        {/*<td className="px-4 py-3 text-right">*/}
                                        {/*    <p className="font-medium">{formatPercent(client.task_completion_rate)}</p>*/}
                                        {/*    <p className="text-xs text-muted-foreground">*/}
                                        {/*        {formatNumber(client.completed_tasks)} / {formatNumber(client.total_tasks)}*/}
                                        {/*    </p>*/}
                                        {/*</td>*/}
                                        {/*<td className="px-4 py-3 text-right">*/}
                                        {/*    <p className="font-medium">{formatPercent(client.todo_completion_rate)}</p>*/}
                                        {/*    <p className="text-xs text-muted-foreground">*/}
                                        {/*        {formatNumber(client.completed_todos)} / {formatNumber(client.total_todos)}*/}
                                        {/*    </p>*/}
                                        {/*</td>*/}
                                        <td className="px-4 py-3 text-right font-medium">{formatNumber(client.open_cases)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-6 text-center text-sm text-muted-foreground">
                                            Belum ada rekap client.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-200 bg-emerald-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                            <CheckCircle2 className="h-5 w-5" />
                            Approval Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {dashboard.recent_approvals.length > 0 ? dashboard.recent_approvals.map((item) => (
                                <a
                                    key={item.id}
                                    href={`/progress/detail/${item.progress_report_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-md border p-3 hover:bg-muted/50"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{item.nomor}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {item.client_code} / {item.no_spk}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Oleh {item.approved_by_name} pada {convertIndonesiaFormat(item.created_at)}
                                            </p>
                                        </div>
                                        <Badge variant={getStatusBadgeVariant(item.status_progress)}>
                                            {item.status_progress}
                                        </Badge>
                                    </div>
                                </a>
                            )) : (
                                <p className="text-sm text-muted-foreground">Belum ada approval terbaru.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-sky-200 bg-sky-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg text-sky-700">
                            <FileText className="h-5 w-5" />
                            Progress Report Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {dashboard.recent_reports.length > 0 ? dashboard.recent_reports.map((item) => (
                                <a
                                    key={item.id}
                                    href={`/progress/detail/${item.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-md border p-3 hover:bg-muted/50"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{item.nomor}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {item.client_code} / {convertIndonesiaFormat(item.tanggal)}
                                            </p>
                                        </div>
                                        <Badge variant={getStatusBadgeVariant(item.status_progress)}>
                                            {item.status_progress}
                                        </Badge>
                                    </div>
                                </a>
                            )) : (
                                <p className="text-sm text-muted-foreground">Belum ada progress report terbaru.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardOverview;
