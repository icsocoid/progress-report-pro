import type {ProgressReport} from "@/models/progress.ts";
import type {Representative} from "@/models/representative.ts";
import type {Temuan} from "@/models/temuan.ts";

export type DataProgress = {
    dataProgress: ProgressReport,
    setDataProgress: React.Dispatch<React.SetStateAction<ProgressReport>>
}

export type DataRepresentative = {
    dataProgress: Representative
}

export const SOLUSITYPE = {
    KASUS: 'case',
    TEMUAN: 'temuan',
    NOTULEN: 'notulen'
}

export type DataTemuan = {
    dataTemuan: Temuan,
    setDataTemuan: React.Dispatch<React.SetStateAction<Temuan>>
}