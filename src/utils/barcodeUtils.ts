import { BarcodeFormat } from '../types';

export interface BarcodeFormatInfo {
  format: BarcodeFormat;
  name: string;
  category: 'Universal' | 'Retail' | 'Packaging' | 'Industrial' | 'Specialized';
  description: string;
  charSet: string;
  defaultSample: string;
  lengthHint: string;
}

export const BARCODE_FORMATS: BarcodeFormatInfo[] = [
  {
    format: 'CODE128',
    name: 'Code 128 (Universal)',
    category: 'Universal',
    description: 'High-density alphanumeric code. Standard for logistics, shipping, barcodes, and inventory.',
    charSet: 'Full ASCII (Letters, Numbers, Symbols)',
    defaultSample: 'STUDIO-8942-X7',
    lengthHint: 'Variable length (1-80 chars)',
  },
  {
    format: 'EAN13',
    name: 'EAN-13 (International Retail)',
    category: 'Retail',
    description: 'Standard product barcode used globally at retail point of sale (GTIN-13).',
    charSet: '12 or 13 numeric digits',
    defaultSample: '978020137962',
    lengthHint: '12 digits (+ 1 auto checksum) or 13 digits',
  },
  {
    format: 'UPC',
    name: 'UPC-A (North American Retail)',
    category: 'Retail',
    description: 'Standard North American retail barcode (12 digits GTIN-12).',
    charSet: '11 or 12 numeric digits',
    defaultSample: '01234567890',
    lengthHint: '11 digits (+ 1 auto checksum) or 12 digits',
  },
  {
    format: 'EAN8',
    name: 'EAN-8 (Compact Retail)',
    category: 'Retail',
    description: 'Shortened barcode for small retail packages where EAN-13 does not fit.',
    charSet: '7 or 8 numeric digits',
    defaultSample: '9638507',
    lengthHint: '7 digits (+ 1 auto checksum) or 8 digits',
  },
  {
    format: 'UPCE',
    name: 'UPC-E (Zero-Suppressed)',
    category: 'Retail',
    description: 'Compressed 6-8 digit version of UPC-A for small items in North America.',
    charSet: '6 to 8 numeric digits',
    defaultSample: '0123456',
    lengthHint: '6 to 8 digits',
  },
  {
    format: 'CODE39',
    name: 'Code 39 (Alphanumeric)',
    category: 'Industrial',
    description: 'Widely used in automotive, defense, healthcare, and industrial asset tracking.',
    charSet: 'A-Z, 0-9, space, -, ., $, /, +, %',
    defaultSample: 'ASSET-2026',
    lengthHint: 'Variable length',
  },
  {
    format: 'ITF14',
    name: 'ITF-14 (Carton Shipping)',
    category: 'Packaging',
    description: 'Interleaved 2 of 5 with bearer bars for corrugated shipping boxes and cartons.',
    charSet: '13 or 14 numeric digits',
    defaultSample: '1001234567890',
    lengthHint: '13 or 14 digits',
  },
  {
    format: 'ITF',
    name: 'ITF (Interleaved 2 of 5)',
    category: 'Packaging',
    description: 'Compact numeric-only barcode for warehousing, tickets, and distribution.',
    charSet: 'Even number of numeric digits (0-9)',
    defaultSample: '12345678',
    lengthHint: 'Even number of digits (e.g. 2, 4, 6, 8...)',
  },
  {
    format: 'MSI',
    name: 'MSI / Plessey',
    category: 'Industrial',
    description: 'Modified Plessey barcode used for warehouse shelf tags, library books, and storage bins.',
    charSet: 'Numeric digits (0-9)',
    defaultSample: '123456789',
    lengthHint: 'Variable numeric digits',
  },
  {
    format: 'pharmacode',
    name: 'Pharmacode (Laetus)',
    category: 'Specialized',
    description: 'One-track barcode used in pharmaceutical packaging control as a packing inspection tool.',
    charSet: 'Numeric value from 3 to 131070',
    defaultSample: '12345',
    lengthHint: 'Integer between 3 and 131070',
  },
  {
    format: 'codabar',
    name: 'Codabar (NW-7)',
    category: 'Specialized',
    description: 'Used by blood banks, libraries, photo labs, and courier airbills.',
    charSet: '0-9, -, $, :, /, ., + and start/stop chars A, B, C, D',
    defaultSample: 'A12345678B',
    lengthHint: 'Start/stop with A, B, C, or D',
  },
];

/**
 * Calculates EAN/UPC modulo 10 check digit
 */
