import ProductFilter from './ProductFilter';
import KeywordSearchBar from './KeywordSearchBar';
import CertificationSearchPanel from '@/pages/CertificationSearchPanel';
import TabArea from '../common/TabArea';

const tabs = [
  {
    key: 'productSectorTab',
    title: 'Product Sector',
    content: (
      <div className="size-full flex flex-col gap-3">
        <KeywordSearchBar />
        <ProductFilter />
        <CertificationSearchPanel />
      </div>
    ),
  },
  {
    key: 'productFilterTab',
    title: 'Product Filters',
    content: (
      <div className="flex flex-col gap-3">
        <KeywordSearchBar />
        <CertificationSearchPanel />
      </div>
    ),
  },
];

export default function ProductScreen(): JSX.Element {
  return (
    <div className="size-full flex flex-col gap-3">
      <KeywordSearchBar />
      <ProductFilter />
      <CertificationSearchPanel />
    </div>
    // <TabArea
    //   tabs={tabs}
    // />
  );
}
