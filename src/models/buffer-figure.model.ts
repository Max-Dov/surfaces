/**
 * Container of vertices & normals coordinates for easy use with BufferAttribute.
 * Array has size of N * 2, where N is number of vertices or normals multiplied by 3 (each coordinate).
 * First N elements are vertices coordinates ([ax, ay, az, bx, by, bz...]), last N elements are normals ([nx, ny, nz..])
 */
export class BufferFigure {
    private readonly vertices: number[];
    private readonly normals: number[];
    getVertices = (): number[] => this.vertices;
    getNormals = (): number[] => this.normals;

    constructor(array: number[]) {
        this.vertices = array.slice(0, array.length / 2);
        this.normals = array.slice(array.length / 2, array.length);
    }
}