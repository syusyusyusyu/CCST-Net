import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">ページが見つかりませんでした</p>
      <Link href="/" className="mt-4 text-primary hover:underline">
        ホームに戻る
      </Link>
    </div>
  );
}
