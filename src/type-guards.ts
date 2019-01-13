import { WidgetViewComponent, GraphViewComponent } from '@/types';

function isWidgetViewComponent(value: any): value is WidgetViewComponent {
    return value.hasOwnProperty('getQuery');
}

function isGraphViewComponent(value: any): value is GraphViewComponent {
    return value.$options.name === 'GraphView'
}

export { isWidgetViewComponent, isGraphViewComponent }
