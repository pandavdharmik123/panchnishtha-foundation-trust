import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import axiosInstance from "../../utils/axiosInstance";

export interface ExpenseRequest {
    id?: string;
    expenseNumber?: number;
    description?: string;
    amount?: number;
    expenseDate?: Date;
    createdAt?: Date | string;
}

interface ExpenseState {
    expenses: ExpenseRequest[];
    loading: boolean;
    error: string | null;
}

// ✅ Initial State
const initialState: ExpenseState = {
    expenses: [],
    loading: false,
    error: null,
};

// ✅ Async thunk to fetch all expenses
export const getAllExpenses = createAsyncThunk<
    ExpenseRequest[], // Response Type
    void,
    { rejectValue: string }
>("expenses/getAllExpenses", async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get("/expenses");
        return response.data;
    } catch (error: unknown) {
        const axiosError = error as AxiosError<{ error: string }>;
        return rejectWithValue(axiosError.response?.data?.error || "Fetching expenses failed");
    }
});

// ✅ Async thunk for creating a expense
export const createExpense = createAsyncThunk<
    ExpenseRequest,
    ExpenseRequest,
    { rejectValue: string }
>(
    "expenses/createExpense",
    async (expenseData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/expenses/createExpense", expenseData);
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as AxiosError<{ error: string }>;
            return rejectWithValue(axiosError.response?.data?.error || "Expense creation failed");
        }
    }
);

// ✅ Async thunk for updating a expense
export const updateExpense = createAsyncThunk<
    { message: string, updatedExpense: ExpenseRequest},
    { expenseId: string; data: ExpenseRequest },
    { rejectValue: string }
>(
    "expenses/updateExpense",
    async ({ expenseId, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/expenses/${expenseId}`, data);
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as AxiosError<{ error: string }>;
            return rejectWithValue(axiosError.response?.data?.error || "Expense update failed");
        }
    }
);

export const deleteExpense = createAsyncThunk<
    { message: string, expenseId: string},
    string,
    { rejectValue: string }
>(
    "expenses/deleteExpense",
    async (expenseId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/expenses/${expenseId}`);
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as AxiosError<{ error: string }>;
            return rejectWithValue(axiosError.response?.data?.error || "Expense Delete failed!");
        }
    }
);

// ✅ Expense Slice
const expenseSlice = createSlice({
    name: "expenses",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllExpenses.fulfilled, (state, action: PayloadAction<ExpenseRequest[]>) => {
                state.loading = false;
                state.expenses = action.payload;
            })
            .addCase(getAllExpenses.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || "Fetching expenses failed";
            })
            .addCase(createExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createExpense.fulfilled, (state, action: PayloadAction<ExpenseRequest>) => {
                state.loading = false;
                state.expenses = [action.payload, ...state.expenses];
            })
            .addCase(createExpense.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || "Expense creation failed";
            })
            .addCase(updateExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateExpense.fulfilled, (state, action: PayloadAction<{updatedExpense : ExpenseRequest}>) => {
                const updatedExpense = action.payload?.updatedExpense;
                if (updatedExpense) {

                    state.expenses = state.expenses.map(expense =>
                        expense.id === updatedExpense.id ? { ...expense, ...updatedExpense } : expense
                    );
                }
                state.loading = false;
            })
            .addCase(updateExpense.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || "Expense update failed";
            })
            .addCase(deleteExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteExpense.fulfilled, (state, action: PayloadAction<{expenseId : string}>) => {
                const deletedExpenseId = action.payload?.expenseId;
                if (deletedExpenseId) {
                    state.expenses = state.expenses.filter(expense => expense.id !== deletedExpenseId);
                }
                state.loading = false;
            })
            .addCase(deleteExpense.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || "Expense update failed";
            });
    },
});

export default expenseSlice.reducer;
