export default function SkipLink({ label = 'Skip to content' }: { label?: string }) {
  return (
    <a
      href="#main"
      className="sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black focus:ring"
    >
      {label}
    </a>
  );
}
