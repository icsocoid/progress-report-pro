import { useState } from "react"
import SuccessStep from "./steps/SuccessStep"
import InformasiForm from "@/components/pages/progress/steps/InformasiForm.tsx";
import CaseForm from "./steps/CaseForm";
import ReviewForm from "@/components/pages/progress/steps/ReviewForm.tsx";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import StepIndicator from "./StepIndicator";
import { Button } from "@/components/ui/button";
import {InitProgressReport} from "@/models/progress.ts";
import axios from "axios";
import {AlertTriangle, Check, Loader2} from "lucide-react";
import {useToast} from "@/hooks/use-toast.ts";
import {useUser} from "@/models/user.ts";
import OtherForm from "@/components/pages/progress/steps/OtherForm.tsx";
import * as React from "react";
import TodoPerkerjaanForm from "@/components/pages/progress/steps/TodoPerkerjaanForm.tsx";
import type {ProgressReport} from "@/models/progress.ts";
import type {JobTask, JobTaskNote} from "@/models/job.ts";

const steps = [
    { id: "step-1", name: "Informasi" },
    { id: "step-2", name: "Pekerjaan" },
    { id: "step-3", name: "Temuan" },
    { id: "step-4", name: "Informasi Lain" },
    { id: "step-5", name: "Review" },
]

type NoteImagePayload = {
    file: File
}

const sanitizeNotes = (notes: JobTaskNote[] | undefined, noteImages: NoteImagePayload[]) => {
    return notes?.map((note) => {
        const {images, ...notePayload} = note;

        if (!images || images.length === 0) {
            return notePayload;
        }

        const imageIndex = noteImages.length;
        noteImages.push({file: images[0].file});

        return {
            ...notePayload,
            image_index: imageIndex,
        };
    });
};

const sanitizeTasks = (tasks: JobTask[], noteImages: NoteImagePayload[]): JobTask[] => {
    return tasks.map((task) => ({
        ...task,
        job_task_note: sanitizeNotes(task.job_task_note, noteImages) ?? [],
        kasus: sanitizeNotes(task.kasus, noteImages) ?? [],
        todo: task.todo ? sanitizeTasks(task.todo, noteImages) : task.todo,
    }));
};

const prepareProgressPayload = (dataProgress: ProgressReport) => {
    const noteImages: NoteImagePayload[] = [];
    const {files, ...progressPayload} = dataProgress;

    const payload = {
        ...progressPayload,
        spk: {
            ...dataProgress.spk,
            job: dataProgress.spk.job.map((job) => ({
                ...job,
                tasks: sanitizeTasks(job.tasks, noteImages),
            })),
        },
    };

    return {payload, noteImages};
};

const AddProgressForm = () => {
    const [currentStep, setCurrentStep] = useState(0)
    const [isComplete, setIsComplete] = useState(false)
    const [dataProgress, setDataProgress] = useState(InitProgressReport)
    const { toast } = useToast()
    const user = useUser()
    const [isLoading, setIsLoading] = useState(false)
    const [loadingStep, setLoadingStep] = React.useState(false)

    const handleNext = () => {
        if(currentStep == 0){
            if(dataProgress.spk.jenis === "Retainer"){
                if(dataProgress.tanggal_periode === undefined || dataProgress.tanggal_periode === null){
                    toast({
                        title: "Peringatan!",
                        description:  "Anda belum memilih periode bulan & tahun",
                        duration: 3000,
                        action: (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        ),
                    })
                }
                else {
                    setLoadingStep(true)
                    axios.get(`${import.meta.env.VITE_API_URL}/api/progress/is-periode-done`,{
                        params: {
                            no_spk:dataProgress.no_spk,
                            bulan: dataProgress.bulan,
                            tahun: dataProgress.tahun
                        }
                    }).then(response => {
                        setLoadingStep(false)
                        if(response.data.status){
                            toast({
                                title: "Peringatan!",
                                description:  response.data.message,
                                duration: 3000,
                                action: (
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                ),
                            })
                        } else {
                            setCurrentStep((prev) => Math.min(prev + 1, steps.length))
                        }

                    })
                        .catch(error => {
                            setLoadingStep(false)
                            console.error(error);
                        });

                }
            } else {
                setCurrentStep((prev) => Math.min(prev + 1, steps.length))
            }
        }
        else {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length))
        }
    }

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0))
    }

    const renderStep = () => {
        if (isComplete) {
            return <SuccessStep />
        }

        switch (currentStep) {
            case 0:
                return <InformasiForm dataProgress={dataProgress} setDataProgress={setDataProgress} />
            case 1:
                return <TodoPerkerjaanForm dataProgress={dataProgress} setDataProgress={setDataProgress} />
            case 2:
                return <CaseForm dataProgress={dataProgress} setDataProgress={setDataProgress} />
            case 3:
                return <OtherForm dataProgress={dataProgress} setDataProgress={setDataProgress} />
            case 4:
                return <ReviewForm dataProgress={dataProgress} setDataProgress={setDataProgress} />
            default:
                return null
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const formData = new FormData()
            const {payload, noteImages} = prepareProgressPayload(dataProgress)
            formData.append('user_id', user?.id || '0')
            formData.append('data', JSON.stringify(payload))

            dataProgress.files.forEach((f, i) => {
                formData.append(`files[${i}]`, f.file)
            })
            noteImages.forEach((noteImage, index) => {
                formData.append(`images[${index}]`, noteImage.file)
            })
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/progress/save`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.status) {
                setIsComplete(true)
                toast({
                    title: "Pekerjaan berhasil disimpan!",
                    description: response.data.message,
                    duration: 3000,
                    action: (
                        <Check className="h-4 w-4 text-green-600" />
                    ),
                })

                // You can redirect, show a message, etc.
            } else {
                toast({
                    title: "Peringatan!",
                    description:  response.data.message,
                    duration: 3000,
                    action: (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    ),
                })

            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                toast({
                    title: "Peringatan!",
                    description:  error.response.data.message,
                    duration: 3000,
                    action: (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    ),
                })

            } else {
                toast({
                    title: "Peringatan!",
                    description:  error.response.data.message,
                    duration: 3000,
                    action: (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    ),
                })
            }
        }finally {
            setIsLoading(false); // Stop loading
        }
    }

    return (
        <Card className="w-full">
            {!isComplete && <StepIndicator steps={steps} currentStep={currentStep} className="p-4 border-b" />}
            <CardContent className="pt-6">{renderStep()}</CardContent>
            {!isComplete && (
                <CardFooter className="flex justify-between border-t p-4">
                    <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                        Back
                    </Button>
                    <div className="flex gap-2">
                        {currentStep < steps.length - 1 ? (
                            <Button onClick={handleNext}>{loadingStep ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading...
                                </>
                            ) : ("Next")}</Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : ("Submit")}</Button>
                        )}
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}

export default AddProgressForm
