exports.max = function(ary, key) {
	var max = ary[0][key];
	ary.slice(1).forEach(function(e) {
		max = e[key] > max ? e[key] : max
	})
	return max;
}

exports.min = function(ary, key) {
    var min = ary[0][key];
    ary.slice(1).forEach(function(e) {
        min = e[key] < min ? e[key] : min
    })
    return min;
}

exports.avg = function(ary, key) {
    var sum = 0;
    ary.slice(1).forEach(function(e) {
        sum += Number(e[key]);
    })
    return sum / ary.length;
}

exports.toPositiveAngle = function(angle) {
	return (angle + 360) % 360;
}