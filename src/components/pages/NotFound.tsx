import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Home } from "lucide-react"
import {Link} from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="mx-auto max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-3xl font-bold">404</CardTitle>
                    <CardDescription className="text-xl">Page Not Found</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="mb-4 text-muted-foreground">The page you are looking for doesn't exist or has been moved.</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link to="/">
                            <Home className="mr-2 h-4 w-4" />
                            Go Home
                        </Link>
                    </Button>
                    <Button asChild className="w-full sm:w-auto">
                        <Link to="javascript:history.back()">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go Back
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default NotFoundPage