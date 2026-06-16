type Post = {
  id: number;
  title: string;
  body: string;
};

async function getPosts(): Promise<Post[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3", {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <p className="text-sm font-medium text-zinc-500">Server Component</p>
        <h1 className="text-3xl font-semibold tracking-tight">Deploy and Pray</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          이 페이지는 서버에서 데이터를 가져와 렌더링됩니다.
        </p>
        <a href="/items" className="inline-block text-sm text-blue-600 hover:underline">
          Items CRUD 데모 →
        </a>
      </header>

      <ul className="space-y-4">
        {posts.map((post) => (
          <li
            key={post.id}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <h2 className="font-medium">{post.title}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{post.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
