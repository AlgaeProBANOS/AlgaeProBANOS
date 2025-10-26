import { Fragment } from 'react';

import { withDictionaries } from '@/app/i18n/with-dictionaries';

export const getStaticProps = withDictionaries(['common']);

export default function MapTest(): JSX.Element {
  // const { t } = useI18n<'common'>();

  return (
    <div className='size-full grid grid-cols-2 grid-rows-2'>
      
    </div>
  );
}
