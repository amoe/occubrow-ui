<template>
<div class="page">
  <span v-loading.fullscreen.lock="fullscreenLoading"></span>

  <widget-view :taxonomies="taxonomies" ref="widgetView"></widget-view>
  
  <el-row>
    <el-col :span="5">
      <div class="left-panel">
        <div>
          <span class="label">Root token</span>
          <el-select v-model="chosenRoot"
                     id="root-selector"
                     filterable
                     remote
                     placeholder="Search tokens..."
                     :remote-method="remoteMethod"
                     :loading="loading">
            <el-option v-for="item in filteredTokenSelection"
                       :key="item"
                       :label="item"
                       :value="item">
            </el-option>
          </el-select>
        </div>
        
        <div class="depth-limit">
          <span class="label">Depth limit</span>
          
          <el-input-number v-model="depthLimit"
                           v-on:change="depthChanged"
                           label="Depth limit"
                           class="what"
                           :min="1"
                           :max="10"></el-input-number>
        </div>
        
        <div v-if="metrics" class="metrics">
          <span>Graph order: {{metrics.order}}.</span>&nbsp;
          <span>Size: {{metrics.size}}.</span>&nbsp;
        </div>
        
        <el-table :data="roundedCentralityData"
                  v-on:cell-click="handleCentralityClick"> 
          <el-table-column prop="node" class-name="clickable-table-datum"
                           label="Token"></el-table-column>
          <el-table-column prop="centrality" label="Centrality"></el-table-column>
        </el-table>
        
        
        <div class="history-list">
          <span v-for="datum in rootHistoryTable">
            <chevrons-right/>
            <span class="clickable-history-datum" v-on:click="recenter(datum.token)">{{datum.token}}</span>
          </span> 
        </div>
      </div>
    </el-col>
    
    <el-col :span="11" :push="2">
      <el-popover placement="bottom"
                  :title="popoverTitle"
                  trigger="manual"
                  v-model="popoverVisible">
        <div class="context-menu-popover">
          Context Menu
        </div>
      </el-popover>
      
      <svg id="svg-frame" :width="800" :height="800">
        <graph-view v-if="isDataLoaded"
                    v-on:node-clicked="handleNodeClicked"
                    :graph-data="graphData"
                    :width="800"
                    :height="800"
                    :x-margin="0"
                    :y-margin="0"
                    :depth-offset="120"
                    :text-offset="22"
                    :text-content-template="textContentTemplate"
                    :breadth="360"
                    ref="graphView"></graph-view>
      </svg>
    </el-col>
    <el-col :span="5" :push="3">
      <div class="right-panel">
        <h2>Sentence contexts</h2>
        <ul>
          <li v-for="sentence in displayedContexts">
            <span v-for="token in sentence.content">
              <span v-on:click="recenter(token)"
                    class="context-token">{{token}}</span>&nbsp;
            </span>
          </li>
        </ul>
      </div>
    </el-col>
  </el-row>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import {GraphView} from 'occubrow-graph-view';
import {WidgetView} from 'amoe-butterworth-widgets';
import TreeModel from 'tree-model';
import {mapGetters} from 'vuex';
import mc from '@/mutation-constants';
import {DataGateway} from '@/lib/data';
import {
    TreeNode, WidgetViewComponent, TaxonomyRootDatum, QuerySpec, Sentence,
    GraphViewComponent, CentralityDatum, HistoryDatum
} from '@/types';
import {isWidgetViewComponent, isGraphViewComponent} from '@/type-guards';
import {last} from '@/util';
import {debounce} from 'lodash';
import * as log from 'loglevel';
import ChevronsRight from '@/components/ChevronsRight.vue';
import {AxiosError} from 'axios';

import 'occubrow-graph-view/dist/occubrow-graph-view.css';
import 'amoe-butterworth-widgets/dist/amoe-butterworth-widgets.css';

function processQuery(query: QuerySpec[] ): string[] {
    console.log("serialized query in was %o", query);
    
    const result1 = query.map(s => last(s.selectedPath));
    const result2 = result1.filter(p => p !== undefined);
    
    console.log("processed result is %o", result2);
    return result2;
}

const QUERY_DEBOUNCE_TIMEOUT = 10000;

