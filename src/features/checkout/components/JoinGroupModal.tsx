/**
 * Wizard de 3 pasos para unirse a un grupo de compra.
 * Paso 1: seleccionar cantidad y ver el total a pagar.
 * Paso 2: confirmar compra — abre el modal de pago.
 * Paso 3: éxito — compra confirmada.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { Group } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { joinGroup } from '../services';
import PaymentModal from './PaymentModal';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  existingQuantity?: number;
  onSuccess?: () => void;
}

type Step = 1 | 2 | 3;

export default function JoinGroupModal({ isOpen, onClose, group, existingQuantity, onSuccess }: JoinGroupModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [quantity, setQuantity] = useState(1);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentCancelledMessage, setPaymentCancelledMessage] = useState('');
  // Snapshot of existingQuantity taken when the modal opens. State is not
  // overwritten by prop changes, so onSuccess→refetch can't flip isAdding
  // mid-session and show wrong "ya tenías X" counts on step 3.
  const [frozenExistingQty, setFrozenExistingQty] = useState(existingQuantity ?? 0);

  const isAdding = frozenExistingQty > 0;
  const maxQty = Math.max(1, group.remainingUnits);
  const total = quantity * group.wholesalePrice;

  useEffect(() => {
    if (step === 3) onSuccess?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep(1);
      setQuantity(1);
      setPaymentCancelledMessage('');
      setPaymentModalOpen(false);
      setFrozenExistingQty(existingQuantity ?? 0);
    }, 300);
  }

  function handleOpenPayment() {
    setPaymentCancelledMessage('');
    setPaymentModalOpen(true);
  }

  function handlePaymentCancel() {
    setPaymentModalOpen(false);
    setPaymentCancelledMessage('Ocurrió un error en el procesamiento del pago. Por favor, intentá nuevamente.');
  }

  function handlePaymentComplete() {
    setPaymentModalOpen(false);
  }

  async function handlePayment() {
    if (!user) return;
    await joinGroup(group.id, quantity);
    setStep(3);
  }

  const titles: Record<Step, string> = {
    1: isAdding ? 'Agregar más unidades' : 'Unirme al grupo',
    2: 'Confirmá tu compra',
    3: isAdding ? '¡Unidades agregadas!' : '¡Tu compra está confirmada!',
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titles[step]} size="md">
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <p className="font-display font-semibold text-ink">¿Cuántas unidades querés reservar?</p>

          {/* Quantity input */}
          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-lg bg-ink-faint/40 hover:bg-ink-faint/70 font-display font-bold text-ink text-lg flex items-center justify-center transition-colors"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v)) setQuantity(Math.min(maxQty, Math.max(1, v)));
              }}
              className="w-20 text-center border border-ink-faint/60 rounded-xl py-2 font-display font-semibold text-ink text-lg focus:outline-none focus:ring-2 focus:ring-brand-teal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              className="w-9 h-9 rounded-lg bg-ink-faint/40 hover:bg-ink-faint/70 font-display font-bold text-ink text-lg flex items-center justify-center transition-colors"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            >
              +
            </button>
            <span className="font-body text-sm text-ink-muted">de {maxQty} disponibles</span>
          </div>

          {/* Live summary */}
          <div className="bg-surface rounded-xl p-4 flex flex-col gap-2 border border-ink-faint/30">
            <SummaryRow label="Precio por unidad" value={formatCurrency(group.wholesalePrice)} />
            <div className="border-t border-ink-faint/30 my-1" />
            <SummaryRow label="Total a pagar" value={formatCurrency(total)} highlight />
          </div>

          {isAdding && (
            <p className="font-body text-sm text-ink-muted text-center">
              Ya tenés <span className="font-semibold text-ink">{existingQuantity} unidades</span> reservadas. Vas a sumar <span className="font-semibold text-ink">{quantity}</span> más → total <span className="font-semibold text-brand-teal">{(existingQuantity ?? 0) + quantity} unidades</span>.
            </p>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={quantity < 1}
            onClick={() => setStep(2)}
          >
            Continuar
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          {paymentCancelledMessage && (
            <div className="flex items-center gap-2.5 text-sm text-status-cancelled font-body bg-status-cancelled/10 rounded-xl px-4 py-2.5">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="leading-snug">{paymentCancelledMessage}</p>
            </div>
          )}

          <div className="bg-surface rounded-xl p-4 flex flex-col gap-2 border border-ink-faint/30">
            <p className="font-display font-semibold text-ink text-sm mb-1">{group.title}</p>
            <SummaryRow label="Cantidad" value={`${quantity} unidades`} />
            <SummaryRow label="Precio unitario" value={formatCurrency(group.wholesalePrice)} />
            <div className="border-t border-ink-faint/30 my-1" />
            <SummaryRow label="Total a pagar" value={formatCurrency(total)} highlight />
          </div>

          <div className="flex items-start gap-3 bg-brand-teal/8 border border-brand-teal/25 rounded-xl p-4">
            <svg className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="font-body text-sm text-ink-muted leading-relaxed">
              Pagás el total ahora. Si el grupo no alcanza el mínimo antes de que expire el tiempo, te devolvemos el{' '}
              <span className="font-semibold text-ink">100% de tu dinero de forma automática e inmediata</span>.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" size="md" onClick={() => setStep(1)} disabled={paymentModalOpen}>
              Volver
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handleOpenPayment}
            >
              Confirmar y Pagar
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <div className="w-20 h-20 rounded-full bg-brand-teal/15 flex items-center justify-center">
            <svg className="w-10 h-10 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-display font-bold text-ink text-xl">
              {isAdding ? '¡Unidades agregadas!' : '¡Tu compra está confirmada!'}
            </p>
            <p className="font-body text-sm text-ink-muted leading-relaxed max-w-xs">
              {isAdding
                ? <>Sumaste <span className="font-semibold text-ink">{quantity} unidades</span> más. Ahora tenés <span className="font-semibold text-brand-teal">{(existingQuantity ?? 0) + quantity} unidades</span> reservadas en este grupo.</>
                : 'Tu pago fue procesado. Te avisaremos cuando el grupo se complete y se coordine la entrega. Podés ver el estado en Mi Cuenta.'
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => { handleClose(); navigate('/mi-cuenta'); }}
            >
              Ver Mi Cuenta
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => { handleClose(); navigate('/explorar'); }}
            >
              Seguir Explorando
            </Button>
          </div>
        </div>
      )}
      <PaymentModal
        isOpen={paymentModalOpen}
        onCancel={handlePaymentCancel}
        onPaymentComplete={handlePaymentComplete}
        total={total}
        onPay={handlePayment}
      />
    </Modal>
  );
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

interface SummaryRowProps {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}

function SummaryRow({ label, value, bold, highlight }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className={`font-body text-sm ${highlight ? 'text-ink font-semibold' : 'text-ink-muted'}`}>
        {label}
      </span>
      <span className={`font-display text-sm ${bold ? 'font-bold text-ink text-base' : highlight ? 'font-bold text-brand-teal text-base' : 'text-ink'}`}>
        {value}
      </span>
    </div>
  );
}
