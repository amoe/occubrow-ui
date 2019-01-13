import { TreeNode, QuerySpec } from '@/types';
import axios, { AxiosPromise } from 'axios';

// data is a terrible name for this

const api = {
    getRandomRoot(): AxiosPromise {
        return axios.get("/api/random-root");
    },
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
    getTaxonomyRoots(): AxiosPromise {
        return axios.get("/api/taxonomy-roots");
    },
    getContexts(token: string): AxiosPromise {
        return axios.get("/api/contexts", { params: { token } });
    },
    submitTokenQuery(token: string, query: string[]): AxiosPromise {
        console.log("i would submit query %o", query);
        return axios.get("/api/query", { params: { root: token, filter: query } })
    }
};

export default api;