export default Vue.extend({
    components: {GraphView, WidgetView, ChevronsRight},
    data() {
        return {
            textContentTemplate: "{{content}}",
            graphData: null as TreeNode | null,
            taxonomies: {} as any,
            width: 600,
            height: 600,
            depthLimit: 4,
            useRandomRoot: false,
            metrics: null as any,   // FIXME: type
            popoverVisible: false,
            popoverTitle: null as (string | null),
            displayedContexts: [] as Sentence[],
            chosenRoot: null as (string | null),
            filteredTokenSelection: [] as string[],
            loading: false,
            centralityData: [] as CentralityDatum[],
            activeApiCalls: 0 as number,
            // can't initialize here because we can't reference data or methods
            // properly :/
            dataGateway: null as DataGateway | null,
        };
    },
    watch: {
        serializedQuery(newVal, oldVal) {
            log.debug("inside serialized query watcher");
            this.respondToQueryNotDebounced(this.currentRoot, this.serializedQuery, this.depthLimit);
        },
        currentRoot(newVal: string, oldVal: string) {
            this.respondToQueryNotDebounced(this.currentRoot, this.serializedQuery, this.depthLimit);
        },
        chosenRoot(newVal: string, oldVal: string) {
            this.recenter(newVal);
        }
    },
    created() {
        this.dataGateway = new DataGateway(
            this.onLoadingStarted,
            this.onLoadingEnded,
            (r: AxiosError) => {
                const url = r.request.responseURL;
                const error = r.request.statusText;
                
                this.$notify.error({
                    title: 'Error',
                    message: url + ": " + error
                });
            }
        );
        
        
        if (this.useRandomRoot) {
            this.gateway.getRandomRoot().then(r => this.recenter(r.data));
        }
        
        // We obviously don't want to ALWAYS apply the filter.  So the best option
        // would be to be able to register on some sort of getter in the module.
        
        this.gateway.getTaxonomyRoots().then(r => {
            const taxonomyList: TaxonomyRootDatum[] = r.data;
            
            for (let t of taxonomyList) {
                const taxonomyName = t.content;
                
                this.gateway.getTaxonomy(taxonomyName).then(r => {
                    Vue.set(this.taxonomies, taxonomyName, r.data);
                });
            }
        });
        
        this.gateway.getMetrics().then(r => {
            this.metrics = r.data;
        });

        this.gateway.getAllTokens().then(r => {
            this.filteredTokenSelection = r.data;
        });

        this.gateway.getCentralityStatistics().then(r => {
            this.centralityData = r.data;
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
        onLoadingStarted() {
            console.log("loading started");
            this.activeApiCalls++;
        },
        onLoadingEnded() {
            console.log("loading ended");
            this.activeApiCalls--;
        },
        depthChanged() {
            this.respondToQueryNotDebounced(this.currentRoot, this.serializedQuery, this.depthLimit);            
        },
        handleCentralityClick(row: any, column: any, cell: any, event: MouseEvent) {
            if (column.property === 'node') {
                this.recenter(cell.textContent);
            }
        },
        handleHistoryClick(row: any, column: any, cell: any, event: MouseEvent) {
            if (column.property === 'node') {
                this.recenter(cell.textContent);
            }
        },
        recenter(token: string) {
            this.$store.commit(mc.SET_ROOT, token);
        },
        remoteMethod(substring: string) {
            this.loading = true;
            this.gateway.searchTokens(substring).then(r => {
                this.filteredTokenSelection = r.data;
                this.loading = false;
            });

        },
        respondToQueryNotDebounced(currentRoot: string, query: QuerySpec[], depthLimit: number) {
            log.debug("responding to query");

            this.gateway.submitTokenQuery(
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

            this.gateway.getContexts(node.data.content).then(r => {
                this.displayedContexts = r.data;
            });
        },
    },
    computed: {
        fullscreenLoading(): boolean {
            return this.activeApiCalls > 0;
        },
        gateway(): DataGateway {
            if (this.dataGateway === null) {
                throw new Error("somehow uninitialized");
            }

            return this.dataGateway;
        },
        rootHistoryTable(): HistoryDatum[] {
            return this.$store.getters.rootHistoryTable;
        },
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
        },
        roundedCentralityData(): CentralityDatum[] {
            return this.centralityData.map(d => {
                return Object.assign({}, d, {centrality: Number(d.centrality).toFixed(2)})
            });
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

.clickable-table-datum:hover {
    color: hsl(22.4,100%,50%);
    cursor: pointer;
}

#root-selector {
    margin-bottom: 1em;
}

.left-panel {
    margin-top: 1.6em;
}

.history-list {
    margin-top: 1.6em;
}

.clickable-history-datum:hover {
    color: hsl(22.4,100%,50%);
    cursor: pointer;
}

.metrics {
    margin-bottom: 1.6em;
}

.depth-limit {
    margin-bottom: 1.6em;
}


// not very principled
.label {
    display: inline-block;
    width: 130px;
}

.right-panel {
    margin-top: 1.6em;
}

.context-menu-popover {
    // styling for context menu
}
</style>
