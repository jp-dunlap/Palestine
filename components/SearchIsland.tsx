import SearchClient from '@/components/SearchClient';

type Props = {
  locale?: 'en' | 'ar';
};

export default function SearchIsland({ locale }: Props) {
  return <SearchClient locale={locale} />;
}
