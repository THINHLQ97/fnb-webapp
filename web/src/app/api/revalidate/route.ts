import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// POST /api/revalidate
// Body: { paths: string[] }
// Header: x-revalidate-secret: <REVALIDATE_SECRET>
//
// Được admin gọi sau khi CRUD (post/settings/menu overlay) để làm mới cache web.
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'REVALIDATE_SECRET chưa cấu hình trên web app' },
      { status: 500 }
    );
  }

  const header = req.headers.get('x-revalidate-secret');
  if (header !== secret) {
    return NextResponse.json({ ok: false, error: 'Sai secret' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body không phải JSON' }, { status: 400 });
  }

  const paths = (body as { paths?: unknown })?.paths;
  if (!Array.isArray(paths) || paths.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Cần truyền paths: string[]' },
      { status: 400 }
    );
  }

  const revalidated: string[] = [];
  for (const p of paths) {
    if (typeof p === 'string' && p.startsWith('/')) {
      revalidatePath(p);
      revalidated.push(p);
    }
  }

  return NextResponse.json({ ok: true, revalidated });
}
