import React, {ReactNode, useCallback, useEffect, useReducer} from "react";
import {AppDispatch} from "../../utils/store.ts";
import {useDispatch} from "react-redux";
import {setAppError, setAppLoading} from "../../slices/appSlice.ts";
import {api} from "../../utils/api.ts";
import Table from "../components/Table.tsx";
import Dialog from "../components/Dialog.tsx";
import Input from "../components/Input.tsx";

interface Item {
    id: number;
    username: string;
    description: string;
    created_at: string | null;
    updated_at: string | null;
}

interface State {
    items: Item[];
    dialog: 'create' | 'update' | 'delete' | null;
    currentItem: Item;
}

type Action =
    | { type: 'SET_ITEMS', payload: Item[] }
    | { type: 'OPEN_DIALOG', payload: { dialog: 'create' | 'update' | 'delete', item?: Item } }
    | { type: 'CLOSE_DIALOG' }
    | { type: 'UPDATE_CURRENT_ITEM', payload: Partial<Item> }
    | { type: 'ADD_ITEM', payload: Item }
    | { type: 'UPDATE_ITEM', payload: Item }
    | { type: 'DELETE_ITEM', payload: Item };

const defaultItem: Item = {
    id: 0,
    username: '',
    description: '',
    created_at: null,
    updated_at: null,
}

const initialState: State = {
    items: [],
    dialog: null,
    currentItem: defaultItem,
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
    {text: 'Description', field: 'description', width: '200px', type: 'String'},
    {text: 'Created at', field: 'created_at', width: '200px', type: 'Date'},
    {text: 'Updated at', field: 'updated_at', width: '200px', type: 'Date'},
]

const PageCompanies: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const [state, localDispatch] = useReducer(reducer, initialState);

    const getItems = useCallback(async () => {
        dispatch(setAppLoading(true));
        try {
            const response = await api.get("/companies/");
            localDispatch({type: "SET_ITEMS", payload: response.data});
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
            const response = await api.post("/companies/", {
                username: state.currentItem.username,
                description: state.currentItem.description,
            });
            localDispatch({type: "ADD_ITEM", payload: response.data});
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
            const response = await api.put(`/companies/${state.currentItem.id}`, {
                username: state.currentItem.username,
                description: state.currentItem.description,
            });
            localDispatch({type: "UPDATE_ITEM", payload: response.data});
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
            await api.delete(`/companies/${state.currentItem.id}`);
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
                            label={'Description'}
                            type={'text'}
                            placeholder={'Enter description'}
                            value={state.currentItem.description || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {description: e.target.value}
                            })}
                        />
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
                            label={'Description'}
                            type={'text'}
                            placeholder={'Enter description'}
                            value={state.currentItem.description || ''}
                            onChange={(e) => localDispatch({
                                type: 'UPDATE_CURRENT_ITEM',
                                payload: {description: e.target.value}
                            })}
                        />
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
                            value={state.currentItem.id || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Username'}
                            type={'text'}
                            value={state.currentItem.username || ''}
                            readOnly={true}
                        />
                        <Input
                            label={'Description'}
                            type={'text'}
                            placeholder={'Enter description'}
                            value={state.currentItem.description || ''}
                            readOnly={true}
                        />
                    </>}
                />
            )}
        </>
    )
}

export default PageCompanies;

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
