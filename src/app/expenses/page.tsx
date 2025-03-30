'use client';

import { getAllExpenses } from '@/redux/slices/expenses';
import { AppDispatch, RootState } from '@/redux/store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExpensesTable from "@/components/ExpensesTable";

export default function TokenPage() {
    const dispatch: AppDispatch = useDispatch();
    const { expenses } = useSelector((state: RootState) => state.expenses);

    useEffect(() => {
        dispatch(getAllExpenses());
    }, [dispatch]);

    return (
        <ExpensesTable expensesData={expenses} />
    );
}
