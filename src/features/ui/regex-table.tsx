import { useI18n } from '@/app/i18n/use-i18n';

const regexOptions = ['^', '$', 'dot', '\\d', '\\w', '\\s', '*', '+', '?', '[abc]', '(abc)', '\\b'];

export default function RegexTable() {
  const { t } = useI18n<'common'>();

  return (
    <div className="max-w-2xl p-1 text-sm">
      <h2 className="mb-4 text-base font-bold">Common Regex Options</h2>
      <div className="grid grid-cols-[auto_auto_auto] gap-2 gap-x-3">
        <div className="font-bold">Pattern</div>
        <div className="font-bold">Meaning</div>
        <div className="font-bold">Explanation</div>
        <div className="col-span-3 border-b" />
        {regexOptions.map((item, i) => {
          return (
            <>
              <div key={`regex-${i}`} className="flex items-center">
                <div className="flex items-center justify-center rounded-md border border-gray-500 p-1 font-mono">
                  {item === 'dot' ? '.' : item}
                </div>
              </div>
              <div key={`regex-${i}-2`} className="flex items-center">
                {t(`common.regex.${item}.meaning`)}
              </div>
              <div key={`regex-${i}-3`}>
                <p className="mt-2 text-gray-600">{t(`common.regex.${item}.explanation`)}</p>
              </div>
              <div key={`regex-${i}-4`} className="col-span-3 border-b" />
            </>
          );
        })}
      </div>
    </div>
  );
}
