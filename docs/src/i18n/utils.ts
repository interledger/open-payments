import { ui, languages, defaultLang, routes } from "./ui";

export function getLangFromUrl(url: URL) {
  const [, , lang] = url.pathname.split("/");
  if (lang in ui) return lang as keyof typeof languages;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof languages) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    const defaultStrings = ui[defaultLang];
    const currentStrings = ui[lang] as Partial<typeof defaultStrings>;

    return currentStrings[key] ?? defaultStrings[key];
  };
}

export function useTranslatedPath(
  l: keyof typeof languages,
  currentL: keyof typeof languages
) {
  return function translatePath(
    path: string,
    lang: keyof typeof languages = l,
    currentLang: keyof typeof languages = currentL
  ) {
    if (!path.includes("/developers")) {
      if (lang !== defaultLang) {
        return `/${lang}${path}`;
      }
      return path;
    }

    // for paths inside dev portal: the translated path is /developers/es/blog, not /es/developers/blog
    const pathSegments = path.split("/");
    let newSegments: string[];

    if (lang !== defaultLang) {
      newSegments = [...pathSegments];
      newSegments.splice(2, 0, lang);
    } else {
      newSegments = pathSegments.filter((segment) => segment !== currentLang);
    }

    translateSlug(lang, currentLang, newSegments);

    const translatedPath = newSegments.join("/");
    return translatedPath;
  };
}

function translateSlug(
  translationLang: keyof typeof languages,
  currentLang: keyof typeof languages,
  newSegments: string[]
) {
  const slug = newSegments.at(-1);
  const isBlogPostPath =
    slug !== undefined && Object.values(routes[currentLang]).includes(slug);
  const key = Object.keys(routes[currentLang]).find(
    (key) => routes[currentLang][key] === slug
  );

  if (isBlogPostPath && key) {
    const translatedSlug =
      routes[translationLang][key] ?? routes[defaultLang][key] ?? "";

    newSegments.splice(-1, 1, translatedSlug);
  }
}
