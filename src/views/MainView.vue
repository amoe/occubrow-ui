<template>
<div class="page">
  <widget-view :taxonomies="taxonomies" ref="widgetView"></widget-view>

  <button v-on:click="getSerializedQuery">Get serialized query</button>

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
import api from '@/lib/data';
import {TreeNode} from '@/types';
import {mapGetters} from 'vuex';
import mc from '@/mutation-constants';

import 'occubrow-graph-view/dist/occubrow-graph-view.css';
import 'amoe-butterworth-widgets/dist/amoe-butterworth-widgets.css';

export default Vue.extend({
    components: {GraphView, WidgetView},
    data() {
        return {
            textContentTemplate: "{{content}}",
            graphData: null as TreeNode | null,
            taxonomies: {} as any,
            width: 600,
            height: 600,
            depthLimit: 4
        };
    },
    created() {
        api.getTree(this.currentRoot, this.depthLimit).then(r => {
            this.graphData = r.data;
        });
        
        api.getTaxonomy('Theme').then(r => {
            console.log("loaded taxonomy %o", r.data);
            this.taxonomies['Theme'] = r.data;
        });

        api.getMetrics().then(r => {
            console.log("metric %o", r.data);
        });
    },
    methods: {
        handleNodeClicked(node: any) {   // it's actually a GVNode
            this.$store.commit(mc.SET_ROOT, node.data.content);
            api.getTree(this.currentRoot, this.depthLimit).then(r => {
                this.graphData = r.data;
            });
        },
        getSerializedQuery() {
            console.log("doing it");
            console.log("widget view is %o", this.$refs.widgetView);

            // Cast to any is a hack, we don't have the correct typing for
            // widgetView
            const query = this.$refs.widgetView as any;
            console.log("result was %o", JSON.stringify(query.getQuery(), null, 4));
        }
    },
    computed: {
        currentRoot(): string {
            return this.$store.getters.currentRoot;
        },
        isDataLoaded(): boolean {
            return this.graphData !== null;
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
