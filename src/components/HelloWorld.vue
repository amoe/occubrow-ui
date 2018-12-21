<template>
<div class="page">
  <div class="graph">
    <svg id="svg-frame" width="600" height="600">
      <graph-view :width="600"
                  :height="600"
                  :x-margin="162"
                  :y-margin="432"
                  :depth-offset="120"
                  :text-offset="22"
                  :breadth="360"
                  :graph-data="fakeGraphData"></graph-view>
    </svg>
  </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import {GraphView} from 'occubrow-graph-view';
import TreeModel from 'tree-model';
import 'occubrow-graph-view/dist/occubrow-graph-view.css';


const FAKE_API_DATA = {
    "children": [
        {
            "children": [
                {
                    "id": "St.",
                    "taxon": null
                },
                {
                    "id": "waggon",
                    "taxon": null
                }
            ],
            "id": "the",
            "taxon": null
        },
        {
            "children": [
                {
                    "id": "shop",
                    "taxon": null
                }
            ],
            "id": "a",
            "taxon": null
        }
    ],
    "id": "keep",
    "taxon": null
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
    name: 'HelloWorld',
    data() {
        return {
            fakeGraphData: FAKE_API_DATA
        };
    },
    created() {
        console.log("inside created hook");
        const treeModelConfig = {childrenPropertyName: 'children'};
        const apiTree = new TreeModel(treeModelConfig);
        const apiRoot = apiTree.parse(STATIC_TAXONOMY_DATA as any);
        this.$store.commit('setTaxonomyModel', apiRoot);
    },
    components: {GraphView}
});
</script>

<style lang="less">
@font-face {
    font-family: 'Oxygen';
    src: url("/static/fonts/Oxygen-Regular.ttf");
}

body {
    background-color: #fdfdfd;
    font-family: 'Oxygen', sans-serif;
}

div.page {
    display: grid;
    grid-template-columns: repeat(12, [col-start] 1fr);
}

div.taxonomy {
    grid-row: 2;
    height: 8em;
    grid-column: col-start / span 12;
    margin: 1em;
}

div.graph {
    grid-row: 4;
    grid-column: col-start 4 / span 4;
}

.glyph {
    fill: red;
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
