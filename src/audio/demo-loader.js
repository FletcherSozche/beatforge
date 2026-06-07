const DEMO_PATH = '/projects/neon-pulse-demo.bfp';
let loading = false;

export function isDemoLoading() {
  return loading;
}

export async function loadDemoProject() {
  if (loading) return null;
  loading = true;
  try {
    const res = await fetch(DEMO_PATH);
    if (!res.ok) throw new Error('Demo dosyasi bulunamadi');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Demo yukleme basarisiz:', err);
    return null;
  } finally {
    loading = false;
  }
}
