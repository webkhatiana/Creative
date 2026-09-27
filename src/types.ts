export type QRType = 'text' | 'url' | 'wifi' | 'email' | 'sms' | 'phone' | 'vcard';

export type StudioMode = 'qr' | 'barcode' | 'batch_barcode';

export type BarcodeFormat =
  | 'CODE128'
  | 'CODE128A'
  | 'CODE128B'
  | 'CODE128C'
  | 'EAN13'
  | 'EAN8'
  | 'UPC'
  | 'UPCE'
  | 'CODE39'
  | 'ITF14'
  | 'ITF'
  | 'MSI'
  | 'pharmacode'
  | 'codabar';

export interface WifiConfig {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
}

export interface EmailConfig {
  email: string;
  subject?: string;
  body?: string;
}

export interface SmsConfig {
  phone: string;
  message?: string;
}

export interface PhoneConfig {
  phone: string;
}

export interface VCardConfig {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
  note?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
}

export interface QRDesign {
  fgColor: string;
  bgColor: string;
  margin: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  size: number;
  logoUrl: string | null;
  logoSize: number; // 0.1 to 0.3 (proportion of QR code size)
  logoMargin: boolean; // draw quiet zone behind logo
}

export interface BarcodeDesign {
  format: BarcodeFormat;
  lineColor: string;
  background: string;
  width: number; // bar scale 1-5
  height: number; // bar height 30-200
  displayValue: boolean;
  text: string; // custom display text override (empty = use raw value)
  font: string; // 'monospace' | 'sans-serif' | 'serif' | 'OCR-B'
  fontOptions: string; // '' | 'bold' | 'italic' | 'bold italic'
  fontSize: number; // 10-30
  textAlign: 'center' | 'left' | 'right';
  textPosition: 'bottom' | 'top';
  textMargin: number; // 0-25
  margin: number; // 0-40
}

export interface HistoryItem {
  id: string;
  title: string;
  type: QRType;
  rawText: string;
  design: QRDesign;
  createdAt: string;
}

export interface BarcodeHistoryItem {
  id: string;
  title: string;
  format: BarcodeFormat;
  value: string;
  design: BarcodeDesign;
  createdAt: string;
}
