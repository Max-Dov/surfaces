import * as THREE from 'three';
import React, {Dispatch, SetStateAction, useRef, useState} from 'react';
import {useFrame} from "react-three-fiber";
import {Coords} from "../models/coords.model";
import {Triangle} from "react-three-fiber/components";
import {BufferAttribute, Float32BufferAttribute} from "three";

let r = () => Math.random(); // just for shorter access

export default function Surfaces(props: {
    gridSize?: number
}) {
    const mesh: any = useRef();
    const GRID_SIZE = props.gridSize || 10; // along X and Y axes

    console.time('triangulation');
    /**
     * Generating vectors. Each vector placed randomly within 1x1 tile.
     * Distributing dots across tiles helps with finding closest dot for any other dot as it would be within one of 8 surrounding tiles.
     */
    const generatedDots: THREE.Vector3[] = [];
    for (let y = 0; y < GRID_SIZE; y++)
        for (let x = 0; x < GRID_SIZE; x++) {
            generatedDots.push(new THREE.Vector3(x + r() / 3, y + r() / 3, r()));
        }
    const [dots, setDots]: [THREE.Vector3[], Dispatch<SetStateAction<THREE.Vector3[]>>] = useState(generatedDots);
    // const [triangles, setTriangles]: [THREE.Triangle[], Dispatch<SetStateAction<THREE.Triangle[]>>] = useState([]);
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
    const zAxis: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
    const GROWTH_DELTA: number = 0.01;
    let edgeToCheck: [THREE.Vector3, THREE.Vector3, boolean] = edgesToCheck[0];
    while (edgesToCheck.some(edge => !edge[2] && (edgeToCheck = edge))) { // while array is not fully checked
        const edgeCenter: THREE.Vector3 = new THREE.Vector3().addVectors(edgeToCheck[0], edgeToCheck[1]);
        edgeCenter.setLength(edgeCenter.length() / 2);
        let perpendicular: THREE.Vector3 = new THREE.Vector3();
        perpendicular.subVectors(edgeToCheck[0], edgeToCheck[1]);
        perpendicular.applyAxisAngle(zAxis, Math.PI / 2);

        let numberOfSidesChecked = 0; // need to check both sides
        while (numberOfSidesChecked < 2) {
            perpendicular.applyAxisAngle(zAxis, Math.PI);
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
                        const neighborIndex = (Math.trunc(circleCenter.y) + yShift) * GRID_SIZE  // Y tile coordinate
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


    const geometry = new THREE.BufferGeometry();
    let vertices: number[] = [];
    let normals = [];
    triangles.forEach(triangle => {
        let normal = triangle.getNormal(zAxis);
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
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3))

    useFrame(() => {});
    return (<>
            <mesh visible ref={mesh} geometry={geometry} position={[-GRID_SIZE / 2, -GRID_SIZE / 2, 0]}>
                <meshPhongMaterial attach="material" color="hotpink" side={THREE.DoubleSide}/>
                {dots.map(dot =>
                    <mesh position={[dot.x, dot.y, dot.z]}>
                        <sphereBufferGeometry attach="geometry" args={[0.05]}/>
                        <meshPhongMaterial attach="material" color="orange"/>
                    </mesh>
                )}
            </mesh>

        </>
    );
}

