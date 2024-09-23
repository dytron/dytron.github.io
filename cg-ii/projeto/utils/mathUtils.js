export function normalizeDegrees(degrees) {
    return (degrees % 360 + 360) % 360;
}

export function degreesToRadians(degrees) {
    degrees = normalizeDegrees(degrees);
    return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians) {
    let degrees = (radians * 180) / Math.PI;
    return normalizeDegrees(degrees);
}
