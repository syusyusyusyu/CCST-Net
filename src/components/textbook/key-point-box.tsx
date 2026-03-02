interface KeyPointProps {
  children: React.ReactNode;
}

export function KeyPoint({ children }: KeyPointProps) {
  return (
    <div className="my-4 rounded-lg border-l-4 border-primary bg-primary/5 p-4">
      <p className="mb-2 text-sm font-bold text-primary">ここがポイント</p>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
