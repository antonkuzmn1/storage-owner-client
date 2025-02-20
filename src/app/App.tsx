import useDevice from "../hooks/useDevice.ts";
import {useSelector} from "react-redux";
import {RootState} from "../utils/store.ts";
import {useAccount} from "../hooks/useAccount.ts";
import NotSupported from "./components/NotSupported.tsx";
import {DeviceSize} from "../slices/deviceSlice.ts";
import Authorization from "./components/Authorization.tsx";
import ErrorMessage from "./components/ErrorMessage.tsx";
import Message from "./components/Message.tsx";
import Loading from "./components/Loading.tsx";
import { ReactNode } from "react";
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import PageUsers from "./pages/PageUsers.tsx";
import PageMe from "./pages/PageMe.tsx";
import Page from "./pages/Page.tsx";
import PageCompanies from "./pages/PageCompanies.tsx";
import PageAdmins from "./pages/PageAdmins.tsx";
import PageOwners from "./pages/PageOwners.tsx";
import PageConfig from "./pages/PageConfig.tsx";

export interface RoutePageInterface {
    path: string;
    element: ReactNode;
    title: string;
}

export const routePages: RoutePageInterface[] = [
    {path: '/companies', element: <Page element={<PageCompanies/>}/>, title: "Companies"},
    {path: '/users', element: <Page element={<PageUsers/>}/>, title: "Users"},
    {path: '/admins', element: <Page element={<PageAdmins/>}/>, title: "Admins"},
    {path: '/owners', element: <Page element={<PageOwners/>}/>, title: "Owners"},
    {path: '/config', element: <Page element={<PageConfig/>}/>, title: "Config"},
    {path: '/me', element: <Page element={<PageMe/>}/>, title: "Me"},
];

const router = createBrowserRouter([
    {path: "*", element: <Navigate to="/me"/>},
    ...routePages.map(page => ({
        path: page.path,
        element: page.element
    }))
]);


function App() {
    useDevice();
    useAccount();

    const deviceSize = useSelector((state: RootState) => state.device.size);
    const authorized = useSelector((state: RootState) => state.account.authorized);

    if (deviceSize === DeviceSize.Small) {
        return <NotSupported/>;
    }

    return (
        <>
            {!authorized ? <Authorization/> : <RouterProvider router={router}/>}

            <ErrorMessage/>
            <Message/>

            <Loading/>
        </>
    )
}

export default App
