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
    addCompoundWidget(): void;
};


export interface TaxonomyRootDatum {
    uri: string;
    content: string;
}

export interface QuerySpec {
    taxonomyRef: string;
    selectedPath: string[];
}

export interface Sentence {
    uuid: string;
    content: string[];
}

export interface GraphViewComponent {
    name: string;
    maxDepth: number;
}

export interface CentralityDatum {
    node: string;
    centrality: number;
}

export interface HistoryDatum {
    token: string;
}
