import React from 'react';
import { cn } from '@/lib/cn';
// Mock implementation if utils is not present yet
const getAvatarColor = (name: string) => {
  const colors = ['bg-[#4ADE80]', 'bg-[#60A5FA]', 'bg-[#FACC15]', 'bg-[#F87171]'];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export const Avatar = ({ src, name, size = 'md', className }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        sizes[size],
        !src && getAvatarColor(name),
        !src && 'text-[#0E1113] font-medium',
        className
      )}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
};

export interface AvatarGroupProps {
  avatars: { src?: string; name: string }[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const AvatarGroup = ({ avatars, max = 3, size = 'md' }: AvatarGroupProps) => {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleAvatars.map((avatar, i) => (
        <div key={i} className="ring-2 ring-[#0E1113] rounded-full">
           <Avatar src={avatar.src} name={avatar.name} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div className={cn(
          'flex items-center justify-center rounded-full bg-[#1B2024] ring-2 ring-[#0E1113] text-[#F5F7F8] font-medium',
          sizes[size]
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
};
