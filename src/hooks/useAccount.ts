import Cookies from "js-cookie";
import {AppDispatch} from "../utils/store.ts";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {setAccountAuthorized} from "../slices/accountSlice.ts";
import {setAppError, setAppLoading} from "../slices/appSlice.ts";
import {api} from "../utils/api.ts";

export const useAccount = () => {
    const dispatch: AppDispatch = useDispatch();

    const clear = () => {
        Cookies.remove('token');
        delete api.defaults.headers.common['Authorization'];
        dispatch(setAccountAuthorized(false));
    }

    const check = async () => {
        dispatch(setAppLoading(true));
        const token = Cookies.get('token');

        if (token) {
            try {
                await api.get('/owner/profile', {
                    headers: {Authorization: `Bearer ${token}`}
                });
                Cookies.set('token', token, {expires: 1});
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                dispatch(setAccountAuthorized(true));
            } catch (error: unknown) {
                console.error(error);
                if (error instanceof Error) {
                    dispatch(setAppError(error.message));
                } else {
                    dispatch(setAppError("An unknown error occurred"));
                }
                clear();
            } finally {
                dispatch(setAppLoading(false));
            }
        } else {
            clear();
            dispatch(setAppLoading(false));
        }
    }

    useEffect(() => {
        check();

        const intervalId = setInterval(() => {
            console.log('check auth');
            check();
        }, 1000 * 60 * 10);

        return () => clearInterval(intervalId);
    }, [dispatch]);
}
