export const metadata = {
  title: 'About — Palestine',
  description:
    'About the project: scope, methodology, licensing, and how to contribute.',
};

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">About</h1>
      <p className="mt-3 text-base text-gray-700">
        This project presents a bilingual, anti-colonial history of Palestine across 4,000 years. Code is MIT; content is CC BY-SA 4.0.
      </p>
      <ul className="mt-6 list-disc pl-5 text-sm">
        <li>Methodology and sources</li>
        <li>How to contribute via GitHub</li>
        <li>Licensing and reuse</li>
      </ul>
    </main>
  );
}
