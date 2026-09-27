import React, { useState, useEffect } from 'react';
import { 
  Type, Link, Wifi, Mail, MessageSquare, Phone, 
  UserCheck, Globe, Building, Briefcase, MapPin, Notebook
} from 'lucide-react';
import { QRType, WifiConfig, EmailConfig, SmsConfig, PhoneConfig, VCardConfig } from '../types';

interface QRFormatInputsProps {
  currentType: QRType;
  onChangeType: (type: QRType) => void;
  onRawTextChanged: (text: string, title: string) => void;
}

export default function QRFormatInputs({ 
  currentType, 
  onChangeType, 
  onRawTextChanged 
}: QRFormatInputsProps) {
  // Slate active states for each form type
  const [textVal, setTextVal] = useState<string>('Hello QR!');
  const [urlVal, setUrlVal] = useState<string>('https://google.com');
  
  const [wifiVal, setWifiVal] = useState<WifiConfig>({
    ssid: 'MyHomeWiFi',
    password: 'super-password',
    encryption: 'WPA'
  });

  const [emailVal, setEmailVal] = useState<EmailConfig>({
    email: 'recipient@example.com',
    subject: 'Hello from QR!',
    body: 'Scanned from a QR code'
  });

  const [smsVal, setSmsVal] = useState<SmsConfig>({
    phone: '+1234567890',
    message: 'Hello, check out this QR!'
  });

  const [phoneVal, setPhoneVal] = useState<PhoneConfig>({
    phone: '+1234567890'
  });

  const [vcardVal, setVcardVal] = useState<VCardConfig>({
    firstName: 'Jane',
    lastName: 'Doe',
    organization: 'Acme Corp',
    title: 'Software Architect',
    phone: '+15550199',
    email: 'jane.doe@example.com',
    url: 'https://example.com',
    note: 'Professional Contact Info',
    street: '123 Tech Lane',
    city: 'San Francisco',
    zip: '94107',
    country: 'USA'
  });

  // Automatically recalculate and lift raw text string on change
  useEffect(() => {
    let rawStr = '';
    let autoTitle = '';

    switch (currentType) {
      case 'text':
        rawStr = textVal;
        autoTitle = textVal.trim() ? `Text: ${textVal.slice(0, 20)}${textVal.length > 20 ? '...' : ''}` : 'Plain Text';
        break;

      case 'url': {
        let cleanUrl = urlVal.trim();
        if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
          cleanUrl = 'https://' + cleanUrl;
        }
        rawStr = cleanUrl;
        const displayUrl = cleanUrl.replace(/^https?:\/\/(www\.)?/i, '');
        autoTitle = displayUrl ? `URL: ${displayUrl.slice(0, 20)}${displayUrl.length > 20 ? '...' : ''}` : 'Website URL';
        break;
      }

      case 'wifi': {
        const { ssid, password, encryption } = wifiVal;
        const pStr = encryption !== 'nopass' && password ? `P:${password};` : '';
        rawStr = `WIFI:S:${ssid};T:${encryption};${pStr};`;
        autoTitle = `WiFi: ${ssid}`;
        break;
      }

      case 'email': {
        const { email, subject, body } = emailVal;
        const subjectPart = subject ? `?subject=${encodeURIComponent(subject)}` : '';
        const bodyPart = body ? `${subject ? '&' : '?'}body=${encodeURIComponent(body)}` : '';
        rawStr = `mailto:${email}${subjectPart}${bodyPart}`;
        autoTitle = `Email to: ${email}`;
        break;
      }

      case 'sms': {
        const { phone, message } = smsVal;
        const msgPart = message ? `?body=${encodeURIComponent(message)}` : '';
        rawStr = `sms:${phone}${msgPart}`;
        autoTitle = `SMS to: ${phone}`;
        break;
      }

      case 'phone':
        rawStr = `tel:${phoneVal.phone}`;
        autoTitle = `Phone: ${phoneVal.phone}`;
        break;

      case 'vcard': {
        const lines = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${vcardVal.lastName || ''};${vcardVal.firstName || ''};;;`,
          `FN:${vcardVal.firstName || ''} ${vcardVal.lastName || ''}`.trim()
        ];
        if (vcardVal.organization) lines.push(`ORG:${vcardVal.organization}`);
        if (vcardVal.title) lines.push(`TITLE:${vcardVal.title}`);
        if (vcardVal.phone) lines.push(`TEL;TYPE=CELL:${vcardVal.phone}`);
        if (vcardVal.email) lines.push(`EMAIL;TYPE=PREF,INTERNET:${vcardVal.email}`);
        if (vcardVal.url) lines.push(`URL:${vcardVal.url}`);
        if (vcardVal.note) lines.push(`NOTE:${vcardVal.note}`);
        if (vcardVal.street || vcardVal.city || vcardVal.zip || vcardVal.country) {
          lines.push(`ADR;TYPE=WORK:;;${vcardVal.street || ''};${vcardVal.city || ''};;${vcardVal.zip || ''};${vcardVal.country || ''}`);
        }
        lines.push('END:VCARD');
        rawStr = lines.filter(Boolean).join('\n');
        
        const fullName = `${vcardVal.firstName || ''} ${vcardVal.lastName || ''}`.trim();
        autoTitle = fullName ? `Contact: ${fullName}` : 'vCard Contact';
        break;
      }
    }

    onRawTextChanged(rawStr, autoTitle);
  }, [currentType, textVal, urlVal, wifiVal, emailVal, smsVal, phoneVal, vcardVal]);

  const tabs: { type: QRType; label: string; icon: React.ComponentType<any> }[] = [
    { type: 'url', label: 'URL', icon: Link },
    { type: 'text', label: 'Text', icon: Type },
    { type: 'wifi', label: 'WiFi', icon: Wifi },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'sms', label: 'SMS', icon: MessageSquare },
    { type: 'phone', label: 'Phone', icon: Phone },
    { type: 'vcard', label: 'V-Card', icon: UserCheck }
  ];

  return (
    <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6" id="qr-format-inputs-panel">
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-900">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block"></span>
          1. CONTENT SOURCE DATA
        </h2>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">Select standard action &amp; encode payload details.</p>
      </div>

      {/* Tabs list with brutalist styled button grids */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2" id="format-tabs-grid">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = currentType === tab.type;
          return (
            <button
              key={tab.type}
              id={`tab-select-${tab.type}`}
              onClick={() => onChangeType(tab.type)}
              type="button"
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black' 
                  : 'bg-zinc-100 text-zinc-500 hover:text-black border-2 border-transparent font-bold hover:bg-zinc-200/60'
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-blue-400 animate-pulse' : 'text-zinc-400'}`} />
              <span className="text-[10px] uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="border-t-2 border-dashed border-zinc-200 pt-5 flex flex-col gap-4" id="active-format-form">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
          Fill in details below
        </h3>

        {/* Dynamic fields */}
        {currentType === 'url' && (
          <div className="flex flex-col gap-1" id="url-form">
            <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="url-input-field">Website Address</label>
            <div className="relative flex items-center mt-1">
              <span className="absolute left-4 text-xs text-zinc-400 select-none font-bold">URL</span>
              <input
                type="text"
                id="url-input-field"
                className="w-full text-sm pl-14 pr-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                placeholder="www.mybusiness.com"
                value={urlVal}
                onChange={(e) => setUrlVal(e.target.value)}
              />
            </div>
            <p className="text-[10px] font-medium italic text-zinc-400 mt-1">Standard browsers will navigate to this link automatically when scanned.</p>
          </div>
        )}

        {currentType === 'text' && (
          <div className="flex flex-col gap-1" id="text-form">
            <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="text-input-field">Plain Text Content</label>
            <textarea
              id="text-input-field"
              className="w-full text-sm mt-1 px-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800 min-h-[100px] resize-y"
              placeholder="Type or paste any text message, prompt, or raw data here..."
              value={textVal}
              onChange={(e) => setTextVal(e.target.value)}
            />
            <p className="text-[10px] font-medium italic text-zinc-400 mt-1">Displays plain text directly to the user when scanned.</p>
          </div>
        )}

        {currentType === 'wifi' && (
          <div className="flex flex-col gap-4" id="wifi-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="wifi-ssid">Network Name (SSID)</label>
                <input
                  type="text"
                  id="wifi-ssid"
                  className="w-full text-sm mt-1 px-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                  placeholder="HomeWiFi"
                  value={wifiVal.ssid}
                  onChange={(e) => setWifiVal({ ...wifiVal, ssid: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="wifi-encryption">Security Mode</label>
                <select
                  id="wifi-encryption"
                  className="w-full text-sm mt-1 px-3 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-bold outline-none cursor-pointer text-zinc-700"
                  value={wifiVal.encryption}
                  onChange={(e) => setWifiVal({ ...wifiVal, encryption: e.target.value as any })}
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Unsecured (No Password)</option>
                </select>
              </div>
            </div>

            {wifiVal.encryption !== 'nopass' && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="wifi-password">WiFi Password</label>
                <input
                  type="password"
                  id="wifi-password"
                  className="w-full text-sm mt-1 px-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                  placeholder="••••••••"
                  value={wifiVal.password || ''}
                  onChange={(e) => setWifiVal({ ...wifiVal, password: e.target.value })}
                />
              </div>
            )}
            <p className="text-[10px] font-medium italic text-zinc-400">Allows mobile devices to automatically join this WiFi network immediately when scanned.</p>
          </div>
        )}

        {currentType === 'email' && (
          <div className="flex flex-col gap-4" id="email-form">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="email-receiver">Email Address</label>
              <input
                type="email"
                id="email-receiver"
                className="w-full text-sm mt-1 px-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                placeholder="developer@gmail.com"
                value={emailVal.email}
                onChange={(e) => setEmailVal({ ...emailVal, email: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="email-subject">Subject (Optional)</label>
              <input
                type="text"
                id="email-subject"
                className="w-full text-sm mt-1 px-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                placeholder="Inquiry from QR Code"
                value={emailVal.subject || ''}
                onChange={(e) => setEmailVal({ ...emailVal, subject: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="email-body">Message Body (Optional)</label>
              <textarea
                id="email-body"
                className="w-full text-sm mt-1 px-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800 min-h-[70px]"
                placeholder="Type your message body..."
                value={emailVal.body || ''}
                onChange={(e) => setEmailVal({ ...emailVal, body: e.target.value })}
              />
            </div>
            <p className="text-[10px] font-medium italic text-zinc-400">Launches the user&apos;s email client prefilled with target address, subject, and body text.</p>
          </div>
        )}

        {currentType === 'sms' && (
          <div className="flex flex-col gap-4" id="sms-form">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="sms-phone">Recipient Phone Number</label>
              <input
                type="tel"
                id="sms-phone"
                className="w-full text-sm mt-1 px-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                placeholder="+15550199"
                value={smsVal.phone}
                onChange={(e) => setSmsVal({ ...smsVal, phone: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="sms-message">Predefined Message</label>
              <textarea
                id="sms-message"
                className="w-full text-sm mt-1 px-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800 min-h-[70px]"
                placeholder="Send this message..."
                value={smsVal.message || ''}
                onChange={(e) => setSmsVal({ ...smsVal, message: e.target.value })}
              />
            </div>
            <p className="text-[10px] font-medium italic text-zinc-400">Pre-populates an SMS to the listed recipient on smartphones.</p>
          </div>
        )}

        {currentType === 'phone' && (
          <div className="flex flex-col gap-1" id="phone-form">
            <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="phone-number">Phone Number</label>
            <input
              type="tel"
              id="phone-number"
              className="w-full text-sm mt-1 px-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
              placeholder="+15550199"
              value={phoneVal.phone}
              onChange={(e) => setPhoneVal({ phone: e.target.value })}
            />
            <p className="text-[10px] font-medium italic text-zinc-400 mt-2">Dials the specified phone number when user triggers the scanned tag.</p>
          </div>
        )}

        {currentType === 'vcard' && (
          <div className="flex flex-col gap-4" id="vcard-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="vcard-firstname">First Name</label>
                <input
                  type="text"
                  id="vcard-firstname"
                  className="w-full text-sm mt-1 px-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                  placeholder="Jane"
                  value={vcardVal.firstName}
                  onChange={(e) => setVcardVal({ ...vcardVal, firstName: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="vcard-lastname">Last Name</label>
                <input
                  type="text"
                  id="vcard-lastname"
                  className="w-full text-sm mt-1 px-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                  placeholder="Doe"
                  value={vcardVal.lastName}
                  onChange={(e) => setVcardVal({ ...vcardVal, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="vcard-org">Organization / Company</label>
                <div className="relative flex items-center mt-1">
                  <Building className="absolute left-4 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    id="vcard-org"
                    className="w-full text-sm pl-11 pr-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                    placeholder="Acme Corp"
                    value={vcardVal.organization || ''}
                    onChange={(e) => setVcardVal({ ...vcardVal, organization: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-zinc-550" htmlFor="vcard-title">Job Title</label>
                <div className="relative flex items-center mt-1">
                  <Briefcase className="absolute left-4 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    id="vcard-title"
                    className="w-full text-sm pl-11 pr-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                    placeholder="Architect"
                    value={vcardVal.title || ''}
                    onChange={(e) => setVcardVal({ ...vcardVal, title: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-zinc-500" htmlFor="vcard-phone">Mobile Phone</label>
                <div className="relative flex items-center mt-1">
                  <Phone className="absolute left-4 w-4 h-4 text-zinc-400" />
                  <input
                    type="tel"
                    id="vcard-phone"
                    className="w-full text-sm pl-11 pr-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                    placeholder="+1 555-0199"
                    value={vcardVal.phone || ''}
                    onChange={(e) => setVcardVal({ ...vcardVal, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-zinc-550" htmlFor="vcard-email">Work Email</label>
                <div className="relative flex items-center mt-1">
                  <Mail className="absolute left-4 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    id="vcard-email"
                    className="w-full text-sm pl-11 pr-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                    placeholder="jane@corp.com"
                    value={vcardVal.email || ''}
                    onChange={(e) => setVcardVal({ ...vcardVal, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-zinc-505" htmlFor="vcard-url">Website URL</label>
                <div className="relative flex items-center mt-1">
                  <Globe className="absolute left-4 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    id="vcard-url"
                    className="w-full text-sm pl-11 pr-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                    placeholder="www.portfolio.com"
                    value={vcardVal.url || ''}
                    onChange={(e) => setVcardVal({ ...vcardVal, url: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-zinc-550" htmlFor="vcard-note">Remark / Quick Notes</label>
                <div className="relative flex items-center mt-1">
                  <Notebook className="absolute left-4 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    id="vcard-note"
                    className="w-full text-sm pl-11 pr-4 py-3 bg-zinc-50 border-2 border-zinc-250 focus:border-black rounded-xl font-medium outline-none transition-colors text-zinc-800"
                    placeholder="Met at Tech Summit"
                    value={vcardVal.note || ''}
                    onChange={(e) => setVcardVal({ ...vcardVal, note: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-zinc-200 pt-3 flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black tracking-wider text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Address Details
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  id="vcard-street"
                  className="w-full text-sm px-4 py-2.5 bg-zinc-50 border-2 border-zinc-200 focus:border-black rounded-xl font-medium outline-none"
                  placeholder="Street (e.g. 123 Tech Lane)"
                  value={vcardVal.street || ''}
                  onChange={(e) => setVcardVal({ ...vcardVal, street: e.target.value })}
                />
                <input
                  type="text"
                  id="vcard-city"
                  className="w-full text-sm px-4 py-2.5 bg-zinc-50 border-2 border-zinc-200 focus:border-black rounded-xl font-medium outline-none"
                  placeholder="City"
                  value={vcardVal.city || ''}
                  onChange={(e) => setVcardVal({ ...vcardVal, city: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                <input
                  type="text"
                  id="vcard-zip"
                  className="w-full text-sm px-4 py-2.5 bg-zinc-50 border-2 border-zinc-200 focus:border-black rounded-xl font-medium outline-none"
                  placeholder="ZIP / Postal Code"
                  value={vcardVal.zip || ''}
                  onChange={(e) => setVcardVal({ ...vcardVal, zip: e.target.value })}
                />
                <input
                  type="text"
                  id="vcard-country"
                  className="w-full text-sm px-4 py-2.5 bg-zinc-50 border-2 border-zinc-200 focus:border-black rounded-xl font-medium outline-none"
                  placeholder="Country"
                  value={vcardVal.country || ''}
                  onChange={(e) => setVcardVal({ ...vcardVal, country: e.target.value })}
                />
              </div>
            </div>

            <p className="text-[10px] font-medium italic text-zinc-400">Creates a digital business card that triggers the user&apos;s phone Contacts app to save raw details immediately.</p>
          </div>
        )}
      </div>
    </div>
  );
}
