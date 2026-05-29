import type {DataTemuan} from "@/utils/vartype.ts"
import {Button} from "@/components/ui/button.tsx"
import {PlusCircle, Trash2} from "lucide-react"
import {Input} from "@/components/ui/input.tsx"
import {createNotulenTim} from "@/models/temuan.ts";

const TeamForm = ({dataTemuan, setDataTemuan}: DataTemuan) => {

    const addTim = () => {
        setDataTemuan(prevData => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    team: [...(prevData.team || []), createNotulenTim()]
                }
            }
        )
    }

    const updateTeam = (teamId: string, newValue: string) => {
        setDataTemuan(prevData => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    team: prevData.team?.map(catatan =>
                        catatan.id === teamId ? { ...catatan, nama: newValue } : catatan
                    )
                }
            }
        )
    }

    const removeTeam = (timId: string) => {
        setDataTemuan(prevData => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    team: prevData.team?.filter(note => note.id !== timId)
                }
            }
        )
    }

    return (
        <div className="grid gap-6">
            <div key={dataTemuan.job_id} className="border rounded-md overflow-hidden">
                <div className="p-4">
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium">Team</h5>
                        </div>
                        <div className="border rounded-md divide-y">
                            <div className="p-4">
                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="gap-3">
                                            <label
                                                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                Data Tim Peserta Meeting
                                            </label>
                                        </div>
                                        <Button type="button" variant="outline" size="sm"
                                                onClick={() => addTim()}>
                                            <PlusCircle className="h-4 w-4 mr-2"/>
                                            Tambah
                                        </Button>
                                    </div>
                                    {
                                        dataTemuan.team && dataTemuan.team.length > 0 && dataTemuan.team.map((team) => {
                                            return (
                                                <div key={team.id} className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <Input placeholder="nama tim" value={team.nama} onChange={(e) => updateTeam(team.id, e.target.value)} />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeTeam(team.id)}
                                                        disabled={dataTemuan.note.length === 1}
                                                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                                                        <Trash2 className="h-4 w-4"/>
                                                        <span className="sr-only">Remove Tim</span>
                                                    </Button>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )

}

export default TeamForm