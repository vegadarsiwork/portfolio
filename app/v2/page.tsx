import { redirect } from 'next/navigation';

// The v2 portfolio is now the homepage. Redirect old /v2 links to /.
export default function V2Page() {
  redirect('/');
}
