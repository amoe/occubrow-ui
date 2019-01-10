export interface TreeNode {
    children?: TreeNode[],
    id: string;
    taxon: number | null;
}

export interface OccubrowUIState {
    rootHistory: string[];
}

export interface WidgetViewComponent {
    getQuery(): any;
};
