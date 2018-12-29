<template>
<div class="page">
  <widget-view :taxonomies="taxonomies" ref="widgetView"></widget-view>

  <button v-on:click="doIt">Get serialized query</button>

  <div class="graph">
    <svg id="svg-frame" width="600" height="600">
      <graph-view v-if="isDataLoaded"
                  :graph-data="graphData"
                  :width="600"
                  :height="600"
                  :x-margin="162"
                  :y-margin="128"
                  :depth-offset="120"
                  :text-offset="22"
                  :text-content-template="textContentTemplate"
                  :breadth="360"></graph-view>
    </svg>
  </div>
</div>
</template>

<script lang="ts">
    import Vue from 'vue';
import {GraphView} from 'occubrow-graph-view';
import {WidgetView} from 'amoe-butterworth-widgets';
import TreeModel from 'tree-model';
import api from '@/lib/data';
import {TreeNode} from '@/types';

import 'occubrow-graph-view/dist/occubrow-graph-view.css';
import 'amoe-butterworth-widgets/dist/amoe-butterworth-widgets.css';


const MUSIC_TAXONOMY_JSON = {
    'children': [{'content': 'Rock', 'id': 1, 'label': 'Taxon',
                  'children': [{'content': 'Metal', 'id': 3, 'label': 'Taxon'}]},
                 {'content': 'Classical', 'id': 2, 'label': 'Taxon',
                  'children': [{'content': 'Baroque', 'id': 4, 'label': 'Taxon'}]}],
    'content': 'Music',
    'id': 0,
    'label': 'Taxon'
};

const OCCUPATION_TAXONOMY_JSON = {
    'children': [{'content': 'Manufacturing', 'id': 1, 'label': 'Taxon',
                  'children': [
                      {'content': 'Wood workers',
                       'id': 2, 
                       'label': 'Taxon', 
                       'children': [
                           {'content': 'Bandbox-maker',
                            'id': 3,
                            'label': 'Taxon'}
                       ]}
                  ]}],
    
    'content': 'Occupation',
    'id': 0,
    'label': 'Taxon'
};

const PLACE_TAXONOMY_JSON = {
    'children': [{'content': 'Country', 'id': 1, 'label': 'Taxon',
                  'children': [
                      {'content': 'France',
                       'id': 2, 
                       'label': 'Taxon'}]
                 }],
    'content': 'Place',
    'id': 0,
    'label': 'Taxon'
};



const STATIC_TAXONOMY_DATA = {
    "_type": "Taxon",
    "children": [
        {
            "_type": "Taxon",
            "children": [
                {
                    "_type": "Taxon",
                    "id": 63754,
                    "name": "Deepstaria enigmatica"
                },
                {
                    "_type": "Taxon",
                    "id": 63759,
                    "name": "Deepstaria reticulum"
                }
            ],
            "id": 63752,
            "name": "Deepstaria"
        },
        {
            "_type": "Taxon",
            "children": [
                {
                    "_type": "Taxon",
                    "id": 63760,
                    "name": "Aurelia labiata"
                },
                {
                    "_type": "Taxon",
                    "id": 63761,
                    "name": "Aurelia aurita"
                }
            ],
            "id": 63753,
            "name": "Aurelia"
        }
    ],
    "id": 63751,
    "name": "Ulmaridae"
};

export default Vue.extend({
    components: {GraphView, WidgetView},
    data() {
        return {
            textContentTemplate: "{{content}}",
            graphData: null as TreeNode | null,
            taxonomies: {
                'Music': MUSIC_TAXONOMY_JSON,
                'Occupation': OCCUPATION_TAXONOMY_JSON,
                'Place': PLACE_TAXONOMY_JSON
            }
        };
    },
    created() {
        api.getTree('keep').then(r => {
            this.graphData = r.data;
        });
        
        api.getTaxonomy('Occupation').then(r => {
            console.log("loaded taxonomy %o", r.data);
            console.log("inside created hook");
            const treeModelConfig = {childrenPropertyName: 'children'};
            const apiTree = new TreeModel(treeModelConfig);
            const apiRoot = apiTree.parse(r.data);
            this.$store.commit('setTaxonomyModel', apiRoot);
        });
    },
    methods: {
        doIt() {
            console.log("doing it");
            console.log("widget view is %o", this.$refs.widgetView);
            const query = this.$refs.widgetView as any;
            console.log("result was %o", JSON.stringify(query.getQuery(), null, 4));
        }
    },
    computed: {
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
