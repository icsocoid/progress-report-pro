import type { User } from "@/models/user";

// Type guard to validate object shape
function isUser(obj: any): obj is User {
    return (
        typeof obj === "object" &&
        typeof obj.id === "string" &&
        typeof obj.employee_name === "string" &&
        typeof obj.email === "string" &&
        typeof obj.npwmp === "string" &&
        typeof obj.phone === "string" &&
        typeof obj.address === "string" &&
        typeof obj.asal_pt === "string" &&
        typeof obj.is_partner === "number" &&
        typeof obj.ktp === "string"
    );
}

// Main function to get user from localStorage
export function getStoredUser(): User | null {
    const stored = localStorage.getItem("user");

    if (!stored) return null;

    try {
        const parsed = JSON.parse(stored);
        if (isUser(parsed)) {
            return parsed;
        } else {
            console.warn("Invalid user structure in localStorage");
            return null;
        }
    } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        return null;
    }
}

export const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
]

export const setTitleLabel = (label: string) => {
    if(label === 'progress_report'){
        label = "Progress Report"
    } else if(label === 'solusi'){
        label = "Solusi"
    }
    else if(label === 'temuan'){
        label = "Temuan"
    }
    return label
}
