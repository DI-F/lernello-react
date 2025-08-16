export function FullPageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="animate-pulse text-sm text-muted-foreground">
        Loading...
      </div>
    </div>
  );
}
