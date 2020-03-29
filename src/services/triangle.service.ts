import * as THREE from 'three';
import {Coords} from "../models/coords.model";
import {BufferFigure} from "../models/buffer-figure.model";

export class TriangleService {
    /**
     * Generates triangles from a given coordinates points.
     * From 3 points provided (a, b, c), normal is calculated from multiplying vectors ab and cb
     * @param coords    array with 3 coordinates for each triangle
     * @returns         array of 18 elements -- 9 vertices and 9 normals coords
     */
    static createTriangle = (coords: Coords[]): BufferFigure => {
        // 1st vertex
        const ax = coords[0].x;
        const ay = coords[0].y;
        const az = coords[0].z;
        // 2nd vertex
        const bx = coords[1].x;
        const by = coords[1].y;
        const bz = coords[1].z;
        // 3d vertex
        const cx = coords[2].x;
        const cy = coords[2].y;
        const cz = coords[2].z;

        // point vectors
        const pA = new THREE.Vector3(ax, ay, az);
        const pB = new THREE.Vector3(bx, by, bz);
        const pC = new THREE.Vector3(cx, cy, cz);

        // sub-vectors used for retrieving normals
        const cb = new THREE.Vector3();
        const ab = new THREE.Vector3();
        ab.subVectors(pA, pB);
        cb.subVectors(pC, pB);
        cb.cross(ab);
        cb.normalize();

        // normal (same for each vertex)
        const nx = cb.x;
        const ny = cb.y;
        const nz = cb.z;

        return new BufferFigure([ax, ay, az, bx, by, bz, cx, cy, cz,
            nx, ny, nz, nx, ny, nz, nx, ny, nz]);
    };
}