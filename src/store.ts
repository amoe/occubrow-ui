import Vue from 'vue';
import Vuex from 'vuex';
import { OccubrowUIState, HistoryDatum } from '@/types';
import { GraphViewModule } from 'occubrow-graph-view';
import { WidgetsModule } from 'amoe-butterworth-widgets';
import mc from '@/mutation-constants';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        rootHistory: ['keep'],
    } as OccubrowUIState,
    mutations: {
        [mc.SET_ROOT]: (state, newRoot: string) => {
            state.rootHistory.push(newRoot);
        },
    },
    actions: {},
    getters: {
        currentRoot(state, getters): string {
            const lastIndex = state.rootHistory.length - 1;
            return state.rootHistory[lastIndex]
        },
        rootHistoryTable(state, getters): HistoryDatum[] {
            return state.rootHistory.map(s => ({ token: s }));
        }
    },
    modules: {
        graphView: GraphViewModule,
        widgets: WidgetsModule
    },
});
