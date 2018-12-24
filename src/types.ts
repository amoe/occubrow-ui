export interface TreeNode {
    children?: TreeNode[],
    id: string;
    taxon: number | null;
}
