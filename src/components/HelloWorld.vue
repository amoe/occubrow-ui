<template>
  <div class="hello">
    <svg width="600" :height="600">
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
</template>

<script lang="ts">
import Vue from 'vue';
import {GraphView} from 'occubrow-graph-view';

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
    components: {GraphView}
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
