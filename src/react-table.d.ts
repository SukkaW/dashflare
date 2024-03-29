import '@tanstack/react-table';

declare module '@tanstack/table-core' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- d.ts
  interface ColumnMeta<TData extends RowData, TValue> {
    isFixed?: boolean
  }
}
