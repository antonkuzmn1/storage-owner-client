import React, {ReactNode, useCallback, useEffect, useReducer} from "react";
import {AppDispatch} from "../../utils/store.ts";
import {useDispatch} from "react-redux";
import {setAppError, setAppLoading} from "../../slices/appSlice.ts";
import Dialog from "../components/Dialog.tsx";
import {api} from "../../utils/api.ts";

export interface Note {
    id: number;
    title: string;
    description: string;
}

interface State {
    notes: Note[];
    dialog: "create" | "edit" | "delete" | null;
    currentNote: Note;
}

type Action =
    | { type: "SET_NOTES", payload: Note[] }
    | { type: "OPEN_DIALOG", payload: { dialog: "create" | "edit" | "delete", note?: Note } }
    | { type: "CLOSE_DIALOG" }
    | { type: "UPDATE_CURRENT_NOTE"; payload: Partial<Note> }
    | { type: "ADD_NOTE"; payload: Note }
    | { type: "EDIT_NOTE"; payload: Note }
    | { type: "DELETE_NOTE"; payload: Note };

const initialState: State = {
    notes: [],
    dialog: null,
    currentNote: {id: 0, title: "", description: ""},
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "SET_NOTES":
            return {
                ...state,
                notes: action.payload
            };
        case "OPEN_DIALOG":
            return {
                ...state,
                dialog: action.payload.dialog,
                currentNote: action.payload.note || {id: 0, title: "", description: ""}
            };
        case "CLOSE_DIALOG":
            return {
                ...state,
                dialog: null,
                currentNote: {id: 0, title: "", description: ""}
            };
        case "UPDATE_CURRENT_NOTE":
            return {
                ...state,
                currentNote: {...state.currentNote, ...action.payload}
            };
        case "ADD_NOTE":
            return {
                ...state,
                notes: [...state.notes, action.payload],
                dialog: null
            };
        case "EDIT_NOTE":
            return {
                ...state,
                notes: state.notes.map(note => (note.id === action.payload.id ? action.payload : note)),
                dialog: null,
            };
        case "DELETE_NOTE":
            return {
                ...state,
                notes: state.notes.filter(note => note.id !== action.payload.id),
                dialog: null,
            };
        default:
            return state;
    }
};

const PageNotes: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const [state, localDispatch] = useReducer(reducer, initialState);

    const getNotes = useCallback(async () => {
        dispatch(setAppLoading(true));
        try {
            const notesResponse = await api.get("/notes", {
                params: {owner: 'me'},
            });
            localDispatch({type: "SET_NOTES", payload: notesResponse.data});
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
        getNotes().then();
    }, [getNotes]);

    const openDialog = useCallback((dialog: "create" | "edit" | "delete", note?: Note) => {
        localDispatch({type: "OPEN_DIALOG", payload: {dialog, note}});
    }, []);

    const closeDialog = useCallback(() => {
        localDispatch({type: "CLOSE_DIALOG"});
    }, []);

    const createNote = useCallback(async () => {
        dispatch(setAppLoading(true));
        try {
            const response = await api.post("/notes", {
                title: state.currentNote.title,
                description: state.currentNote.description,
            });
            localDispatch({type: "ADD_NOTE", payload: response.data});
        } catch (error: unknown) {
            if (error instanceof Error) {
                dispatch(setAppError(error.message));
            } else {
                dispatch(setAppError("An unknown error occurred"));
            }
        } finally {
            dispatch(setAppLoading(false));
        }
    }, [state.currentNote, dispatch]);

    const editNote = useCallback(async () => {
        dispatch(setAppLoading(true));
        try {
            const response = await api.put(`/notes/${state.currentNote.id}`, {
                title: state.currentNote.title,
                description: state.currentNote.description,
            });
            localDispatch({type: "EDIT_NOTE", payload: response.data});
        } catch (error: unknown) {
            if (error instanceof Error) {
                dispatch(setAppError(error.message));
            } else {
                dispatch(setAppError("An unknown error occurred"));
            }
        } finally {
            dispatch(setAppLoading(false));
        }
    }, [state.currentNote, dispatch]);

    const deleteNote = useCallback(async () => {
        dispatch(setAppLoading(true));
        try {
            await api.delete(`/notes/${state.currentNote.id}`);
            localDispatch({type: "DELETE_NOTE", payload: state.currentNote});
        } catch (error: unknown) {
            if (error instanceof Error) {
                dispatch(setAppError(error.message));
            } else {
                dispatch(setAppError("An unknown error occurred"));
            }
        } finally {
            dispatch(setAppLoading(false));
        }
    }, [state.currentNote, dispatch]);

    const dialogFields = (<>
        <input
            type="text"
            placeholder="Title"
            value={state.currentNote.title}
            onChange={(e) => localDispatch({
                type: "UPDATE_CURRENT_NOTE",
                payload: {title: e.target.value}
            })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
            placeholder="Description"
            value={state.currentNote.description}
            onChange={(e) => localDispatch({
                type: "UPDATE_CURRENT_NOTE",
                payload: {description: e.target.value}
            })}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
    </>);

    return (
        <>
            <div className="p-4 gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-20">
                <div
                    className="border border-gray-300 shadow-md rounded-lg p-4 bg-white hover:shadow-lg transition-shadow duration-200"
                >
                    <h3 className="text-lg font-semibold items-center h-full flex justify-center"
                        onClick={() => openDialog("create")}
                    >Create new</h3>
                </div>
                {state.notes.length > 0 &&
                    state.notes.map((note, index) => (
                        <div
                            key={index}
                            className="border border-gray-300 shadow-md rounded-lg p-4 bg-white hover:shadow-lg transition-shadow duration-200"
                        >
                            <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                            <p className="text-gray-600 mb-4 whitespace-pre-wrap">{note.description}</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => openDialog("edit", note)}
                                    className="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => openDialog("delete", note)}
                                    className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                }
            </div>

            {state.dialog && (
                <DialogActions
                    type={state.dialog}
                    closeDialog={closeDialog}
                    action={state.dialog === 'create' ? createNote : (state.dialog === 'edit' ? editNote : deleteNote)}
                    dialogFields={dialogFields}
                />
            )}
        </>
    );
};

export default PageNotes;

interface DialogActionsProps {
    type: 'create' | 'edit' | 'delete'
    closeDialog: () => void;
    action: () => void;
    dialogFields?: ReactNode;
}

const DialogActions: React.FC<DialogActionsProps> = ({type, closeDialog, action, dialogFields}) => {
    switch (type) {
        case "create":
            return (
                <Dialog
                    title={"Create Note"}
                    message={"Fill in the details to create a new note"}
                    buttons={[
                        {text: "Cancel", onClick: closeDialog},
                        {text: "Create", onClick: action},
                    ]} close={function (): void {
                    throw new Error("Function not implemented.");
                }}                >
                    {dialogFields}
                </Dialog>
            );
        case "edit":
            return (
                <Dialog
                    title={"Edit Note"}
                    message={"Fill in the details to edit the note"}
                    buttons={[
                        {text: "Cancel", onClick: closeDialog},
                        {text: "Edit", onClick: action},
                    ]} close={function (): void {
                    throw new Error("Function not implemented.");
                }}                >
                    {dialogFields}
                </Dialog>
            );
        case "delete":
            return (
                <Dialog
                    title={"Delete Note"}
                    message={'Are you sure you want to delete this note?'}
                    buttons={[
                        {text: "Cancel", onClick: closeDialog},
                        {text: "Delete", onClick: action},
                    ]} close={function (): void {
                    throw new Error("Function not implemented.");
                }}                />
            );
        default:
            return null
    }
}
