import CertificationSearchPanel from '@/pages/CertificationSearchPanel';
import KeywordSearchBar from './KeywordSearchBar';
import ProductFilter from './ProductFilter';

// const tabs = [
//   {
//     key: 'productSectorTab',
//     title: 'Product Sector',
//     content: (
//       <div className="size-full flex flex-col gap-">
//         <KeywordSearchBar />
//         <ProductFilter />
//         <CertificationSearchPanel />
//       </div>
//     ),
//   },
//   {
//     key: 'productFilterTab',
//     title: 'Product Filters',
//     content: (
//       <div className="flex flex-col gap-3">
//         <KeywordSearchBar />
//         <CertificationSearchPanel />
//       </div>
//     ),
//   },
// ];

export default function ProductScreen(): JSX.Element {
  return (
    <div className="size-full flex flex-col border border-apb-gray rounded ">
      {/* <KeywordSearchBar /> */}
      <ProductFilter />
      <div className="p-1 pt-0">
        <CertificationSearchPanel />
      </div>
    </div>
    // <TabArea
    //   tabs={tabs}
    // />
  );
}
