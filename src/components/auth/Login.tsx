import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios";
import type { User } from "@/models/user"

type Errors = {
    email?: string;
    password?: string;
    message?: string; // <- optional
};

export function LoginPage() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    })
    const [errors, setErrors] = useState<Errors>({
        email: "",
        password: "",
    })

    const apiUrl = import.meta.env.VITE_HRD_API_URL

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })

        // Clear error when user types
        if (errors[name as keyof typeof errors]) {
            setErrors({
                ...errors,
                [name]: "",
            })
        }
    }

    const handleCheckboxChange = (checked: boolean) => {
        setFormData({
            ...formData,
            rememberMe: checked,
        })
    }

    const validateForm = () => {
        let valid = true
        const newErrors = { email: "", password: "" }

        if (!formData.email) {
            newErrors.email = "Email is required"
            valid = false
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid"
            valid = false
        }

        if (!formData.password) {
            newErrors.password = "Password is required"
            valid = false
        }

        setErrors(newErrors)
        return valid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors = { message:"" }
        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            const response = await axios.post(
                `${apiUrl}login-form`, // Adjust to your Laravel API endpoint
                { username: formData.email, password: formData.password },
            );
            if (response.data.status) {
                // Assume the Laravel backend returns a success response and token
                const karyawan: User = response.data.karyawan;
                const token = response.data.karyawan.employee_code;
                localStorage.setItem("user", JSON.stringify(karyawan)); // Store token in localStorage
                localStorage.setItem("authToken", token); // Store token in localStorage
                navigate("/dashboard"); // Redirect to home page
            } else {
                newErrors.message = response.data.message;
                setErrors(newErrors);
            }
        } catch (err: any) {
            if (err.response && err.response.data) {
                newErrors.message = err.response.data.message || "Login failed. Please try again."
                setErrors(newErrors);
            } else {
                newErrors.message ="An error occurred. Please try again later."
                setErrors(newErrors);
            }
        }finally {
            setIsLoading(false); // Stop loading
        }

    }

    return (
        <div className="flex h-screen items-center justify-center p-4 overflow-hidden dark:bg-slate-900">
            <div className="w-full max-w-md">
                <Card className="border-slate-200 shadow-lg dark:border-slate-700 max-h-[90vh] overflow-auto">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
                        <CardDescription>Masukkan Email dan Password Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="email">Email</Label>
                                </div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={errors.email ? "border-red-500" : ""}
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-slate-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                                    </Button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} />
                                <Label htmlFor="remember" className="text-sm font-normal">
                                    Ingat saya 30 hari
                                </Label>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