export function calculateMod10CheckDigit(digits: string): number {
  const clean = digits.replace(/\D/g, '');
  let sum = 0;
  // Weight alternate 3 and 1 from right to left
  const len = clean.length;
  for (let i = len - 1; i >= 0; i--) {
    const num = parseInt(clean[i], 10);
    const weight = (len - 1 - i) % 2 === 0 ? 3 : 1;
    sum += num * weight;
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

/**
 * Validates and provides helpful correction advice for a barcode format
 */
export function validateBarcodeValue(format: BarcodeFormat, value: string): { isValid: boolean; message?: string; suggestedFix?: string } {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: 'Please enter a barcode value.' };
  }

  const trimmed = value.trim();

  switch (format) {
    case 'EAN13': {
      const nums = trimmed.replace(/\D/g, '');
      if (nums.length !== trimmed.length) {
        return { isValid: false, message: 'EAN-13 only accepts numeric digits (0-9).' };
      }
      if (nums.length === 12) {
        const check = calculateMod10CheckDigit(nums);
        return {
          isValid: true,
          suggestedFix: `${nums}${check}`,
        };
      }
      if (nums.length === 13) {
        const expectedCheck = calculateMod10CheckDigit(nums.slice(0, 12));
        const actualCheck = parseInt(nums[12], 10);
        if (expectedCheck !== actualCheck) {
          return {
            isValid: false,
            message: `Checksum error: Last digit is ${actualCheck}, but should be ${expectedCheck}.`,
            suggestedFix: `${nums.slice(0, 12)}${expectedCheck}`,
          };
        }
        return { isValid: true };
      }
      return { isValid: false, message: `EAN-13 requires 12 or 13 digits (currently ${nums.length}).` };
    }

    case 'EAN8': {
      const nums = trimmed.replace(/\D/g, '');
      if (nums.length !== trimmed.length) {
        return { isValid: false, message: 'EAN-8 only accepts numeric digits (0-9).' };
      }
      if (nums.length === 7) {
        const check = calculateMod10CheckDigit(nums);
        return { isValid: true, suggestedFix: `${nums}${check}` };
      }
      if (nums.length === 8) {
        const expectedCheck = calculateMod10CheckDigit(nums.slice(0, 7));
        const actualCheck = parseInt(nums[7], 10);
        if (expectedCheck !== actualCheck) {
          return {
            isValid: false,
            message: `Checksum error: Last digit is ${actualCheck}, but should be ${expectedCheck}.`,
            suggestedFix: `${nums.slice(0, 7)}${expectedCheck}`,
          };
        }
        return { isValid: true };
      }
      return { isValid: false, message: `EAN-8 requires 7 or 8 digits (currently ${nums.length}).` };
    }

    case 'UPC': {
      const nums = trimmed.replace(/\D/g, '');
      if (nums.length !== trimmed.length) {
        return { isValid: false, message: 'UPC-A only accepts numeric digits (0-9).' };
      }
      if (nums.length === 11) {
        const check = calculateMod10CheckDigit(nums);
        return { isValid: true, suggestedFix: `${nums}${check}` };
      }
      if (nums.length === 12) {
        const expectedCheck = calculateMod10CheckDigit(nums.slice(0, 11));
        const actualCheck = parseInt(nums[11], 10);
        if (expectedCheck !== actualCheck) {
          return {
            isValid: false,
            message: `Checksum error: Last digit is ${actualCheck}, but should be ${expectedCheck}.`,
            suggestedFix: `${nums.slice(0, 11)}${expectedCheck}`,
          };
        }
        return { isValid: true };
      }
      return { isValid: false, message: `UPC-A requires 11 or 12 digits (currently ${nums.length}).` };
    }

    case 'ITF14': {
      const nums = trimmed.replace(/\D/g, '');
      if (nums.length !== trimmed.length) {
        return { isValid: false, message: 'ITF-14 only accepts numeric digits.' };
      }
      if (nums.length === 13) {
        const check = calculateMod10CheckDigit(nums);
        return { isValid: true, suggestedFix: `${nums}${check}` };
      }
      if (nums.length === 14) {
        const expectedCheck = calculateMod10CheckDigit(nums.slice(0, 13));
        const actualCheck = parseInt(nums[13], 10);
        if (expectedCheck !== actualCheck) {
          return {
            isValid: false,
            message: `Checksum error: Last digit is ${actualCheck}, but should be ${expectedCheck}.`,
            suggestedFix: `${nums.slice(0, 13)}${expectedCheck}`,
          };
        }
        return { isValid: true };
      }
      return { isValid: false, message: `ITF-14 requires 13 or 14 digits (currently ${nums.length}).` };
    }

    case 'ITF': {
      const nums = trimmed.replace(/\D/g, '');
      if (nums.length !== trimmed.length) {
        return { isValid: false, message: 'ITF only accepts numeric digits (0-9).' };
      }
      if (nums.length % 2 !== 0) {
        return {
          isValid: false,
          message: `ITF requires an EVEN number of digits (currently ${nums.length}).`,
          suggestedFix: `0${nums}`,
        };
      }
      return { isValid: true };
    }

    case 'CODE39': {
      const validChars = /^[0-9A-Z\-.$/+% ]+$/;
      if (!validChars.test(trimmed.toUpperCase())) {
        return { isValid: false, message: 'Code 39 only accepts A-Z, 0-9, space, -, ., $, /, +, %.' };
      }
      return { isValid: true };
    }

    case 'pharmacode': {
      const num = parseInt(trimmed, 10);
      if (isNaN(num) || num < 3 || num > 131070 || String(num) !== trimmed) {
        return { isValid: false, message: 'Pharmacode must be an integer between 3 and 131070.' };
      }
      return { isValid: true };
    }

    case 'codabar': {
      const validChars = /^[ABCDabcd][0-9\-:$/.+]*[ABCDabcd]$/;
      if (!validChars.test(trimmed)) {
        return {
          isValid: false,
          message: 'Codabar must start and end with A, B, C, or D (e.g. A12345B).',
          suggestedFix: `A${trimmed.replace(/^[ABCDabcd]/, '').replace(/[ABCDabcd]$/, '')}B`,
        };
      }
      return { isValid: true };
    }

    default:
      return { isValid: true };
  }
}
