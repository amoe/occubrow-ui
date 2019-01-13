<template>
<div class="page">
    <widget-view :taxonomies="taxonomies" ref="widgetView"></widget-view>

  <el-main>
    <el-popover placement="bottom"
                :title="popoverTitle"
                width="200"
                trigger="manual"
                v-model="popoverVisible">
      <div v-for="sentence in displayedContexts">
        <span v-for="token in sentence.content">
          <span v-on:click="recenter(token)"
                class="context-token">{{token}}</span>&nbsp;
        </span>
      </div>
    </el-popover>

    <svg id="svg-frame" :width="width * 2" :height="height">
      <graph-view v-if="isDataLoaded"
                  v-on:node-clicked="handleNodeClicked"
                  :graph-data="graphData"
                  :width="width"
                  :height="height"
                  :x-margin="162"
                  :y-margin="0"
                  :depth-offset="120"
                  :text-offset="22"
                  :text-content-template="textContentTemplate"
                  :breadth="360"
                  ref="graphView"></graph-view>
    </svg>
  </el-main>

  <el-footer>
    <div v-if="metrics">
      <span>Order: {{metrics.order}}.</span>
      <span>Size: {{metrics.size}}.</span>
      <span>Depth limit: {{depthLimit}}.</span>
      <!-- can't list max depth yet due to some communication problems -->
    </div>
    AGPL 2019
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
import {
    TreeNode, WidgetViewComponent, TaxonomyRootDatum, QuerySpec, Sentence,
    GraphViewComponent
} from '@/types';
import {isWidgetViewComponent, isGraphViewComponent} from '@/type-guards';
import {last} from '@/util';
import {debounce} from 'lodash';
import * as log from 'loglevel';

import 'occubrow-graph-view/dist/occubrow-graph-view.css';
import 'amoe-butterworth-widgets/dist/amoe-butterworth-widgets.css';

function processQuery(query: QuerySpec[] ): string[] {
    return query.map(s => last(s.selectedPath));
}

const QUERY_DEBOUNCE_TIMEOUT = 10000;

const foo = {"Occupation":{"children":[{"content":"Transport","id":4105,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Transport/1"},{"content":"Manage","id":4101,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Manage/1"},{"content":"Drive","id":4102,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Drive/1"},{"content":"Serve","id":4103,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Serve/1"}],"content":"Occupation","id":4104,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Occupation/1"},"Place":{"children":[{"content":"Pub","id":4107,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Pub/1"},{"children":[{"content":"Clothes shop","id":4106,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Clothes shop/1"}],"content":"Shop","id":4109,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Shop/1"}],"content":"Place","id":4108,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Place/1"},"Object":{"children":[{"content":"Clothes","id":4112,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Clothes/1"},{"content":"Alcoholic drink","id":4113,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Alcoholic drink/1"},{"content":"Vehicle","id":4110,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Vehicle/1"},{"content":"Bricks","id":4111,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Bricks/1"}],"content":"Object","id":4114,"label":"Taxon","uri":"tag:solasistim.net,2018-12-28:occubrow/Object/1"}};


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
            useRandomRoot: true,
            metrics: null as any,   // FIXME: type
            popoverVisible: false,
            popoverTitle: null as (string | null),
            displayedContexts: [] as Sentence[],
        };
    },
    watch: {
        serializedQuery(newVal, oldVal) {
            log.debug("inside serialized query watcher");
            this.respondToQueryNotDebounced(this.currentRoot, this.serializedQuery, this.depthLimit);
        },
        currentRoot(newVal: string, oldVal: string) {
            this.respondToQueryNotDebounced(this.currentRoot, this.serializedQuery, this.depthLimit);
        }
    },
    created() {
        if (this.useRandomRoot) {
            api.getRandomRoot().then(r => this.recenter(r.data));
        }
        
        // We obviously don't want to ALWAYS apply the filter.  So the best option
        // would be to be able to register on some sort of getter in the module.
        
        api.getTaxonomyRoots().then(r => {
            const taxonomyList: TaxonomyRootDatum[] = r.data;
            
            for (let t of taxonomyList) {
                const taxonomyName = t.content;
                
                api.getTaxonomy(taxonomyName).then(r => {
                    Vue.set(this.taxonomies, taxonomyName, r.data);
                });
            }
        });
        
        api.getMetrics().then(r => {
            this.metrics = r.data;
        });
    },
    mounted() {
        this.widgetView.addCompoundWidget();
        // this.widgetView.addCompoundWidget();
        // this.widgetView.addCompoundWidget();
        // this.widgetView.addCompoundWidget();
        // this.widgetView.addCompoundWidget();
        // this.widgetView.addCompoundWidget();
        // this.widgetView.addCompoundWidget();
        // this.widgetView.addCompoundWidget();
    },
    methods: {
        recenter(token: string) {
            this.$store.commit(mc.SET_ROOT, token);
        },
        respondToQueryNotDebounced(currentRoot: string, query: QuerySpec[], depthLimit: number) {
            log.debug("responding to query");

            api.submitTokenQuery(
                this.currentRoot, 
                processQuery(this.serializedQuery),
                this.depthLimit
            ).then(r => {
                this.graphData = r.data;
            });
        },
        handleNodeClicked(node: any) {   // it's actually a GVNode
            this.$store.commit(mc.SET_ROOT, node.data.content);

            this.popoverVisible = !this.popoverVisible;
            this.popoverTitle = node.data.content;

            api.getContexts(node.data.content).then(r => {
                this.displayedContexts = r.data;
            });
        },
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

#svg-frame {
    /* This is used for accepting drag/drop between widget and graph. */
    /* The svg frame is 'pinned', taken outside of the flow layout, and occupies 
       the entire page. */
    /*
    position: absolute;
    top: 0px;
    right: 0px;
    left: 0px;
    bottom: 0px;
    width: 100vw;
    height: 100vh;
    */

    /* It's gotta have such a z-index, otherwise it will block HTML items from
       being interacted with. */
    /*
    z-index: -1;
    */
}

.main-view-container {
    // stolen from tailwind shadow-md
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.08);
}

.context-token:hover {
    color: hsl(22.4,100%,50%);
    cursor: pointer;
}
</style>
