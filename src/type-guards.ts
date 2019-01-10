import { WidgetViewComponent } from '@/types';

function isWidgetViewComponent(value: any): value is WidgetViewComponent {
    return value.hasOwnProperty('getQuery');
}

export { isWidgetViewComponent }
