Bacon.Observable.prototype.slidingTimeWindow = function (windowDuration) {
    var addToWindow, now, withTimeStamp;
    now = function () {
        return Date.now();
    };
    withTimeStamp = function (value) {
        return {
            value: value,
            timestamp: now()
        };
    };
    addToWindow = function (window, value) {
        window.push(value);
        var ref = window[0];
        while (ref != null && ref.timestamp < now() - windowDuration) {
            window = window.splice(1);
            ref = window[0];
        }
        return window;
    };
    return this.map(withTimeStamp).scan([], addToWindow);
};