import * as React from 'react';
import { Toaster as Sonner, toast as sonnerToast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-[#1A1A1A] group-[.toaster]:border-[#6B7280]/20 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-[#6B7280]',
          actionButton:
            'group-[.toast]:bg-[#F2B705] group-[.toast]:text-[#1A1A1A]',
          cancelButton:
            'group-[.toast]:bg-[#F5F7FA] group-[.toast]:text-[#1A1A1A]',
          error:
            'group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200',
          success:
            'group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200',
          warning:
            'group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-900 group-[.toaster]:border-yellow-200',
          info:
            'group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200',
        },
      }}
      {...props}
    />
  );
};

const toast = sonnerToast;

export { Toaster, toast };
