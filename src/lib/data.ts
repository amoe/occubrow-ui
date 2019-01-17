import { TreeNode, QuerySpec } from '@/types';
import axios, { AxiosPromise } from 'axios';
import * as log from 'loglevel';

// data is a terrible name for this

export class DataGateway {
    // loadingStarted: Function;
    // loadingEnded: Function;
    errorReporter: Function;

    constructor(errorReporter: Function) {
        this.errorReporter = errorReporter;
    }

    getRandomRoot(): AxiosPromise {
        return axios.get("/api/random-root").catch(r => this.errorReporter(r));
    }

    getMetrics(): AxiosPromise {
        return axios.get("/api/metrics").catch(r => this.errorReporter(r));
    }

    getTaxonomy(root: string): AxiosPromise {
        return axios.get("/api/taxonomy", { params: { root } }).catch(r => this.errorReporter(r));
    }

    getTaxonomyRoots(): AxiosPromise {
        return axios.get("/api/taxonomy-roots").catch(r => this.errorReporter(r));
    }

    getContexts(token: string): AxiosPromise {
        return axios.get("/api/contexts", { params: { token } }).catch(r => this.errorReporter(r));
    }

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
        ).catch(r => this.errorReporter(r));
    }

    getAllTokens(): AxiosPromise {
        return axios.get("/api/tokens", {}).catch(r => this.errorReporter(r));
    }

    searchTokens(substring: string): AxiosPromise {
        return axios.get("/api/tokens", { params: { substring } }).catch(r => this.errorReporter(r));
    }

    getCentralityStatistics(): AxiosPromise {
        return axios.get("/api/centrality", {}).catch(r => this.errorReporter(r));
    }
}
