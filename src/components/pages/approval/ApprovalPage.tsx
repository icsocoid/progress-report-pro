import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle2, LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useSearchParams } from "react-router-dom";
import DetailProgressReportPage from "@/components/pages/progress/DetailPage";
import { InitProgressReport, type ProgressReport } from "@/models/progress";
import { convertIndonesiaFormat } from "@/utils/helpers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";



type ApprovalPayload = {
    status_progress: string;
    user_id: number | string;
    asal_pt: string;
    approval_note: string;

};

const toTrimmedString = (value: unknown, fallback = "") => {
    if (value === null || value === undefined) {
        return fallback;
    }

    return String(value).trim();
};

const getNormalizedStatus = (value: unknown) => toTrimmedString(value).toLowerCase();

const ApprovalPage = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const { id = "" } = useParams();
    const [searchParams] = useSearchParams();
    const [approvalNote, setApprovalNote] = useState(toTrimmedString(searchParams.get("approval_note"), "Data sudah valid"));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
    const [submitMessage, setSubmitMessage] = useState("");
    const [approvalAction, setApprovalAction] = useState<"APPROVE" | "REJECT">(
        toTrimmedString(searchParams.get("status_progress"), "APPROVE").toUpperCase() === "REJECT" ? "REJECT" : "APPROVE",
    );
    const [progressData, setProgressData] = useState<ProgressReport>(InitProgressReport);
    const [isLoadingProgress, setIsLoadingProgress] = useState(false);

    // Confirmation dialog state
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<"APPROVE" | "REJECT" | null>(null);

    const progressId = toTrimmedString(id);
    const viewType = toTrimmedString(searchParams.get("view"), "progress/detail");
    const showProgressDetail = viewType === "progress/detail" && progressId !== "";
    const normalizedProgressStatus = getNormalizedStatus(progressData.status_progress);
    const isApproved = ["approve", "approved"].includes(normalizedProgressStatus);
    const isRejected = ["reject", "rejected"].includes(normalizedProgressStatus);
    const isFinalStatus = isApproved || isRejected;
    const finalStatusLabel = isApproved ? "Approve" : "Reject";
    const finalStatusTitle = isApproved ? "Dokumen Telah Di-approve" : "Dokumen Telah Di-reject";
    const rejectionNote = toTrimmedString(progressData.approval_history?.approval_note);
    const finalStatusMessage = isApproved
        ? "Progress report ini sudah disetujui sebelumnya dan tidak memerlukan approval ulang."
        : "Progress report ini sudah ditolak sebelumnya dan tidak dapat diproses ulang dari halaman ini.";

    useEffect(() => {
        if (!showProgressDetail || !apiUrl) {
            return;
        }

        const fetchProgress = async () => {
            try {
                setIsLoadingProgress(true);
                const response = await axios.get(`${apiUrl}/api/progress/${progressId}`);
                if (response.data?.status) {
                    setProgressData(response.data.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingProgress(false);
            }
        };

        fetchProgress();
    }, [apiUrl, progressId, showProgressDetail]);

    const payload = useMemo<ApprovalPayload>(() => {
        const userId = toTrimmedString(searchParams.get("user_id") ?? progressData.user_id);
        const parsedUserId = Number(userId);

        return {
            status_progress: approvalAction,
            user_id: userId !== "" && !Number.isNaN(parsedUserId) ? parsedUserId : userId,
            asal_pt: toTrimmedString(searchParams.get("asal_pt") ?? progressData.pembuat?.asal_pt, "als_pro.icso.biz.id"),
            approval_note: toTrimmedString(approvalNote),
        };
    }, [approvalAction, approvalNote, progressData.pembuat?.asal_pt, progressData.user_id, searchParams]);

    const missingFields = useMemo(() => {
        return Object.entries(payload)
            .filter(([key, value]) => key !== "approval_note" && (value === "" || value === null || value === undefined))
            .map(([key]) => key);
    }, [payload]);

    const canSubmit = missingFields.length === 0 && apiUrl;

    const handleActionClick = (action: "APPROVE" | "REJECT") => {
        setConfirmAction(action);
        if (action === "REJECT" && approvalNote === "Data sudah valid") {
            setApprovalNote("");
        }
        setIsConfirmOpen(true);
    };

    const onSubmitApproval = async () => {
        if (!confirmAction) return;
        const status = confirmAction;
        const nextNote = toTrimmedString(approvalNote);

        if (status === "REJECT" && nextNote === "") {
            setSubmitState("error");
            setSubmitMessage("Catatan penolakan wajib diisi.");
            setApprovalAction("REJECT");
            return;
        }

        setApprovalAction(status);

        if (!canSubmit && !(status === "REJECT" && nextNote !== "")) {
            setSubmitState("error");
            setSubmitMessage(
                !apiUrl
                    ? "VITE_API_URL belum tersedia."
                    : `Parameter berikut wajib diisi: ${missingFields.join(", ")}.`,
            );
            return;
        }

        try {
            setIsSubmitting(true);
            setSubmitState("idle");
            setSubmitMessage("");

            const response = await axios.post(`${apiUrl}/api/progress/approval/${progressId}`, {
                ...payload,
                status_progress: status,
                approval_note: nextNote,
            });


            const requestFailed = response.data === false || response.data?.status === false;

            if (requestFailed) {
                throw new Error(response.data?.message ?? "Approval gagal diproses.");
            }

            setSubmitState("success");
            setSubmitMessage(response.data?.message ?? "Approval berhasil dikirim.");
            setProgressData((prev) => ({
                ...prev,
                status_progress: status,
                approval_note: nextNote,
            }));
            setIsConfirmOpen(false); // Close modal on success
        } catch (error: any) {
            setSubmitState("error");
            setSubmitMessage(error?.response?.data?.message ?? error?.message ?? "Approval gagal dikirim.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10">
            <div className="space-y-8">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="space-y-7 p-8">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                                {isFinalStatus ? "Status Progress Report" : "Approval Progress Report"}
                            </h1>
                            <p className="text-sm text-slate-500">
                                #{progressData.nomor || progressId || "-"}
                            </p>
                        </div>

                        <div className="border-t border-slate-200 pt-6">
                            <div className="space-y-4">
                                <p className="text-sm text-slate-700">
                                    Meminta persetujuan untuk laporan progress report{" "}
                                    <span className="font-semibold text-slate-900">
                                        #{progressData.nomor || progressId || "-"}
                                    </span>
                                </p>
                                
                                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-6 py-5">
                                    <table className="w-full text-sm text-slate-700">
                                        <tbody>
                                            <tr>
                                                <td className="w-[100px] py-1.5 text-slate-500 sm:w-[130px]">Status</td>
                                                <td className="w-[10px] py-1.5 text-slate-500">:</td>
                                                <td className="py-1.5 font-medium text-slate-900">
                                                    {isFinalStatus ? finalStatusLabel : progressData.status_progress || "-"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="w-[100px] py-1.5 text-slate-500 sm:w-[130px]">Pembuat</td>
                                                <td className="w-[10px] py-1.5 text-slate-500">:</td>
                                                <td className="py-1.5 font-medium text-slate-900">
                                                    {progressData.pembuat?.employee_name || "-"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-1.5 text-slate-500">Dibuat pada</td>
                                                <td className="py-1.5 text-slate-500">:</td>
                                                <td className="py-1.5 font-medium text-slate-900">
                                                    {progressData.tanggal ? convertIndonesiaFormat(progressData.tanggal) : "-"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-1.5 text-slate-500">Client</td>
                                                <td className="py-1.5 text-slate-500">:</td>
                                                <td className="py-1.5 font-medium text-slate-900">
                                                    {progressData.client.company_name || "-"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {isFinalStatus ? (
                            <div
                                className={`rounded-xl border px-6 py-5 text-sm ${
                                    isApproved
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {isApproved ? (
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                                    ) : (
                                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                                    )}
                                    <div className="space-y-1">
                                        <p className="font-semibold">{finalStatusTitle}</p>
                                        <p>{finalStatusMessage}</p>
                                        {isRejected && rejectionNote !== "" ? (
                                            <div className="rounded-lg border border-current/20 bg-white/60 px-4 py-3 text-sm">
                                                <p className="font-medium">Catatan Penolakan</p>
                                                <p className="mt-1 whitespace-pre-wrap">{rejectionNote}</p>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleActionClick("REJECT")}
                                    disabled={isSubmitting}
                                    className="min-w-28 border-red-300 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700"
                                >
                                    Tolak
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleActionClick("APPROVE")}
                                    disabled={isSubmitting}
                                    className="min-w-28 border-lime-500 text-lime-900 hover:bg-lime-50 hover:text-lime-900"
                                >
                                    Setuju
                                </Button>
                            </div>
                        )}

                        {!isFinalStatus && !canSubmit ? (
                            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>
                                    {!apiUrl
                                        ? "VITE_API_URL belum diset."
                                        : `Parameter belum lengkap: ${missingFields.join(", ")}.`}
                                </span>
                            </div>
                        ) : null}

                        {!isFinalStatus && submitState !== "idle" && !isConfirmOpen ? (
                            <div
                                className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                                    submitState === "success"
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                }`}
                            >
                                {submitState === "success" ? (
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                ) : (
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                )}
                                <span>{submitMessage}</span>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm mt-3">
                    <CardContent className="p-4 sm:p-6">
                        {showProgressDetail ? (
                            <div className="rounded-2xl bg-slate-50/40 p-3 sm:p-4">
                                <DetailProgressReportPage
                                    reportId={progressId}
                                    embedded
                                    hideRequestApprovalButton
                                    hidePageHeader
                                />
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                                Detail progress report belum tersedia.
                            </div>
                        )}
                        {isLoadingProgress ? (
                            <p className="px-3 pb-2 text-xs text-slate-500">Memuat ringkasan progress report...</p>
                        ) : null}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isConfirmOpen} onOpenChange={(open) => {
                setIsConfirmOpen(open)
                if (!open) {
                    setSubmitState("idle");
                    setSubmitMessage("");
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi {confirmAction === "APPROVE" ? "Persetujuan" : "Penolakan"}</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin {confirmAction === "APPROVE" ? "menyetujui" : "menolak"} progress report ini?
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        {confirmAction === "REJECT" ? (
                            <div className="space-y-2">
                                <Label htmlFor="note">
                                    Catatan <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="note"
                                    value={approvalNote}
                                    onChange={(event) => setApprovalNote(event.target.value)}
                                    placeholder="Masukkan alasan penolakan"
                                    rows={4}
                                />
                                {submitState === "error" && (
                                    <p className="text-sm font-medium text-destructive">{submitMessage}</p>
                                )}
                            </div>
                        ) : null}

                        {submitState === "error" && confirmAction !== "REJECT" ? (
                            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{submitMessage}</span>
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center sm:space-x-0">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => setIsConfirmOpen(false)}
                            disabled={isSubmitting}
                            className="min-w-28"
                        >
                            Batal
                        </Button>
                        <Button 
                            type="button" 
                            variant={confirmAction === "APPROVE" ? "outline" : "destructive"}
                            onClick={onSubmitApproval}
                            disabled={isSubmitting}
                            className={
                                confirmAction === "APPROVE"
                                    ? "min-w-28 border-lime-600 bg-lime-500 text-lime-900 hover:bg-lime-500 hover:text-lime-900"
                                    : "min-w-28"
                            }
                        >
                            {isSubmitting ? (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Konfirmasi {confirmAction === "APPROVE" ? "Setuju" : "Tolak"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ApprovalPage;
