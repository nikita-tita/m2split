import React from 'react';
import { clsx } from 'clsx';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('min-w-full divide-y divide-gray-200', className)}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<TableProps> = ({ children }) => {
  return (
    <thead className="bg-gray-50">
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableProps> = ({ children }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableProps & { onClick?: () => void }> = ({ children, onClick, className }) => {
  return (
    <tr
      className={clsx(
        onClick && 'cursor-pointer hover:bg-gray-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  header?: boolean;
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ children, header, className }) => {
  if (header) {
    return (
      <th className={clsx('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', className)}>
        {children}
      </th>
    );
  }

  return (
    <td className={clsx('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)}>
      {children}
    </td>
  );
};
