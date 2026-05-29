import {Navigate, Outlet, type RouteObject} from "react-router-dom";
import DashboardPage from "@/components/pages/Dashboard.tsx";
import NotFoundPage from "@/components/pages/NotFound.tsx";
import {LoginPage} from "@/components/auth/Login.tsx";
import Layout from "@/components/Layout.tsx";
import JobsPage from "@/components/pages/Job/JobPage.tsx";
import ProgressReportPage from "@/components/pages/progress/ProgressReportPage.tsx";
import AddProgressReportPage from "@/components/pages/progress/AddProgressReportPage.tsx";
import JobDetailPage from "@/components/pages/Job/DetailPage.tsx";
import SolusiPage from "@/components/pages/solusi/SolusiPage.tsx";
import AddSolusiForm from "@/components/pages/solusi/AddSolusiForm.tsx";
import DetailProgressReportPage from "@/components/pages/progress/DetailPage.tsx";
import DetailSolusiPage from "@/components/pages/solusi/DetailPage.tsx";
import RepresenPage from "@/components/pages/representative/RepresenPage.tsx";
import TemuanPage from "@/components/pages/temuan/TemuanPage.tsx";
import AddTemuanForm from "@/components/pages/temuan/AddTemuanForm.tsx";
import DetailTemuanPage from "@/components/pages/temuan/DetailPage.tsx";
import NotulenList from "@/components/pages/notulen/NotulenList.tsx";
import AddNotulenPage from "@/components/pages/notulen/AddNotulenPage.tsx";
import DetailNotulenPage from "@/components/pages/notulen/DetailPage.tsx";
import PublicDetailPage from "@/components/pages/notulen/PublicDetailPage.tsx";
import TodoPage from "@/components/pages/todo/TodoPage.tsx";
import AddTodoForm from "@/components/pages/todo/AddTodoForm.tsx";
import DetailTodoPage from "@/components/pages/todo/DetailTodoPage.tsx";
import FileManagerPage from "@/components/pages/FileManagerPage.tsx";
import RichTextEditor from "@/components/RichTextEditor.tsx";
import SearchPage from "@/components/pages/search/SearchPage.tsx";
import AksesApprovalPage from "@/components/pages/akses-approval/AksesApprovalPage.tsx";
import ApprovalPage from "@/components/pages/approval/ApprovalPage.tsx";


const ProtectedRoute = () => {
    const isAuth = !!localStorage.getItem("authToken");
    return isAuth ? <Outlet /> : <Navigate to="/login" />;

}


export const routes: RouteObject[] = [
    {
        path: "/",
        element: <ProtectedRoute />,
        children: [
            {
                path: "",
                element: <Layout/>, // consistent layout
                children: [
                    {path: "", element: <DashboardPage/>},
                    {path: "dashboard", element: <DashboardPage/>},
                    {path: "jobs", element: <JobsPage/>},
                    {path: "job/edit/:id", element: <JobDetailPage/>},
                    {path: "progress", element: <ProgressReportPage/>},
                    {path: "addprogress", element: <AddProgressReportPage/>},
                    {path: "solusi", element: <SolusiPage/>},
                    {path: "representative", element: <RepresenPage />},
                    {path: "addsolusi", element: <AddSolusiForm/>},
                    {path: "progress/detail/:id", element: <DetailProgressReportPage/>},
                    {path: "solusi/detail/:id", element: <DetailSolusiPage/>},
                    {path: "temuan", element: <TemuanPage />},
                    {path: "addtemuan", element: <AddTemuanForm />},
                    {path: "notulen", element: <NotulenList />},
                    {path: "addnotulen", element: <AddNotulenPage />},
                    {path: "temuan/detail/:id", element: <DetailTemuanPage />},
                    {path: "notulen/detail/:id", element: <DetailNotulenPage />},
                    {path: "todo", element: <TodoPage />},
                    {path: "addtodo", element: <AddTodoForm />},
                    {path: "search", element: <SearchPage />},
                    {path: "edit-file/:id", element: <RichTextEditor />},
                    {path: "file-manager", element: <FileManagerPage />},
                    {path: "todo/detail/:id", element: <DetailTodoPage />}, 
                    {path: "akses-approval", element: <AksesApprovalPage />},
                ]
            },
        ],
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/public/notulen/:nomor",
        element: <PublicDetailPage />,
    },
    {
        path: "/approval/:id",
        element: <ApprovalPage />,
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
];
