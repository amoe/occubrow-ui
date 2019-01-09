import { TreeNode } from '@/types';
import axios, { AxiosPromise } from 'axios';

const api = {
    getMetrics(): AxiosPromise {
        return axios.get("/api/metrics");
    },
    getTree(root: string, depthLimit: number): AxiosPromise {
        return axios.get(
            "/api/tree", {
                params: {
                    'root': root,
                    'depth_limit': depthLimit
                }
            });
    },
    getTaxonomy(root: string): AxiosPromise {
        return axios.get("/api/taxonomy", { params: { root } });
    },
};

export default api;
