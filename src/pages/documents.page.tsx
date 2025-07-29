import { Fragment } from 'react';

import { withDictionaries } from '@/app/i18n/with-dictionaries';
import DataPanel from '@/features/ui/data-panel';
import HomepageTabs from '@/features/ui/homepage-tabs';

export const getStaticProps = withDictionaries(['common']);

export default function MapTest(): JSX.Element {
  // const { t } = useI18n<'common'>();

  return (
    <Fragment>
      <div className="grid h-full grid-cols-[200px_1fr] grid-rows-1">
        <DataPanel />
        <HomepageTabs />
      </div>
    </Fragment>
  );
}
