export interface RenderObject {
    component: 'button' | 'a' | 'span' | 'badge' | 'html';
    props: Record<string, any>;
}

export interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string | 'min';
    align?: 'left' | 'center' | 'right';
    render?: (row: any) => RenderObject | RenderObject[] | string;
    tooltip?: string;
}

export interface TableAction {
    label: string;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
    onClick: (row: any) => void;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
    column: string | null;
    direction: SortDirection;
}
