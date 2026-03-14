import { useQuery } from '@tanstack/react-query';

const FRANKFURTER_URL = 'https://api.frankfurter.app/latest?from=USD&to=TRY';

async function fetchUsdToTry(): Promise<number> {
  const res = await fetch(FRANKFURTER_URL);
  if (!res.ok) throw new Error('Exchange rate unavailable');
  const data = await res.json();
  const rate = data?.rates?.TRY;
  if (typeof rate !== 'number' || rate <= 0) throw new Error('Invalid rate');
  return rate;
}

const EXCHANGE_QUERY_KEY = ['exchange-rate-usd-try'] as const;

/** USD → TRY exchange rate (e.g. 1 USD = 34.5 TRY). Cached ~24h. */
export function useExchangeRate() {
  const query = useQuery({
    queryKey: EXCHANGE_QUERY_KEY,
    queryFn: fetchUsdToTry,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
  return {
    rate: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
