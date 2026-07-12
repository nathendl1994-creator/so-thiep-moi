/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Delete, Lock, Unlock, ArrowRight } from 'lucide-react';

interface PinLockScreenProps {
  correctPin: string;
  onSuccess: () => void;
  onCancel?: () => void;
  isSettingUp?: boolean;
  onSetPin?: (newPin: string) => void;
}

export default function PinLockScreen({
  correctPin,
  onSuccess,
  onCancel,
  isSettingUp = false,
  onSetPin
}: PinLockScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Nhập PIN mới, Step 2: Xác nhận PIN mới (dùng khi cài đặt)
  const [error, setError] = useState<string>('');

  const handleNumberClick = (num: number) => {
    if (error) setError('');
    
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      
      // Auto-submit for entry mode when 4 digits reached
      if (!isSettingUp && nextPin.length === 4) {
        if (nextPin === correctPin) {
          onSuccess();
        } else {
          setTimeout(() => {
            setError('Mã PIN không chính xác. Vui lòng thử lại.');
            setPin('');
          }, 300);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleAction = () => {
    if (isSettingUp) {
      if (pin.length < 4) {
        setError('Mã PIN phải dài đúng 4 chữ số.');
        return;
      }

      if (step === 1) {
        setConfirmPin(pin);
        setPin('');
        setStep(2);
      } else {
        if (pin === confirmPin) {
          if (onSetPin) {
            onSetPin(pin);
            onSuccess();
          }
        } else {
          setError('Mã PIN xác nhận không trùng khớp. Hãy làm lại.');
          setPin('');
          setConfirmPin('');
          setStep(1);
        }
      }
    }
  };

  const resetSetup = () => {
    setPin('');
    setConfirmPin('');
    setStep(1);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white p-6 select-none">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="mb-6 p-4 bg-slate-800 rounded-full text-rose-400 animate-pulse">
          {isSettingUp ? <Shield className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
        </div>

        <h1 className="text-xl font-bold tracking-tight mb-2 text-center">
          {isSettingUp 
            ? (step === 1 ? 'Thiết lập mã PIN' : 'Xác nhận mã PIN') 
            : 'Sổ Thiệp Mời - Đã Khóa'}
        </h1>
        <p className="text-xs text-slate-400 mb-8 text-center max-w-xs">
          {isSettingUp 
            ? (step === 1 ? 'Nhập 4 chữ số để bảo mật sổ thiệp mừng của bạn.' : 'Nhập lại mã PIN để chắc chắn bạn ghi nhớ đúng.')
            : 'Nhập mã PIN gồm 4 chữ số để truy cập dữ liệu của bạn.'}
        </p>

        {/* PIN Indicators */}
        <div className="flex justify-center space-x-6 mb-8">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                pin.length > index
                  ? 'bg-rose-500 border-rose-500 scale-125'
                  : 'border-slate-500 bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 text-sm font-medium text-rose-400 text-center animate-shake">
            {error}
          </div>
        )}

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 font-semibold text-2xl flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            >
              {num}
            </button>
          ))}
          
          {/* Back/Cancel or Reset */}
          {isSettingUp && step === 2 ? (
            <button
              onClick={resetSetup}
              className="text-xs text-slate-400 hover:text-white font-medium flex items-center justify-center cursor-pointer"
            >
              Làm lại
            </button>
          ) : onCancel ? (
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-white font-medium flex items-center justify-center cursor-pointer"
            >
              Hủy bỏ
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => handleNumberClick(0)}
            className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 font-semibold text-2xl flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            0
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-lg flex items-center justify-center transition-colors cursor-pointer"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Setup Action */}
        {isSettingUp && (
          <button
            onClick={handleAction}
            disabled={pin.length < 4}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all ${
              pin.length === 4
                ? 'bg-rose-500 hover:bg-rose-600 active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {step === 1 ? 'Tiếp tục' : 'Kích hoạt khóa'} <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
