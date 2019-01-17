import { TreeNode, QuerySpec } from '@/types';
import axios, { AxiosPromise, AxiosError, AxiosResponse } from 'axios';
import * as log from 'loglevel';

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
        return axios.get("/api" + endpoint, { params }).then((r: any) => {
            this.loadingEnded();
            return r;
        }).catch((r: AxiosError) => {
            this.loadingEnded();
            this.errorReporter(r);
        });
    }

    getRandomRoot(): AxiosPromise {
        return this.makeApiCall("/random-root", {});
    }

    getMetrics(): AxiosPromise {
        return this.makeApiCall("/metrics", {});
    }

    getTaxonomy(root: string): AxiosPromise {
        return this.makeApiCall("/taxonomy", { root });
    }

    getTaxonomyRoots(): AxiosPromise {
        return this.makeApiCall("/taxonomy-roots", {});
    }

    getContexts(token: string): AxiosPromise {
        return this.makeApiCall("/contexts", { token });
    }

    submitTokenQuery(
        token: string, query: string[], depthLimit: number,
        cooccurrenceThreshold: number
    ): AxiosPromise {
        return this.makeApiCall(
            "/query", {
                'root': token, 'filter': query, 'depth_limit': depthLimit,
                'cooccurrence_threshold': cooccurrenceThreshold
            }
        );

    }

    getAllTokens(): AxiosPromise {
        return this.makeApiCall("/tokens", {});
    }

    searchTokens(substring: string): AxiosPromise {
        return this.makeApiCall("/tokens", { substring });
    }

    getCentralityStatistics(): AxiosPromise {
        return this.makeApiCall("/centrality", {});
    }
}
