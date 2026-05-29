import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertTriangle, Check, Plus, Trash, X } from "lucide-react";

import DeleteConfirmation from "@/components/DeleteConfirmation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { InitAksesApproval, type AksesApproval } from "@/models/aksesApproval";
import { useUser } from "@/models/user";


type AksesApprovalForm = {
    asal_pt: string;
    user_ids: string[];

};

const initForm: AksesApprovalForm = {
    asal_pt: "",
    user_ids: [],
};

type KaryawanOption = {
    id: string;
    employee_name: string;
};

const normalizeUserIds = (value: Array<string | number>) =>
    Array.from(
        new Set(
            value
                .map((item) => String(item).trim())
                .filter(Boolean),
        ),
    );

const toPayloadUserIds = (value: Array<string | number>) =>
    normalizeUserIds(value).map((item) => {
        const numericValue = Number(item);
        return Number.isNaN(numericValue) ? item : numericValue;
    });

const toPayloadNamaKaryawan = (
    value: Array<string | number>,
    karyawanOptions: KaryawanOption[],
    existingUsers?: AksesApproval["users"],
) =>
    normalizeUserIds(value).map((id) => {
        const option = karyawanOptions.find((item) => item.id === String(id));
        const existingUser = existingUsers?.find((item) => item.id === String(id));

        return option?.employee_name ?? existingUser?.employee_name ?? `Nama ${id}`;
    });

