import { TreeNode, QuerySpec } from '@/types';
import axios, { AxiosPromise } from 'axios';
import * as log from 'loglevel';

// data is a terrible name for this

const api = {
    getRandomRoot(): AxiosPromise {
        return axios.get("/api/random-root");
    },
    getMetrics(): AxiosPromise {
        return axios.get("/api/metrics");
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
    submitTokenQuery(token: string, query: string[], depthLimit: number): AxiosPromise {
        log.debug("i would submit query %o", query);
        return axios.get(
            "/api/query", {
                params: {
                    'root': token,
                    'filter': query,
                    'depth_limit': depthLimit
                }
            }
        );
    }
};

export default api;
