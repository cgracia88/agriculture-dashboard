import { QueryClient } from '@tanstack/react-query';

// Configure how we fetch data from our API
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0] as string);
        if (!response.ok) {
          throw new Error(`Network response was not ok`);
        }
        return response.json();
      },
    },
  },
});

