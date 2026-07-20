import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../../../utils/formatCurrency';

type PaymentMethod = 'existing' | 'new' | null;

interface NewCardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onPaymentComplete: () => void;
  total: number;
  onPay: () => Promise<void>;
}

const SAVED_CARD_LAST4 = '8233';
const LOGO_SRC = '/MercadoPuadeLogo1.png';

const emptyCard: NewCardData = { number: '', name: '', expiry: '', cvv: '' };

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isNewCardValid(card: NewCardData): boolean {
  const digits = card.number.replace(/\D/g, '');
  const expiryDigits = card.expiry.replace(/\D/g, '');
  return (
    digits.length === 16 &&
    card.name.trim().length > 0 &&
    expiryDigits.length === 4 &&
    card.cvv.length >= 3
  );
}

export default function PaymentModal({ isOpen, onCancel, onPaymentComplete, total, onPay }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [newCard, setNewCard] = useState<NewCardData>(emptyCard);
  const [paying, setPaying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const canPay = method === 'existing' || (method === 'new' && isNewCardValid(newCard));
  const isBusy = paying || processing;

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  function resetState() {
    setMethod(null);
    setNewCard(emptyCard);
    setPaying(false);
    setProcessing(false);
    setError('');
  }

  function handleCancel() {
    if (isBusy) return;
    resetState();
    onCancel();
  }

  async function handlePay() {
    if (!canPay || isBusy) return;
    setPaying(true);
    setError('');
    try {
      await onPay();
      setProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      resetState();
      onPaymentComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error en el procesamiento del pago. Por favor, intentá nuevamente.');
      setPaying(false);
    }
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5">
      <div
        className="absolute inset-0 bg-[#1a1a2e]/70 backdrop-blur-[2px]"
        style={{ animation: 'mpFadeIn 200ms ease-out' }}
        onClick={isBusy ? undefined : handleCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pago con MercadoPago"
        className="relative flex flex-col w-[94vw] h-[90vh] max-w-3xl bg-[#EDEDED] rounded-md shadow-2xl overflow-hidden"
        style={{ animation: 'mpSlideUp 250ms ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {error && (
          <div className="shrink-0 flex items-center gap-2.5 px-5 sm:px-8 py-3 bg-[#FFF5F5] border-b border-[#F23D4F]/25 text-[#F23D4F]">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm leading-snug">{error}</p>
          </div>
        )}

        <header className="shrink-0 flex items-center justify-between px-5 sm:px-8 py-4 bg-white border-b border-black/8">
          <img
            src={LOGO_SRC}
            alt="MercadoPago"
            className="h-9 sm:h-11 w-auto object-contain"
          />
          <button
            type="button"
            onClick={handleCancel}
            disabled={isBusy}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#666] hover:bg-[#EDEDED] transition-colors disabled:opacity-40"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6">
          <div className="bg-white rounded-sm shadow-sm px-5 py-4 mb-5">
            <p className="text-xs text-[#999] mb-1">Vas a pagar</p>
            <p className="text-2xl sm:text-3xl font-normal text-[#333] tracking-tight">
              {formatCurrency(total)}
            </p>
          </div>

          <p className="text-[15px] text-[#333] mb-3 font-medium">¿Cómo querés pagar?</p>

          <div className="bg-white rounded-sm shadow-sm overflow-hidden mb-4">
            <PaymentOption
              selected={method === 'existing'}
              disabled={isBusy}
              onClick={() => setMethod('existing')}
              icon={<VisaBadge />}
              title="Tarjeta guardada"
              subtitle={`Visa terminada en ${SAVED_CARD_LAST4}`}
            />
            <div className="border-t border-[#EDEDED]" />
            <PaymentOption
              selected={method === 'new'}
              disabled={isBusy}
              onClick={() => setMethod('new')}
              icon={<NewCardBadge />}
              title="Tarjeta de crédito o débito"
              subtitle="Ingresá los datos de tu tarjeta"
            />
          </div>

          {method === 'new' && (
            <div className="bg-white rounded-sm shadow-sm p-5 flex flex-col gap-4 mb-4">
              <CardField
                label="Número de tarjeta"
                value={newCard.number}
                onChange={(v) => setNewCard((c) => ({ ...c, number: formatCardNumber(v) }))}
                placeholder="1234 5678 9012 3456"
                disabled={isBusy}
              />
              <CardField
                label="Nombre del titular"
                value={newCard.name}
                onChange={(v) => setNewCard((c) => ({ ...c, name: v }))}
                placeholder="Como figura en la tarjeta"
                disabled={isBusy}
              />
              <div className="grid grid-cols-2 gap-4">
                <CardField
                  label="Vencimiento"
                  value={newCard.expiry}
                  onChange={(v) => setNewCard((c) => ({ ...c, expiry: formatExpiry(v) }))}
                  placeholder="MM/AA"
                  disabled={isBusy}
                />
                <CardField
                  label="Código de seguridad"
                  value={newCard.cvv}
                  onChange={(v) => setNewCard((c) => ({ ...c, cvv: v.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="Ej.: 123"
                  disabled={isBusy}
                />
              </div>
            </div>
          )}
        </div>

        <footer className="shrink-0 flex gap-3 px-5 sm:px-8 py-4 bg-white border-t border-black/8">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isBusy}
            className="flex-1 h-12 rounded-sm border border-[#009EE3] text-[#009EE3] text-[15px] font-medium hover:bg-[#009EE3]/5 transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={!canPay || isBusy}
            className="flex-1 h-12 rounded-sm bg-[#009EE3] text-white text-[15px] font-medium hover:bg-[#007EB5] transition-colors disabled:bg-[#CCC] disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {paying && !processing && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            Pagar
          </button>
        </footer>

        {isBusy && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/85">
            <div className="w-14 h-14 rounded-full border-4 border-[#009EE3]/20 border-t-[#009EE3] animate-spin" />
            <p className="text-[15px] text-[#333]">
              {processing ? 'Procesando tu pago...' : 'Confirmando...'}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes mpFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes mpSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body,
  );
}

interface PaymentOptionProps {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

function PaymentOption({ selected, disabled, onClick, icon, title, subtitle }: PaymentOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'w-full flex items-center gap-4 px-5 py-4 text-left transition-colors',
        selected ? 'bg-[#009EE3]/6' : 'hover:bg-[#F7F7F7]',
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {icon}
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] text-[#333]">{title}</span>
        <span className="block text-xs text-[#999] mt-0.5">{subtitle}</span>
      </span>
      <MpRadio selected={selected} />
    </button>
  );
}

function MpRadio({ selected }: { selected: boolean }) {
  return (
    <span
      className={[
        'w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0',
        selected ? 'border-[#009EE3]' : 'border-[#CCC]',
      ].join(' ')}
    >
      {selected && <span className="w-3 h-3 rounded-full bg-[#009EE3]" />}
    </span>
  );
}

function VisaBadge() {
  return (
    <span className="w-10 h-7 rounded bg-[#1A1F71] flex items-center justify-center shrink-0">
      <span className="text-[9px] font-bold text-white tracking-wider italic">VISA</span>
    </span>
  );
}

function NewCardBadge() {
  return (
    <span className="w-10 h-7 rounded bg-[#EDEDED] flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    </span>
  );
}

interface CardFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function CardField({ label, value, onChange, placeholder, disabled }: CardFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-[#666]">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-11 rounded-sm border border-[#CCC] bg-white text-[15px] text-[#333] placeholder:text-[#BBB] px-3 outline-none transition-colors focus:border-[#009EE3] disabled:opacity-60"
      />
    </div>
  );
}
