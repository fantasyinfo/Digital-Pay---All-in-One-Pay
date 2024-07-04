import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

// Needed to handle __dirname in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize i18next
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    },
    preload: ['en', 'hi','es'], // Preload languages
    fallbackLng:'en',
    detection: {
      order: ['querystring', 'header', 'cookie'], // Adjust order as needed
      caches: ['cookie'],
      lookupQuerystring: 'lang', // Query parameter to look for
      lookupHeader: 'accept-language', // Header to look for
    },
    supportedLngs: ['en', 'hi','es'], // Supported languages
    saveMissing: true,
  }, (err, t) => {
    if (err) return console.error(err);
    console.log('i18next is ready...');
    console.log(t('welcome', { lng: 'en' }));
    console.log(t('welcome', { lng: 'hi' }));
    console.log(t('welcome', { lng: 'es' }));
  });

export default i18next;
