import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      leftIcon,
      rightIcon,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('flex flex-col space-y-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={props.id}
            className='text-sm font-medium text-gray-700'
          >
            {label}
          </label>
        )}
        <div className='relative flex items-center'>
          {leftIcon && (
            <div className='absolute left-3 flex items-center pointer-events-none text-gray-500'>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
              'placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className='absolute right-3 flex items-center pointer-events-none text-gray-500'>
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className='text-xs text-red-500'>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
