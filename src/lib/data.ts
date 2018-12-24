import { TreeNode } from '@/types';

const FAKE_API_DATA = {
    "children": [
        {
            "children": [
                {
                    "id": "St.",
                    "taxon": null
                },
                {
                    "id": "waggon",
                    "taxon": null
                }
            ],
            "id": "the",
            "taxon": null
        },
        {
            "children": [
                {
                    "id": "shop",
                    "taxon": null
                }
            ],
            "id": "a",
            "taxon": null
        }
    ],
    "id": "keep",
    "taxon": null
};

const api = {
    getTree(): TreeNode {
        return FAKE_API_DATA;
    }
};

export default api;
