import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { GraphView, GraphViewModule } from 'occubrow-graph-view';
import * as log from 'loglevel';


// Set up Element
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import locale from 'element-ui/lib/locale/lang/en'
Vue.use(ElementUI, { locale })


// Use exported styles
import 'occubrow-graph-view/dist/occubrow-graph-view.css';
import 'amoe-butterworth-widgets/dist/amoe-butterworth-widgets.css';

require('typeface-oxygen');

log.setLevel(log.levels.INFO);


Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');
