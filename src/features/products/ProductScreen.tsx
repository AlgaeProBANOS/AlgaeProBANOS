import CertificationSearchPanel from '@/pages/CertificationSearchPanel';
import KeywordSearchBar from './KeywordSearchBar';
import ProductFilter from './ProductFilter';
import TabArea from '../common/TabArea';

const tabs = [
  {
    key: 'productSectorTab',
    title: 'Product Sector',
    content: (
      <div className="size-full flex flex-col gap-">
        <ProductFilter />
        <div className="p-1 pt-0">
          <CertificationSearchPanel />
        </div>
      </div>
    ),
  },
  {
    key: 'productFilterTab',
    title: 'Producers',
    content: (
      <div className="flex flex-col gap-3">
        {/* <KeywordSearchBar />
        <CertificationSearchPanel /> */}
      </div>
    ),
  },
];

export default function ProductScreen(): JSX.Element {
  return (
    <div className="size-full flex flex-col border border-apb-gray rounded ">
      <ProductFilter />
      <div className="p-1 pt-0">
        <CertificationSearchPanel />
      </div>
      {/* <TabArea
        tabs={tabs}
        titleElement={
          <div className="flex items-center gap-1">
            <span className="font-bold">?</span> Selected Producers
            <div
              onClick={() => {
                
              }}
              className="row-span-2 items-center flex hover:bg-apb-aubergine bg-apb-aubergine/50 text-white px-2 rounded-md cursor-pointer h-full"
            >
              Reset
            </div>
          </div>
        }
      /> */}
    </div>
  );
}
