import Vue from 'vue';
import Vuex from 'vuex';
import { GraphViewModule } from 'occubrow-graph-view';
import { WidgetsModule } from 'amoe-butterworth-widgets';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {

    },
    mutations: {

    },
    actions: {

    },
    modules: {
        graphView: GraphViewModule,
        widgets: WidgetsModule
    }
});
