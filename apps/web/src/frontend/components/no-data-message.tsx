export default function NoDataMessage({ text }: { text: string }) {
  return (
    <p className="text-muted-foreground border border-dashed rounded text-xs py-8 text-center">
      {text}
    </p>
  );
}
