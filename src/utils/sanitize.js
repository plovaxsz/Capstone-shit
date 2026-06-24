const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;
const TAGS_REGEX = /<\/?[^>]+(>|$)/g;

export const sanitizeText = (
  value,
  { maxLength = 500, allowNewlines = false, forceLowercase = false, forceUppercase = false } = {}
) => {
  if (value === null || value === undefined) return '';

  let output = String(value).normalize('NFKC');
  output = output.replace(CONTROL_CHARS_REGEX, '');
  output = output.replace(TAGS_REGEX, '');

  if (!allowNewlines) {
    output = output.replace(/[\r\n]+/g, ' ');
  }

  output = output.replace(/[\t ]+/g, ' ').trim();

  if (forceLowercase) output = output.toLowerCase();
  if (forceUppercase) output = output.toUpperCase();

  return maxLength > 0 ? output.slice(0, maxLength) : output;
};

export const sanitizeFileExtension = (filename) => {
  const parts = String(filename || '').split('.');
  const rawExt = parts.length > 1 ? parts.pop() : '';
  const safeExt = rawExt.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  return safeExt || 'jpg';
};
