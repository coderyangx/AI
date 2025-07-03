/// <reference types="vite/client" />

import {
  InputHTMLAttributes,
  ButtonHTMLAttributes,
  LabelHTMLAttributes,
  TextareaHTMLAttributes,
  SwitchHTMLAttributes,
} from 'react';

// UI组件类型声明
// declare module '@/components/ui/Input' {
//   interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
//     // 添加任何额外的属性
//   }

//   const Input: React.ForwardRefExoticComponent<InputProps>;
//   export default Input;
// }

// declare module '@/components/ui/Button' {
//   interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
//     variant?:
//       | 'default'
//       | 'destructive'
//       | 'outline'
//       | 'secondary'
//       | 'ghost'
//       | 'link';
//     size?: 'default' | 'sm' | 'lg' | 'icon';
//   }

//   const Button: React.ForwardRefExoticComponent<ButtonProps>;
//   export default Button;
// }

// declare module '@/components/ui/Avatar' {
//   interface AvatarProps {
//     src?: string;
//     alt?: string;
//     fallback?: React.ReactNode;
//     className?: string;
//   }

//   // export const Avatar: React.FC<AvatarProps>;
//   // export const AvatarImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>>;
//   // export const AvatarFallback: React.FC<React.HTMLAttributes<HTMLDivElement>>;
// }

// shadcn组件类型声明
declare module '@/components/shadcn/Button' {
  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
  }

  const Button: React.ForwardRefExoticComponent<ButtonProps>;
  export default Button;
}

declare module '@/components/shadcn/Input' {
  interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    // 添加任何额外的属性
  }

  const Input: React.ForwardRefExoticComponent<InputProps>;
  export default Input;
}

// declare module '@/components/shadcn/Textarea' {
//   interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
//     // 添加任何额外的属性
//   }

//   const Textarea: React.ForwardRefExoticComponent<TextareaProps>;
//   export default Textarea;
// }

declare module '@/components/shadcn/Switch' {
  interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {
    // 添加任何额外的属性
  }

  const Switch: React.ForwardRefExoticComponent<SwitchProps>;
  export default Switch;
}

declare module '@/components/shadcn/Label' {
  interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    // 添加任何额外的属性
  }

  const Label: React.ForwardRefExoticComponent<LabelProps>;
  export default Label;
}

declare module '@/components/shadcn/Avatar' {
  interface AvatarProps {
    src?: string;
    alt?: string;
    fallback?: React.ReactNode;
    className?: string;
  }

  // export const Avatar: React.FC<AvatarProps>;
  // export const AvatarImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>>;
  // export const AvatarFallback: React.FC<React.HTMLAttributes<HTMLDivElement>>;
}
