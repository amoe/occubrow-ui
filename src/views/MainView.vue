<template>
<div class="page">
  <el-header>
    <p>Something that belongs in the header</p>
  </el-header>
  
  <widget-view :taxonomies="taxonomies" ref="widgetView"></widget-view>

  <el-main>
    <svg id="svg-frame" :width="width" :height="height">
      <graph-view v-if="isDataLoaded"
                  v-on:node-clicked="handleNodeClicked"
                  :graph-data="graphData"
                  :width="width"
                  :height="height"
                  :x-margin="162"
                  :y-margin="128"
                  :depth-offset="120"
                  :text-offset="22"
                  :text-content-template="textContentTemplate"
                  :breadth="360"></graph-view>
    </svg>
  </el-main>

  <el-footer>
    AGPL 2019  {{currentRoot}}
  </el-footer>
</div>
</template>

<script lang="ts">
    import Vue from 'vue';
import {GraphView} from 'occubrow-graph-view';
import {WidgetView} from 'amoe-butterworth-widgets';
import TreeModel from 'tree-model';
import {mapGetters} from 'vuex';
import mc from '@/mutation-constants';
import api from '@/lib/data';
import {TreeNode, WidgetViewComponent, TaxonomyRootDatum, QuerySpec} from '@/types';
import {isWidgetViewComponent} from '@/type-guards';
import {last} from '@/util';
import {debounce} from 'lodash';

import 'occubrow-graph-view/dist/occubrow-graph-view.css';
import 'amoe-butterworth-widgets/dist/amoe-butterworth-widgets.css';


function processQuery(query: QuerySpec[] ): string[] {
    return query.map(s => last(s.selectedPath));
}

const QUERY_DEBOUNCE_TIMEOUT = 10000;

export default Vue.extend({
    components: {GraphView, WidgetView},
    data() {
        return {
            textContentTemplate: "{{content}}",
            graphData: null as TreeNode | null,
            taxonomies: {} as any,
            width: 600,
            height: 600,
            depthLimit: 2,
            useRandomRoot: false
        };
    },
    created() {
        if (this.useRandomRoot) {
            api.getRandomRoot().then(r => api.getTree(r.data, this.depthLimit)).then(r => {
                this.graphData = r.data;
            })
        } else {
            api.getTree(this.currentRoot, this.depthLimit).then(r => {
                this.graphData = r.data;
            });
        }
        
        // We obviously don't want to ALWAYS apply the filter.  So the best option
        // would be to be able to register on some sort of getter in the module.
        
        api.getTaxonomyRoots().then(r => {
            const taxonomyList: TaxonomyRootDatum[] = r.data;
            
            for (let t of taxonomyList) {
                const taxonomyName = t.content;
                
                api.getTaxonomy(taxonomyName).then(r => {
                    this.taxonomies[taxonomyName] = r.data;
                });
            }
        });
        
        api.getMetrics().then(r => {
            console.log("metric %o", r.data);
        });
    },
    mounted() {
        this.widgetView.addCompoundWidget();
    },
    methods: {
        respondToQueryNotDebounced() {
            console.log("responding to query");

            api.submitTokenQuery(
                this.currentRoot, processQuery(this.serializedQuery)
            ).then(r => {
                this.graphData = r.data;
            });
        },
        handleNodeClicked(node: any) {   // it's actually a GVNode
            this.$store.commit(mc.SET_ROOT, node.data.content);
            api.getTree(this.currentRoot, this.depthLimit).then(r => {
                this.graphData = r.data;
            });
        },
    },
    watch: {
        serializedQuery(newVal, oldVal) {
            console.log("inside serialized query watcher");
            this.respondToQueryNotDebounced();
        }
    },
    computed: {
        serializedQuery(): QuerySpec[] {
            return this.$store.getters.serializedQuery;
        },
        currentRoot(): string {
            return this.$store.getters.currentRoot;
        },
        isDataLoaded(): boolean {
            return this.graphData !== null;
        },
        widgetView(): WidgetViewComponent {
            const view: any = this.$refs.widgetView;
            if (!isWidgetViewComponent(view)) throw new Error("can't happen");
            const widgetView: WidgetViewComponent = view;
            return widgetView;
        }
    }
});
</script>

<style lang="less">
@font-face {
    font-family: 'Oxygen';
}

body {
    background-color: #fdfdfd;
    font-family: 'Oxygen', sans-serif;
}

/* The svg frame is 'pinned', taken outside of the flow layout, and occupies 
   the entire page. */
#svg-frame {
    position: absolute;
    top: 0px;
    right: 0px;
    left: 0px;
    bottom: 0px;
    width: 100vw;
    height: 100vh;

    /* It's gotta have such a z-index, otherwise it will block HTML items from
       being interacted with. */
    z-index: -1;
}
</style>
