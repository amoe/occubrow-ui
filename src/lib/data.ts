import { TreeNode } from '@/types';
import axios, { AxiosPromise } from 'axios';

const api = {
    getTree(root: string): AxiosPromise {
        return axios.get("/api/tree", { params: { root } });
    }
};

export default api;
