import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const client = new QueryClient();

export default function QueryProvider({ children }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
