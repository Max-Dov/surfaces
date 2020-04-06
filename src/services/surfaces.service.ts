import * as THREE from 'three';
import {Coords} from "../models/coords.model";
import {BufferFigure} from "../models/buffer-figure.model";
import {Float32BufferAttribute} from "three";

export class SurfacesService {
    private static r = () => Math.random(); // just for shorter access
    static zAxis: THREE.Vector3 = new THREE.Vector3(0, 0, 1);

    static generateDots = (dotsNumber: number): THREE.Vector3[] => {
        console.time('dotsgen');
        const generatedDots: THREE.Vector3[] = [];
        for (let y = 0; y < dotsNumber; y++)
            for (let x = 0; x < dotsNumber; x++) {
                generatedDots.push(new THREE.Vector3(x + SurfacesService.r() / 3, y + SurfacesService.r() / 3, SurfacesService.r()));
            }
        console.timeEnd('dotsgen');
        return generatedDots;
    }

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
         * 7. Empty edgesToCheck array.
         */
        const edgesToCheck: [THREE.Vector3, THREE.Vector3, boolean][] = []; // 2 edge's vertices and isChecked status
        edgesToCheck.push([dots[0], dots[1], false]);
        const triangles: THREE.Triangle[] = [];
        const GROWTH_DELTA: number = 0.01;
        let edgeToCheck: [THREE.Vector3, THREE.Vector3, boolean] = edgesToCheck[0];
        while (edgesToCheck.some(edge => !edge[2] && (edgeToCheck = edge))) { // while array is not fully checked
            const edgeCenter: THREE.Vector3 = new THREE.Vector3().addVectors(edgeToCheck[0], edgeToCheck[1]);
            edgeCenter.setLength(edgeCenter.length() / 2);
            let perpendicular: THREE.Vector3 = new THREE.Vector3();
            perpendicular.subVectors(edgeToCheck[0], edgeToCheck[1]);
            perpendicular.applyAxisAngle(SurfacesService.zAxis, Math.PI / 2);
            let numberOfSidesChecked = 0; // need to check both sides
            while (numberOfSidesChecked < 2) {
                perpendicular.applyAxisAngle(SurfacesService.zAxis, Math.PI);
                perpendicular.setLength(GROWTH_DELTA);
                while (perpendicular.length() < 2) { // tile size is 1
                    const circleCenter = new THREE.Vector3().subVectors(edgeCenter, perpendicular);
                    const radius = new THREE.Vector3().subVectors( // distance from one of edges to "head" of perpendicular when it's set from edge center
                        edgeToCheck[0], // can be edgeToCheck[1] as well
                        circleCenter
                    ).length();
                    let dotsToCheck: THREE.Vector3[] = [];
                    for (let xShift = -1; xShift < 2; xShift++)
                        for (let yShift = -1; yShift < 2; yShift++) {
                            const neighborIndex = (Math.trunc(circleCenter.y) + yShift) * gridSize  // Y tile coordinate
                                + Math.trunc(circleCenter.x) + xShift ;             // X tile coordinate
                            if (dots[neighborIndex]) {
                                dotsToCheck.push(dots[neighborIndex]);
                            }
                        }
                    dotsToCheck = dotsToCheck.filter(dot => dot !== edgeToCheck[0] && dot !== edgeToCheck[1]); // don't need to verify with edge we're basing triangle on
                    const dotWithinRadius = dotsToCheck.find(dot => new THREE.Vector3().subVectors(circleCenter, dot).length() <= radius);
                    if (dotWithinRadius) {
                        let newEdges: [THREE.Vector3, THREE.Vector3, boolean][] = [
                            [dotWithinRadius, edgeToCheck[0], false],
                            [dotWithinRadius, edgeToCheck[1], false],
                        ];
                        let dupeNumber = 0; // only if both are dupes need to withdraw triangle gen
                        for (let existingEdge of edgesToCheck) {
                            if (existingEdge[0] === newEdges[0][0] && existingEdge[1] === newEdges[0][1]
                                || existingEdge[0] === newEdges[0][1] && existingEdge[1] === newEdges[0][0]) {
                                newEdges[0][2] = true;
                                dupeNumber++;
                            }
                            if (existingEdge[0] === newEdges[1][0] && existingEdge[1] === newEdges[1][1]
                                || existingEdge[0] === newEdges[1][1] && existingEdge[1] === newEdges[1][0]) {
                                newEdges[1][2] = true;
                                dupeNumber++;
                            }
                            if (dupeNumber >= 2) break;
                        }
                        if (dupeNumber < 2) {
                            edgesToCheck.push(...newEdges.filter(newEdge => !newEdge[2])); // push non-dupes
                        }
                        triangles.push(new THREE.Triangle(edgeToCheck[0], edgeToCheck[1], dotWithinRadius));
                        break; // breaking cycle of "growing" perpendicular for new triangle
                    }
                    perpendicular.setLength(perpendicular.length() + GROWTH_DELTA);
                }
                numberOfSidesChecked++;
            }
            edgeToCheck[2] = true;
        }
        edgesToCheck.length = 0;
        console.timeEnd('triangulation');
        return triangles;
    }

    static formGeometryFromSurface = (triangles: THREE.Triangle[]): THREE.BufferGeometry => {
        console.time('geometrygen');
        let geometry = new THREE.BufferGeometry();
        let vertices: number[] = [];
        let normals = [];
        triangles.forEach(triangle => {
            let normal = triangle.getNormal(SurfacesService.zAxis);
            vertices.push(
                triangle.a.x, triangle.a.y, triangle.a.z,
                triangle.b.x, triangle.b.y, triangle.b.z,
                triangle.c.x, triangle.c.y, triangle.c.z,
            );
            normals.push(
                normal.x, normal.y, normal.z,
                normal.x, normal.y, normal.z,
                normal.x, normal.y, normal.z
            )
        })
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        console.timeEnd('geometrygen');
        return geometry;
    }

    static generateSurface = (gridSize: number): THREE.Triangle[] => {
        return SurfacesService.triangulateDots(SurfacesService.generateDots(gridSize), gridSize);
    }
}