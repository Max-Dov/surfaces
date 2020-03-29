import {useFrame, useThree, extend} from 'react-three-fiber';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import React, {useRef} from "react";

extend({OrbitControls});

export function Controls() {
    const ref: any = useRef();
    const {camera, gl} = useThree();
    useFrame(state => ref.current.update());

    // @ts-ignore
    return <orbitControls ref={ref} args={[camera, gl.domElement]}/>
}