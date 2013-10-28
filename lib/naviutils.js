if (exports) {
    exports.getTrueWindAngle = function (speed, windSpeed, windAngle) {
        var apparentX = Math.cos(Math.PI / 180 * windAngle) * windSpeed;
        var apparentY = Math.sin(Math.PI / 180 * windAngle) * windSpeed;
        return Math.atan2(apparentY, -speed + apparentX) / (Math.PI / 180);
    };

    exports.getTrueWindSpeed = function (speed, windSpeed, windAngle) {
        var apparentX = Math.cos(Math.PI / 180 * windAngle) * windSpeed;
        var apparentY = Math.sin(Math.PI / 180 * windAngle) * windSpeed;
        return Math.sqrt(Math.pow(apparentY, 2) + Math.pow(-speed + apparentX, 2));
    };

    exports.knots2MetersPerSecond = function (knots) {
        return knots * 0.514444;
    };

    exports.getDistanceToLayLine = function (params) {
        console.log(params.distanceToMark + ' ' +
            params.bearingToMark + ' ' +
            params.trueWindBearing + ' ' +
            params.bestReachAngle);
        angleBetweenLaylineAndBoatToMark = params.bestReachAngle + params.bearingToMark;
        console.log("angleBetweenLaylineAndBoatToMark:" + angleBetweenLaylineAndBoatToMark);
        angleBetweenHeadingAndBearingToMark = params.heading - params.bearingToMark;
        console.log("angleBetweenHeadingAndBearingToMark:" + angleBetweenHeadingAndBearingToMark);
        distance2IntersectionNormal = params.distanceToMark * Math.tan(toRadian(angleBetweenLaylineAndBoatToMark)) /
            (Math.tan(toRadian(angleBetweenHeadingAndBearingToMark)) + Math.tan(toRadian(angleBetweenLaylineAndBoatToMark)));
        sidewaysDistance2Intersection = distance2IntersectionNormal * Math.tan(toRadian(angleBetweenHeadingAndBearingToMark));
        console.log("distance2IntersectionNormal" + distance2IntersectionNormal);
        console.log("sidewaysDistance2Intersection" + sidewaysDistance2Intersection);
        return Math.sqrt(Math.pow(distance2IntersectionNormal,2) + Math.pow(sidewaysDistance2Intersection,2));
    };

    var toRadian = function(degreeAngle) {
        return Math.PI / 180 * degreeAngle;
    };
}

var metersPerSecond2knots = function (mps) {
    return mps / 0.514444;
};