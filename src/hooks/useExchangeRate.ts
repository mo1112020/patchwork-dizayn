import { useQuery } from '@tanstack/react-query';

// open.er-api.com is a free, CORS-enabled exchange rate API
const OPEN_ER_URL = 'https://open.er-api.com/v6/latest/USD';

async function fetchUsdToTry(): Promise<number> {
  const res = await fetch(OPEN_ER_URL);
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
