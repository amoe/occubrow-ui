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


export interface TaxonomyRootDatum {
    uri: string;
    content: string;
}

export interface QuerySpec {
    taxonomyRef: string;
    selectedPath: string[];
}
