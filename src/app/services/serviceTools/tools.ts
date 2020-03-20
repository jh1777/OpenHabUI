export class Tools {
    static AddEntryToMapArray<K,V>(map: Map<K, V[]>, key: K, value: V) {
        // Array present with key?
        if (map.has(key)) {
            map.get(key).push(value);
        } else {
            var array: V[] = [];
            array.push(value);
            map.set(key, array);
        }
    }

}