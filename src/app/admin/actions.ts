'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function adminLogin(
  formData: FormData
): Promise<{ error: string } | undefined> {
  const password = formData.get('password') as string;

  if (!process.env.ADMIN_PASSWORD) {
    return { error: 'ADMIN_PASSWORD is not configured on the server.' };
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Invalid password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_authed', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/admin',
  });

  redirect('/admin');
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_authed');
  redirect('/admin');
}
