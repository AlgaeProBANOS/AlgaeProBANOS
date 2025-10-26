import ProductFilter from './ProductFilter';
import KeywordSearchBar from './KeywordSearchBar';
import CertificationSearchPanel from '@/pages/CertificationSearchPanel';
import TabArea from '../common/TabArea';

const tabs = [
  {
    key: 'productSectorTab',
    title: 'Product Sector',
    content: <ProductFilter />,
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
    <TabArea
      tabs={tabs}
      // titleElement={<div className="flex items-center">{filteredSpecies?.length} Species</div>}
    />
  );
}
