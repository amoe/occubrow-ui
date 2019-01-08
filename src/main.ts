import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { GraphView, GraphViewModule } from 'occubrow-graph-view';
import ElementUI from 'element-ui';


import 'occubrow-graph-view/dist/occubrow-graph-view.css';
import 'amoe-butterworth-widgets/dist/amoe-butterworth-widgets.css';

import 'element-ui/lib/theme-chalk/index.css';


Vue.use(ElementUI);


require('typeface-oxygen');

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');
