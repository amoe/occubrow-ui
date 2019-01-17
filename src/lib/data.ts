import { TreeNode, QuerySpec } from '@/types';
import axios, { AxiosPromise, AxiosError, AxiosResponse } from 'axios';
import * as log from 'loglevel';

// data is a terrible name for this


export class DataGateway {
    loadingStarted: Function;
    loadingEnded: Function;
    errorReporter: Function;

    constructor(
        loadingStarted: Function, loadingEnded: Function, errorReporter: Function
    ) {
        this.loadingStarted = loadingStarted;
        this.loadingEnded = loadingEnded;
        this.errorReporter = errorReporter;
    }

    makeApiCall(endpoint: string, params: any): AxiosPromise {
        this.loadingStarted();
        return axios.get("/api" + endpoint, params).then((r: any) => {
            this.loadingEnded();
            return r;
        }).catch((r: AxiosError) => {
            this.loadingEnded();
            this.errorReporter(r);
        });
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
        return this.makeApiCall(
            "/query", {
                params: {
                    'root': token, 'filter': query, 'depth_limit': depthLimit
                }
            }
        );

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
