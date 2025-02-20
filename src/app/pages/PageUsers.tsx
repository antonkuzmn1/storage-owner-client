import React, {ReactNode, useCallback, useEffect, useReducer} from "react";
import {AppDispatch} from "../../utils/store.ts";
import {useDispatch} from "react-redux";
import {setAppError, setAppLoading} from "../../slices/appSlice.ts";
import {api} from "../../utils/api.ts";
import Table from "../components/Table.tsx";
import Dialog from "../components/Dialog.tsx";
import Input from "../components/Input.tsx";

interface Company {
    id: number;
    username: string;
    description: string;
    created_at: string | null;
    updated_at: string | null;
}

interface Item {
    id: number;
    username: string;
    password: string;
    surname: string;
    name: string;
    middlename: string | null;
    department: string | null;
    remote_workplace: string | null;
    local_workplace: string | null;
    phone: string | null;
    cellular: string | null;
    post: string | null;
    company_id: number;
    company: Company;
    companyName: string;
    created_at: string | null;
    updated_at: string | null;
}

interface State {
    items: Item[];
    dialog: 'create' | 'update' | 'delete' | null;
    currentItem: Item;
    companies: Company[];
}

type Action =
    | { type: 'SET_ITEMS', payload: Item[] }
    | { type: 'OPEN_DIALOG', payload: { dialog: 'create' | 'update' | 'delete', item?: Item } }
    | { type: 'CLOSE_DIALOG' }
    | { type: 'UPDATE_CURRENT_ITEM', payload: Partial<Item> }
    | { type: 'ADD_ITEM', payload: Item }
    | { type: 'UPDATE_ITEM', payload: Item }
    | { type: 'DELETE_ITEM', payload: Item }
    | { type: 'SET_COMPANIES', payload: Company[] }

const defaultCompany: Company = {
    id: 0,
    username: '',
    description: '',
    created_at: null,
    updated_at: null,
}

const defaultItem: Item = {
    id: 0,
    username: '',
    password: '',
    surname: '',
    name: '',
    middlename: null,
    department: null,
    remote_workplace: null,
    local_workplace: null,
    phone: null,
    cellular: null,
    post: null,
    company_id: 0,
    company: defaultCompany,
    companyName: '',
    created_at: null,
    updated_at: null,
}

const initialState: State = {
    items: [],
    dialog: null,
    currentItem: defaultItem,
    companies: [],
}

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'SET_ITEMS':
            return {
                ...state,
                items: action.payload,
            }
        case 'OPEN_DIALOG':
            return {
                ...state,
                dialog: action.payload.dialog,
                currentItem: action.payload.item || defaultItem,
            }
        case 'CLOSE_DIALOG':
            return {
                ...state,
                dialog: null,
                currentItem: defaultItem,
            }
        case 'UPDATE_CURRENT_ITEM':
            return {
                ...state,
                currentItem: {...state.currentItem, ...action.payload},
            }
        case 'ADD_ITEM':
            return {
                ...state,
                items: [...state.items, action.payload],
                dialog: null,
            }
        case 'UPDATE_ITEM':
            return {
                ...state,
                items: state.items.map(item => (item.id === action.payload.id ? action.payload : item)),
                dialog: null,
            }
        case 'DELETE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload.id),
                dialog: null,
            }
        case 'SET_COMPANIES':
            return {
                ...state,
                companies: action.payload,
            }
        default:
            return state;
    }
}

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

interface TableHeaders {
    text: string,
    field: keyof Item,
    width: string,
    type: TypeField,
}

