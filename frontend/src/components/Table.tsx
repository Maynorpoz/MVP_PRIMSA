import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Table({ className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-md border border-paper-200 bg-paper-50">
      <table className={cn('w-full border-collapse', className)} {...rest} />
    </div>
  )
}

export function TableHead({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...rest} />
}

export function TableBody({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...rest} />
}

export function TableRow({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-t border-paper-200 first:border-t-0', className)} {...rest} />
}

export function TableHeaderCell({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-400',
        className,
      )}
      {...rest}
    />
  )
}

export function TableCell({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3.5 text-sm', className)} {...rest} />
}
