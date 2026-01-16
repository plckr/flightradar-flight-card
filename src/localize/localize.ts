type DeepObject = { [key: string]: string | DeepObject };

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_TRANSLATION = {
  [DEFAULT_LANGUAGE]: (await import('./languages/en.json')).default,
};

const languages: Record<string, DeepObject> = {
  ...DEFAULT_TRANSLATION,
  pt: (await import('./languages/pt.json')).default,
  it: (await import('./languages/it.json')).default,
};

type DotPrefix<T extends string, U extends string> = `${T}.${U}`;

type NestedKeys<T> = {
  [K in Extract<keyof T, string>]: T[K] extends Record<string, any>
    ? K | DotPrefix<K, NestedKeys<T[K]>>
    : K;
}[Extract<keyof T, string>];

export type KeyString = NestedKeys<(typeof DEFAULT_TRANSLATION)[typeof DEFAULT_LANGUAGE]>;

export function localize(key: KeyString, locale: string, params?: Record<string, string>): string {
  let translated: string | undefined = undefined;
  const lang = locale.replace(/['"]+/g, '').replace('-', '_').replace('_', '').toLowerCase();

  if (languages.hasOwnProperty(lang)) {
    translated = getKeyString(key, languages[lang]);
  }

  const keyString = (translated ?? getKeyString(key, languages[DEFAULT_LANGUAGE]))?.replace(
    /{(\w+)}/g,
    (match, key) => params?.[key] ?? match
  );

  return keyString ?? key;
}

function getKeyString(key: string, translations: DeepObject): string | undefined {
  const result = key
    .split('.')
    .reduce<string | DeepObject | undefined>((translationLevel, keyPart) => {
      if (typeof translationLevel === 'object' && keyPart in translationLevel) {
        return translationLevel[keyPart];
      }

      return undefined;
    }, translations);

  if (typeof result === 'string') {
    return result;
  }

  return undefined;
}

export function getTFunc(locale: string) {
  const t = (key: KeyString, params?: Record<string, string>) => {
    return localize(key, locale, params);
  };

  return { t };
}