const tableHeaders: TableHeaders[] = [
    {text: 'ID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'Username', field: 'username', width: '200px', type: 'String'},
    {text: 'Surname', field: 'surname', width: '200px', type: 'String'},
    {text: 'Name', field: 'name', width: '200px', type: 'String'},
    {text: 'Middlename', field: 'middlename', width: '200px', type: 'String'},
    {text: 'Company', field: 'companyName', width: '200px', type: 'String'},
    {text: 'Department', field: 'department', width: '200px', type: 'String'},
    {text: 'Remote Workplace', field: 'remote_workplace', width: '200px', type: 'String'},
    {text: 'Local Workplace', field: 'local_workplace', width: '200px', type: 'String'},
    {text: 'Phone', field: 'phone', width: '200px', type: 'String'},
    {text: 'Cellular', field: 'cellular', width: '200px', type: 'String'},
    {text: 'Post', field: 'post', width: '200px', type: 'String'},
    {text: 'Created at', field: 'created_at', width: '200px', type: 'Date'},
    {text: 'Updated at', field: 'updated_at', width: '200px', type: 'Date'},
]

const PageAdmins: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const [state, localDispatch] = useReducer(reducer, initialState);

    const getItems = useCallback(async () => {
        dispatch(setAppLoading(true));
        try {
            const response = await api.get("/users/");
            const data: Item[] = response.data.map((item: Item) => {
                return {
                    ...item,
                    companyName: item.company.username,
                }
            });
            localDispatch({type: "SET_ITEMS", payload: data});

            const response2 = await api.get('/companies/');
            localDispatch({type: 'SET_COMPANIES', payload: response2.data});
        } catch (error: unknown) {
            if (error instanceof Error) {
                dispatch(setAppError(error.message));
            } else {
                dispatch(setAppError("An unknown error occurred"));
            }
        } finally {
            dispatch(setAppLoading(false));
        }
    }, []);

    useEffect(() => {
        getItems().then();
    }, [getItems]);

    const openDialog = useCallback((dialog: "create" | "update" | "delete", item?: Item) => {
        localDispatch({type: "OPEN_DIALOG", payload: {dialog, item}});
    }, []);

    const closeDialog = useCallback(() => {
        localDispatch({type: "CLOSE_DIALOG"});
    }, []);

    const createItem = useCallback(async () => {
        dispatch(setAppLoading(true));
        try {
            const response = await api.post("/users/", {
                username: state.currentItem.username,
                password: state.currentItem.password,
                surname: state.currentItem.surname,
                name: state.currentItem.name,
                middlename: state.currentItem.middlename,
                department: state.currentItem.department,
                remote_workplace: state.currentItem.remote_workplace,
                local_workplace: state.currentItem.local_workplace,
                phone: state.currentItem.phone,
                cellular: state.currentItem.cellular,
                post: state.currentItem.post,
                company_id: state.currentItem.company_id,
            });
            const data = {
                ...response.data,
                companyName: response.data.company.username,
            }
            localDispatch({type: "ADD_ITEM", payload: data});
        } catch (error: unknown) {
            if (error instanceof Error) {
                dispatch(setAppError(error.message));
            } else {
                dispatch(setAppError("An unknown error occurred"));
            }
        } finally {
            dispatch(setAppLoading(false));
        }
    }, [state.currentItem, dispatch]);

    const updateItem = useCallback(async () => {
        dispatch(setAppLoading(true));
        try {
            const response = await api.put(`/users/${state.currentItem.id}`, {
                username: state.currentItem.username,
                password: state.currentItem.password,
                surname: state.currentItem.surname,
                name: state.currentItem.name,
                middlename: state.currentItem.middlename,
                department: state.currentItem.department,
                remote_workplace: state.currentItem.remote_workplace,
                local_workplace: state.currentItem.local_workplace,
                phone: state.currentItem.phone,
                cellular: state.currentItem.cellular,
                post: state.currentItem.post,
                company_id: state.currentItem.company_id,
            });
            const data = {
                ...response.data,
                companyName: response.data.company.username,
            }
            localDispatch({type: "UPDATE_ITEM", payload: data});
        } catch (error: unknown) {
            if (error instanceof Error) {
                dispatch(setAppError(error.message));
            } else {
                dispatch(setAppError("An unknown error occurred"));
            }
        } finally {
            dispatch(setAppLoading(false));
        }
    }, [state.currentItem, dispatch]);

    const deleteItem = useCallback(async () => {
        dispatch(setAppLoading(true));
        try {
            await api.delete(`/users/${state.currentItem.id}`);
            localDispatch({type: "DELETE_ITEM", payload: state.currentItem});
        } catch (error: unknown) {
            if (error instanceof Error) {
                dispatch(setAppError(error.message));
            } else {
                dispatch(setAppError("An unknown error occurred"));
            }
        } finally {
            dispatch(setAppLoading(false));
        }
    }, [state.currentItem, dispatch]);

    return (
        <>
            <Table
                tableHeaders={tableHeaders}
                rows={state.items}
                openCreateDialog={() => openDialog("create")}
                openUpdateDialog={(item) => openDialog("update", item)}
                openDeleteDialog={(item) => openDialog("delete", item)}
            />
            {state.dialog === 'create' && (
                <DialogActions
                    type={state.dialog}
                    closeDialog={closeDialog}
                    action={createItem}
                    dialogFields={<>
                        <Input
                            label={'Username'}
                            type={'text'}
                            placeholder={'Enter username'}
                            value={state.currentItem.username || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {username: e.target.value}
                            })}
                        />
                        <Input
                            label={'Password'}
                            type={'password'}
                            placeholder={'Enter password'}
                            value={state.currentItem.password || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {password: e.target.value}
                            })}
                        />
                        <Input
                            label={'Surname'}
                            type={'text'}
                            placeholder={'Enter surname'}
                            value={state.currentItem.surname || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {surname: e.target.value}
                            })}
                        />
                        <Input
                            label={'Name'}
                            type={'text'}
                            placeholder={'Enter name'}
                            value={state.currentItem.name || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {name: e.target.value}
                            })}
                        />
                        <Input
                            label={'Middlename'}
                            type={'text'}
                            placeholder={'Enter middlename'}
                            value={state.currentItem.middlename || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {middlename: e.target.value}
                            })}
                        />
                        <Input
                            label={'Department'}
                            type={'text'}
                            placeholder={'Enter department'}
                            value={state.currentItem.department || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {department: e.target.value}
                            })}
                        />
                        <Input
                            label={'Remote Workplace'}
                            type={'text'}
                            placeholder={'Enter remote workplace'}
                            value={state.currentItem.remote_workplace || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {remote_workplace: e.target.value}
                            })}
                        />
                        <Input
                            label={'Local Workplace'}
                            type={'text'}
                            placeholder={'Enter local workplace'}
                            value={state.currentItem.local_workplace || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {local_workplace: e.target.value}
                            })}
                        />
                        <Input
                            label={'Phone'}
                            type={'text'}
                            placeholder={'Enter phone'}
                            value={state.currentItem.phone || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {phone: e.target.value}
                            })}
                        />
                        <Input
                            label={'Cellular'}
                            type={'text'}
                            placeholder={'Enter cellular'}
                            value={state.currentItem.cellular || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {cellular: e.target.value}
                            })}
                        />
                        <Input
                            label={'Post'}
                            type={'text'}
                            placeholder={'Enter post'}
                            value={state.currentItem.post || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {post: e.target.value}
                            })}
                        />
                        <div className={'border border-gray-300 h-12 flex'}>
                            <label className={'border-r border-gray-300 min-w-36 flex items-center justify-center text-gray-700'}>
                                Company
                            </label>
                            <select
                                value={state.currentItem.company_id}
                                className={'p-2 w-full text-gray-700'}
                                onChange={(e) => localDispatch({
                                    type: 'UPDATE_CURRENT_ITEM',
                                    payload: {company_id: Number(e.target.value)}
                                })}
                            >
                                {state.companies.map(company => (
                                    <option key={company.id} value={company.id}>{company.username}</option>
                                ))}
                            </select>
                        </div>
                    </>}
                />
            )}
            {state.dialog === 'update' && (
                <DialogActions
                    type={state.dialog}
                    closeDialog={closeDialog}
                    action={updateItem}
                    dialogFields={<>
                        <Input
                            label={'ID'}
                            type={'number'}
                            value={state.currentItem.id || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Username'}
                            type={'text'}
                            placeholder={'Enter username'}
                            value={state.currentItem.username || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {username: e.target.value}
                            })}
                        />
                        <Input
                            label={'Password'}
                            type={'password'}
                            placeholder={'Enter password'}
                            value={state.currentItem.password || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {password: e.target.value}
                            })}
                        />
                        <Input
                            label={'Surname'}
                            type={'text'}
                            placeholder={'Enter surname'}
                            value={state.currentItem.surname || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {surname: e.target.value}
                            })}
                        />
                        <Input
                            label={'Name'}
                            type={'text'}
                            placeholder={'Enter name'}
                            value={state.currentItem.name || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {name: e.target.value}
                            })}
                        />
                        <Input
                            label={'Middlename'}
                            type={'text'}
                            placeholder={'Enter middlename'}
                            value={state.currentItem.middlename || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {middlename: e.target.value}
                            })}
                        />
                        <Input
                            label={'Department'}
                            type={'text'}
                            placeholder={'Enter department'}
                            value={state.currentItem.department || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {department: e.target.value}
                            })}
                        />
                        <Input
                            label={'Remote Workplace'}
                            type={'text'}
                            placeholder={'Enter remote workplace'}
                            value={state.currentItem.remote_workplace || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {remote_workplace: e.target.value}
                            })}
                        />
                        <Input
                            label={'Local Workplace'}
                            type={'text'}
                            placeholder={'Enter local workplace'}
                            value={state.currentItem.local_workplace || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {local_workplace: e.target.value}
                            })}
                        />
                        <Input
                            label={'Phone'}
                            type={'text'}
                            placeholder={'Enter phone'}
                            value={state.currentItem.phone || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {phone: e.target.value}
                            })}
                        />
                        <Input
                            label={'Cellular'}
                            type={'text'}
                            placeholder={'Enter cellular'}
                            value={state.currentItem.cellular || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {cellular: e.target.value}
                            })}
                        />
                        <Input
                            label={'Post'}
                            type={'text'}
                            placeholder={'Enter post'}
                            value={state.currentItem.post || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {post: e.target.value}
                            })}
                        />
                        <div className={'border border-gray-300 h-12 flex'}>
                            <label className={'border-r border-gray-300 min-w-36 flex items-center justify-center text-gray-700'}>
                                Company
                            </label>
                            <select
                                value={state.currentItem.company_id}
                                className={'p-2 w-full text-gray-700'}
                                onChange={(e) => localDispatch({
                                    type: 'UPDATE_CURRENT_ITEM',
                                    payload: {company_id: Number(e.target.value)}
                                })}
                            >
                                {state.companies.map(company => (
                                    <option key={company.id} value={company.id}>{company.username}</option>
                                ))}
                            </select>
                        </div>
                    </>}
                />
            )}
            {state.dialog === 'delete' && (
                <DialogActions
                    type={state.dialog}
                    closeDialog={closeDialog}
                    action={deleteItem}
                    dialogFields={<>
                        <Input
                            label={'ID'}
                            type={'number'}
                            placeholder={'Null'}
                            value={state.currentItem.id || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Username'}
                            type={'text'}
                            placeholder={'Null'}
                            value={state.currentItem.username || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Surname'}
                            type={'text'}
                            placeholder={'Null'}
                            value={state.currentItem.surname || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Name'}
                            type={'text'}
                            placeholder={'Null'}
                            value={state.currentItem.name || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Middlename'}
                            type={'text'}
                            placeholder={'Null'}
                            value={state.currentItem.middlename || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Department'}
                            type={'text'}
                            placeholder={'Null'}
                            value={state.currentItem.department || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Remote Workplace'}
                            type={'text'}
                            placeholder={'Enter remote workplace'}
                            value={state.currentItem.remote_workplace || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Local Workplace'}
                            type={'text'}
                            placeholder={'Enter local workplace'}
                            value={state.currentItem.local_workplace || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Phone'}
                            type={'text'}
                            placeholder={'Null'}
                            value={state.currentItem.phone || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Cellular'}
                            type={'text'}
                            placeholder={'Null'}
                            value={state.currentItem.cellular || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Post'}
                            type={'text'}
                            placeholder={'Null'}
                            value={state.currentItem.post || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Company'}
                            type={'text'}
                            placeholder={'Null'}
                            value={state.currentItem.companyName || ''}
                            readOnly={true}
                        />
                    </>}
                />
            )}
        </>
    )
}

export default PageAdmins;

interface DialogActionsProps {
    type: 'create' | 'update' | 'delete'
    closeDialog: () => void;
    action: () => void;
    dialogFields?: ReactNode;
}

const DialogActions: React.FC<DialogActionsProps> = ({type, closeDialog, action, dialogFields}) => {
    switch (type) {
        case "create":
            return (
                <Dialog
                    close={closeDialog}
                    title={"Create item"}
                    buttons={[
                        {text: "Cancel", onClick: closeDialog},
                        {text: "Create", onClick: action},
                    ]}
                    children={dialogFields}
                />
            );
        case "update":
            return (
                <Dialog
                    close={closeDialog}
                    title={"Update item"}
                    buttons={[
                        {text: "Cancel", onClick: closeDialog},
                        {text: "Update", onClick: action},
                    ]}
                    children={dialogFields}
                />
            );
        case "delete":
            return (
                <Dialog
                    close={closeDialog}
                    title={"Delete item"}
                    message={'Are you sure you want to delete this item?'}
                    buttons={[
                        {text: "Cancel", onClick: closeDialog},
                        {text: "Delete", onClick: action},
                    ]}
                    children={dialogFields}
                />
            );
        default:
            return null
    }
}
