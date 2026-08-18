import { IGRPLoadingSpinner } from "@igrp/igrp-framework-react-design-system";

function LoadingPage({
  isLoading,
  error,
  message,
}: {
  isLoading: boolean;
  error?: boolean;
  message?: string;
}) {
  if (isLoading && !error) {
    return (
      <div className="flex items-center gap-2 flex-col py-10">
        <IGRPLoadingSpinner />
        <span className="text-sm text-muted-foreground">
          {message || "A carregar..."}
        </span>
      </div>
    );
  }
  return null;
}

export { LoadingPage };
