import {combineReducers} from "redux"
import {configureStore } from "@reduxjs/toolkit"
import type { ThunkAction, Action } from '@reduxjs/toolkit'
import {
    useDispatch as useReduxDispatch,
    useSelector as useReduxSelector,
} from 'react-redux'
import type{TypedUseSelectorHook} from 'react-redux'
import {persistReducer, persistStore} from "redux-persist"
import storage from 'redux-persist/lib/storage'

const persistConfig = {
    key: 'alsProgress',
    whitelist: ['user'],
    storage
}

const reducer = combineReducers({

})
const persistedReducer = persistReducer(persistConfig, reducer)
export const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
    devTools: true,
});
export const persistor = persistStore(store)
export const useAppSelector: TypedUseSelectorHook<RootState> = useReduxSelector
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useReduxDispatch<AppDispatch>()
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>