const formatDateTime = (value?: string) => {
    if (!value) {
        return "-";
    }

    const normalizedValue = value.includes("T") ? value : value.replace(" ", "T");
    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const AksesApprovalList = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const hrdApiUrl = import.meta.env.VITE_HRD_API_URL;
    const user = useUser();
    const { toast } = useToast();
    const canAccessApprovalSetting = [1, 2, 3].includes(user?.jabatan?.tingkat ?? 0);

    const [items, setItems] = useState<AksesApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [totalPages, setTotalPages] = useState(1);
    const [form, setForm] = useState<AksesApprovalForm>(initForm);
    const [formOpen, setFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<AksesApproval>(InitAksesApproval);
    const [karyawanOptions, setKaryawanOptions] = useState<KaryawanOption[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [loadingKaryawan, setLoadingKaryawan] = useState(false);

    const fetchAksesApproval = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${apiUrl}/api/akses-approval/list`, {
                params: {
                    asal_pt: user?.asal_pt,
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize,
                },
            });

            setItems(res.data.data ?? []);
            setTotalPages(res.data.last_page ?? 1);
        } catch (error) {
            console.error("Error fetching akses approval", error);
            toast({
                title: "Peringatan!",
                description: "Gagal memuat data akses approval.",
                action: <AlertTriangle className="h-4 w-4 text-red-600" />,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAksesApproval();
    }, [pagination.pageIndex, pagination.pageSize]);

    const resetForm = () => {
        setForm({
            ...initForm,
            asal_pt: user?.asal_pt ?? "",
        });
        setSelectedItem(InitAksesApproval);
        setSelectedUserId("");
    };

    const openCreateForm = () => {
        resetForm();
        setFormOpen(true);
    };

    const fetchKaryawanOptions = async () => {
        if (!user?.id || !formOpen || !hrdApiUrl) {
            return;
        }

        try {
            setLoadingKaryawan(true);
            const baseHrdApiUrl = hrdApiUrl.endsWith("/") ? hrdApiUrl : `${hrdApiUrl}/`;
            const res = await axios.post(`${baseHrdApiUrl}karyawan/list-karyawan`, {
                user_id: user.id,
            });

            const rawItems = Array.isArray(res.data?.karyawan)
                ? res.data.karyawan
                : Array.isArray(res.data?.data)
                  ? res.data.data
                  : Array.isArray(res.data)
                    ? res.data
                    : [];
            const nextOptions = rawItems
                .map((item: any) => ({
                    id: String(item.id ?? item.user_id ?? ""),
                    employee_name: String(item.employee_name ?? item.name ?? item.nama ?? item.label ?? ""),
                }))
                .filter((item: KaryawanOption) => item.id && item.employee_name);

            setKaryawanOptions((prev) => {
                const map = new Map<string, KaryawanOption>();

                [...prev, ...nextOptions].forEach((item) => {
                    if (item.id) {
                        map.set(item.id, item);
                    }
                });

                return Array.from(map.values());
            });
        } catch (error) {
            console.error("Error fetching karyawan options", error);
            toast({
                title: "Peringatan!",
                description: "Gagal memuat daftar karyawan.",
                action: <AlertTriangle className="h-4 w-4 text-red-600" />,
            });
        } finally {
            setLoadingKaryawan(false);
        }
    };

    useEffect(() => {
        fetchKaryawanOptions();
    }, [formOpen, user?.id]);

    const selectedUsers = useMemo(() => {
        return form.user_ids.map((id) => {
            const existingUser = selectedItem.users?.find((item) => item.id === id);
            const option = karyawanOptions.find((item) => item.id === id);

            return {
                id,
                employee_name: option?.employee_name ?? existingUser?.employee_name ?? id,
            };
        });
    }, [form.user_ids, karyawanOptions, selectedItem.users]);

    const addSelectedUser = () => {
        if (!selectedUserId) {
            return;
        }

        setForm((prev) => ({
            ...prev,
            user_ids: normalizeUserIds([...prev.user_ids, selectedUserId]),
        }));
        setSelectedUserId("");
    };

    const removeSelectedUser = (userId: string) => {
        setForm((prev) => ({
            ...prev,
            user_ids: prev.user_ids.filter((id) => id !== userId),
        }));
    };

    const submitForm = async () => {
        const userIds = normalizeUserIds(form.user_ids);
        const payloadUserIds = toPayloadUserIds(form.user_ids);
        const payloadNamaKaryawan = toPayloadNamaKaryawan(form.user_ids, karyawanOptions, selectedItem.users);
        const asalPt = (user?.asal_pt ?? form.asal_pt).trim();

        if (!asalPt || userIds.length === 0) {
            toast({
                title: "Peringatan!",
                description: "Asal PT dan daftar user approval wajib diisi.",
                action: <AlertTriangle className="h-4 w-4 text-red-600" />,
            });
            return;
        }

        try {
            setSaving(true);
            const payload = {
                asal_pt: asalPt,
                user_ids: payloadUserIds,
                nama_karyawan: payloadNamaKaryawan,
            };

            const res = await axios.post(`${apiUrl}/api/akses-approval/save`, payload);

            if (res.data === false || res.data?.status === false) {
                throw new Error(res.data?.message ?? "Request gagal diproses");
            }

            toast({
                title: "Akses approval berhasil disimpan!",
                action: <Check className="h-4 w-4 text-green-600" />,
            });
            setFormOpen(false);
            resetForm();
            await fetchAksesApproval();
        } catch (error) {
            console.error("Error saving akses approval", error);
            toast({
                title: "Peringatan!",
                description: "Gagal menyimpan akses approval.",
                action: <AlertTriangle className="h-4 w-4 text-red-600" />,
            });
        } finally {
            setSaving(false);
        }
    };

    const openDeleteDialog = (row: AksesApproval) => {
        setSelectedItem(row);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const res = await axios.delete(`${apiUrl}/api/akses-approval/delete/${selectedItem.id}`);
            if (res.data?.status === false) {
                throw new Error(res.data?.message ?? "Delete gagal diproses");
            }

            toast({
                title: "Akses approval berhasil dihapus!",
                action: <Check className="h-4 w-4 text-green-600" />,
            });
            await fetchAksesApproval();
        } catch (error) {
            console.error("Error deleting akses approval", error);
            toast({
                title: "Peringatan!",
                description: "Gagal menghapus akses approval.",
                action: <AlertTriangle className="h-4 w-4 text-red-600" />,
            });
        } finally {
            setDeleteOpen(false);
        }
    };

    if (!canAccessApprovalSetting) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Akses Approval</CardTitle>
                    <CardDescription>Pengaturan hak akses approval</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Anda tidak memiliki hak akses untuk membuka pengaturan ini.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle>Akses Approval</CardTitle>
                            <CardDescription>Pengaturan hak akses approval</CardDescription>
                        </div>
                        <div className="flex justify-end">
                            <Button type="button" onClick={openCreateForm}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Karyawan</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                    <TableHead className="w-[64px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <>
                                        <TableRow>
                                            <TableCell colSpan={3}><Skeleton className="h-9 w-full" /></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={3}><Skeleton className="h-9 w-full" /></TableCell>
                                        </TableRow>
                                    </>
                                ) : items.length > 0 ? (
                                    items.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/40">
                                            <TableCell className="font-medium">{item.nama_karyawan || "-"}</TableCell>
                                            <TableCell>{formatDateTime(item.create_at ?? item.created_at)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => openDeleteDialog(item)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                            Page {pagination.pageIndex + 1} of {totalPages}
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        pageIndex: Math.max(prev.pageIndex - 1, 0),
                                    }))
                                }
                                disabled={pagination.pageIndex === 0}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        pageIndex: Math.min(prev.pageIndex + 1, Math.max(totalPages - 1, 0)),
                                    }))
                                }
                                disabled={pagination.pageIndex >= totalPages - 1}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) {
                        resetForm();
                    }
                }}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Tambah Akses Approval</DialogTitle>
                        <DialogDescription>
                            Pilih karyawan yang boleh melakukan approval.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="user_ids">Karyawan</Label>
                            <div className="flex gap-2">
                                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                    <SelectTrigger id="user_ids">
                                        <SelectValue
                                            placeholder={
                                                loadingKaryawan ? "Memuat daftar karyawan..." : "Pilih karyawan"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {karyawanOptions.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.employee_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" variant="outline" onClick={addSelectedUser} disabled={!selectedUserId}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah
                                </Button>
                            </div>

                            <div className="grid gap-2 rounded-md border p-3">
                                {selectedUsers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Belum ada karyawan yang dipilih.</p>
                                ) : (
                                    selectedUsers.map((selectedUser, index) => (
                                        <div
                                            key={selectedUser.id}
                                            className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">{index + 1}. {selectedUser.employee_name}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeSelectedUser(selectedUser.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Total user terpilih: {normalizeUserIds(form.user_ids).length}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                            Batal
                        </Button>
                        <Button type="button" onClick={submitForm} disabled={saving}>
                            {saving ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {deleteOpen ? (
                <DeleteConfirmation
                    showModal={deleteOpen}
                    onClose={() => setDeleteOpen(false)}
                    onSubmit={confirmDelete}
                />
            ) : null}
        </>
    );
};

export default AksesApprovalList;
