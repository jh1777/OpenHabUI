export type KeyValue<V> = {
    [key in string | number]: V;
};