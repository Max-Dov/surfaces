import * as THREE from 'three';
import React, {useRef, useState} from 'react';
import {useFrame} from "react-three-fiber";
import {Coords} from "../models/coords.model";
import {TriangleService} from "../services/triangle.service";

let r = () => Math.random(); // just for shorter access

export default function Surfaces(props: any) {
    const mesh: any = useRef();

    const GRID_HALF_SIZE = 10; // x, y dimensions
    /**
     * Generating dots with random shift size of [0, 1) around x, y index.
     * So actually visible scene is grid with dots slightly moved around it's tile.
     * Helps with finding closest dot for any dot as it would be one of 8 surrounding neighbors.
     */
    let dots: Coords[] = [];
    for (let x = -GRID_HALF_SIZE; x < GRID_HALF_SIZE; x++)
        for (let y = -GRID_HALF_SIZE; y < GRID_HALF_SIZE; y++) {
            dots.push({x: x + r(), y: y + r(), z: r() / 10})
        }

    let [vertices, setVertices] = useState([]);
    let [normals, setNormals] = useState([]);
    /**
     * Triangulation
     */
    for (let x = 0; x < GRID_HALF_SIZE * 2 - 1; x++)
        for (let y = 0; y < GRID_HALF_SIZE * 2 - 1; y++) {
            const leftTop = dots[y * GRID_HALF_SIZE * 2 + x];
            let otherDots: Coords[] = [
                dots[y * GRID_HALF_SIZE * 2 + x + 1],
                dots[(y + 1) * GRID_HALF_SIZE * 2 + x],
                dots[(y + 1) * GRID_HALF_SIZE * 2 + x + 1]
            ];
            otherDots.sort((a, b) =>
                Math.sqrt((a.x - leftTop.x) ** 2 + (a.y - leftTop.y) ** 2) > Math.sqrt((b.x - leftTop.x) ** 2 + (b.y ** 2 - leftTop.y))
                    ? 1 : -1);
            // abc, bcd -- proper order to get good normals
            let triangle = TriangleService.createTriangle([leftTop, otherDots[0], otherDots[1]]);
            vertices.push(...triangle.getVertices());
            normals.push(...triangle.getNormals());
            triangle = TriangleService.createTriangle([otherDots[0], otherDots[1], otherDots[2]]);
            vertices.push(...triangle.getVertices());
            normals.push(...triangle.getNormals());
        }

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.computeBoundingSphere();

    /**
     * Display
     */

    useFrame(() => {

    });

    return (
        <mesh visible ref={mesh}
              geometry={geometry}>
            {/*<bufferGeometry attach="geometry">*/}
            {/*    <bufferAttribute attachObject={['attributes', 'position']} array={vertices} itemSize={3}/>*/}
            {/*    <bufferAttribute attachObject={['attributes', 'normals']} array={normals} itemSize={3}/>*/}
            {/*</bufferGeometry>*/}
            <meshPhongMaterial attach="material" color="hotpink" side={THREE.DoubleSide}/>
        </mesh>
    );
}

