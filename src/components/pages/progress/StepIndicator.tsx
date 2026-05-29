import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

type Step = {
    id: string
    name: string
}

type StepIndicatorProps = {
    steps: Step[]
    currentStep: number
    className?: string
}

const StepIndicator = ({ steps, currentStep, className }: StepIndicatorProps) => {
    return (
        <div className={cn("", className)}>
            <nav aria-label="Progress">
                <ol role="list" className="flex items-center">
                    {steps.map((step, index) => (
                        <li key={step.id} className={cn(index !== steps.length - 1 ? "flex-1" : "", "relative")}>
                            <div className="group flex items-center">
                <span className="flex flex-col items-center">
                  <span
                      className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border-2",
                          index < currentStep
                              ? "border-primary bg-primary text-primary-foreground"
                              : index === currentStep
                                  ? "border-primary text-primary"
                                  : "border-muted-foreground/30 text-muted-foreground",
                      )}
                  >
                    {index < currentStep ? (
                        <CheckIcon className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <span>{index + 1}</span>
                    )}
                  </span>
                  <span className="mt-2 text-xs font-medium text-center">{step.name}</span>
                </span>
                                {index !== steps.length - 1 && (
                                    <div
                                        className={cn("flex-1 h-0.5 mx-2", index < currentStep ? "bg-primary" : "bg-muted-foreground/30")}
                                    />
                                )}
                            </div>
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    )
}

export default StepIndicator