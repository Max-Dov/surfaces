import * as THREE from 'three';

/**
 * Provides methods related to math & geometry.
 */
export class MathService {
    static zAxis: THREE.Vector3 = new THREE.Vector3(0, 0, 1);

    /**
     * Calculates A and B coefficients for equation "y = Ax + B" from 2 given points;
     * Returns solution for equation system:
     *     pA.y = A * pA.x + B
     * AND pB.y = A * pB.x + B
     *
     * @param pA    point on line
     * @param pB    point on line
     * @returns [A: number, B: number]
     */
    static calcCoefficientsFor2DLine = (pA: THREE.Vector3, pB: THREE.Vector3): [number, number] => {
        const A: number = (pB.y - pA.y) / (pB.x - pA.x);
        return [A, pA.y - A * pA.x];
    }

    /**
     * Returns true if 2D segments intersect each other, false otherwise:
     * 1. Solves equation system:
     *        y = A1 * x + B1
     *    AND y = A2 * x + B2
     * 2. Returns true if equation system solution is within both segments.
     * @param segmentA     points belonging to 1st segment
     * @param segmentB     points belonging to 2nd segment
     */
    static doIntersect = (segmentA: [THREE.Vector3, THREE.Vector3], segmentB: [THREE.Vector3, THREE.Vector3]): boolean => {
        const [A1, B1] = MathService.calcCoefficientsFor2DLine(...segmentA);
        const [A2, B2] = MathService.calcCoefficientsFor2DLine(...segmentB);

        if (A1 / A2 === 1) return false; // lines are parallel

        // pX is intersection point coordinate on Ox axis
        const pX: number = (B2 - B1) / (A1 - A2);

        return ((segmentA[0].x >= pX && pX >= segmentA[1].x) || (segmentA[1].x >= pX && pX >= segmentA[0].x))  // pX ∈ segmentA
            && ((segmentB[0].x >= pX && pX >= segmentB[1].x) || (segmentB[1].x >= pX && pX >= segmentB[0].x)); // pX ∈ segmentB
    }

    /**
     * Returns 1D array index from it's 2D alternative array.
     * Sometimes it's more convenient to keep 2D arrays as 1D array, however you have to calculate proper index if you
     * need to get specific element from 1D array as it could've been in 2D array.
     * @param x                 alternative coordinate in 2D array
     * @param y                 alternative coordinate in 2D array
     * @param xDimensionSize    alternative length of subarray (2DArray[y].length)
     */
    static get1DIndex = (x, y, xDimensionSize): number => Math.trunc(y) * xDimensionSize + Math.trunc(x)

    /**
     * Calculates surrounding coordinates around provided coordinate within specified radius.
     * Expected to be used to calculate surrounding tiles for intersections/duplications checks.
     */
    static getSurroundingCoordinates = (baseCoordinate: THREE.Vector3, radius: number = 1): THREE.Vector3[] => {
        const resultArray: THREE.Vector3[] = [];
        for (let y = -radius; y <= radius; y++)
            for (let x = -radius; x <= radius; x++) {
                resultArray.push(new THREE.Vector3(
                    x + Math.trunc(baseCoordinate.x),
                    y + Math.trunc(baseCoordinate.y),
                    0
                ));
            }
        return resultArray;
    }
}