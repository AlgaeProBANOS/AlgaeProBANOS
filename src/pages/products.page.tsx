import { Fragment } from 'react';

import { withDictionaries } from '@/app/i18n/with-dictionaries';
import ProductMap from '@/features/products/ProductMap';

export const getStaticProps = withDictionaries(['common']);

export default function MapTest(): JSX.Element {
  // const { t } = useI18n<'common'>();

  return (
    <Fragment>
      <div className="grid h-full grid-cols-[1fr] grid-rows-1">
        <ProductMap />
      </div>
    </Fragment>
  );
}
