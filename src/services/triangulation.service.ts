import * as THREE from 'three';
import {MathService} from "./math.service";

/**
 * Provides methods related to Delaunay triangulation.
 */
export class TriangulationService {
    /**
     * Connects all dots forming triangulated surface. Implements Delaunay triangulation.
     */
    static triangulateDots = (dots: THREE.Vector3[], gridSize: number): THREE.Triangle[] => {
        console.time('triangulation');
        /**
         * Triangulation algorithm I come up with as follows:
         * 1. For every edge from edgesToCheck algorithm, find it's normalized perpendicular vector.
         * 2. Start "growing" perpendicular vector from edge center along each edge side up to maximum size of GRID_HALF_SIZE * 2.
         * 3. For each growth iteration check if any of dots from adjacent tiles have distance to "head" of growing vector
         *    less or equal to distance between "head" of growing vector and one of edge vertex.
         * 4. If there's such dot, then connect edge with that dot, forming triangle and 2 new edges. Each edge needs to be
         *    checked for existence in edgesToCheck array. Push non-existent edges to edgesToCheck.
         *    If both edges exist already in edgesToCheck, that means triangle is dupe of already existing triangle.
         * 5. Push 'true' to edge from edgesToCheck as mark that it's checked. Push formed triangle if it's not dupe to triangles array.
         * 6. Repeat from step 1 until edgesToCheck array is fully checked.
         * 7. Empty edgesToCheck array and all auxiliary arrays.
         */
        const edgesToCheck: [THREE.Vector3, THREE.Vector3, boolean][] = []; // 2 edge's vertices and isChecked status
        const existingEdges: [THREE.Vector3, THREE.Vector3][][] = []; // contains edgesToCheck mapped to a tiles.
        const triangles: THREE.Triangle[] = [];
        const GROWTH_DELTA: number = 0.01;

        let edgeToCheck: [THREE.Vector3, THREE.Vector3, boolean] = [dots[0], dots[1], false];
        edgesToCheck.push(edgeToCheck);
        while (edgeToCheck) { // while edgeToCheck would be found in edgesToCheck
            const edgeCenter: THREE.Vector3 = new THREE.Vector3().addVectors(edgeToCheck[0], edgeToCheck[1]);
            edgeCenter.setLength(edgeCenter.length() / 2);

            const perpendicular: THREE.Vector3 = new THREE.Vector3();
            perpendicular.subVectors(edgeToCheck[0], edgeToCheck[1]);
            perpendicular.applyAxisAngle(MathService.zAxis, Math.PI / 2);

            let numberOfSidesChecked = 0; // need to check both sides of an edge
            while (numberOfSidesChecked < 2) {
                perpendicular.applyAxisAngle(MathService.zAxis, Math.PI);
                perpendicular.setLength(GROWTH_DELTA / 10);
                let dotsFound = false;
                while (!dotsFound && perpendicular.length() < 2) { // tile size is 1
                    perpendicular.setLength(perpendicular.length() + GROWTH_DELTA);
                    const circleCenter = new THREE.Vector3().subVectors(edgeCenter, perpendicular);
                    // distance from one of edges to "head" of perpendicular when it's set from edge center
                    const radius = new THREE.Vector3().subVectors(
                        edgeToCheck[0], // can be edgeToCheck[1] as well
                        circleCenter
                    ).length();

                    // retrieve all surrounding dots
                    MathService.getSurroundingCoordinates(circleCenter)
                        .map(neighborCoordinate => dots[MathService.get1DIndex(neighborCoordinate.x, neighborCoordinate.y, gridSize)])
                        // remove non-existent dots and dots that are not within circleCenter radius
                        .filter(dot => dot && dot !== edgeToCheck[0] && dot !== edgeToCheck[1]
                            && new THREE.Vector3().subVectors(circleCenter, dot).length() <= radius)
                        .forEach(dotWithinRadius => {
                            let newEdges: [THREE.Vector3, THREE.Vector3][] = [
                                [dotWithinRadius, edgeToCheck[0]],
                                [dotWithinRadius, edgeToCheck[1]],
                            ];
                            // in order to map newEdges to grid tile each edge needs to have Y-axes highest point at 0-index
                            // also having dots sorted in order helps with dupe checking
                            newEdges.forEach(edge => edge.sort((a, b) => a.y - b.y));

                            // filter out dupes compared to edgesToCheck
                            const validEdges = newEdges.filter(newEdge => !edgesToCheck.some(oldEdge => oldEdge[0] === newEdge[0] && oldEdge[1] === newEdge[1]))
                            // filter out new edges that are intersecting old edges within XY coordinate axes
                            // TODO can't make it work
                            // .filter(newEdge =>
                            //     !MathService.getSurroundingCoordinates(newEdge[0])
                            //         .concat(MathService.getSurroundingCoordinates(newEdge[1]))
                            //         .some(oldEdgesCoordinate => {
                            //             const oldEdges = existingEdges[MathService.get1DIndex(oldEdgesCoordinate.x, oldEdgesCoordinate.y, gridSize)];
                            //             return oldEdges && oldEdges.some(oldEdge => MathService.doIntersect(newEdge, oldEdge));
                            //         }));
                            validEdges.forEach(validEdge => {
                                edgesToCheck.push([validEdge[0], validEdge[1], false]);
                                const existingEdgesCoordinate = MathService.get1DIndex(validEdge[0].x, validEdge[0].y, gridSize);
                                if (!existingEdges[existingEdgesCoordinate]) existingEdges[existingEdgesCoordinate] = [];
                                existingEdges[existingEdgesCoordinate].push(validEdge);
                            });
                            triangles.push(new THREE.Triangle(edgeToCheck[0], edgeToCheck[1], dotWithinRadius));
                            dotsFound = true; // breaking cycle of "growing" perpendicular
                        });
                }
                numberOfSidesChecked++;
            }
            edgeToCheck[2] = true;
            edgeToCheck = edgesToCheck.find(edge => !edge[2]);
        }
        edgesToCheck.length = existingEdges.length = 0;
        console.timeEnd('triangulation');
        return triangles;
    }
}