'use client';

import TokenRequestTable from '@/components/TokenRequestsTable';
import { getAllTokens } from '@/redux/slices/tokens';
import { AppDispatch, RootState } from '@/redux/store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function TokenPage() {
  const dispatch: AppDispatch = useDispatch();
  const { tokens } = useSelector((state: RootState) => state.tokens);

  useEffect(() => {
    dispatch(getAllTokens());
  }, []);

  return (
    <TokenRequestTable tokenRequests={tokens} />
  );
}
