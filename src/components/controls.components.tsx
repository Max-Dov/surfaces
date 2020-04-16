import {useFrame, useThree, extend} from 'react-three-fiber';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import React, {useRef} from "react";

extend({OrbitControls});

export function Controls(props: any) {
    const ref: any = useRef();
    const {gl, camera} = useThree();
    useFrame(state => ref.current.update());

    // @ts-ignore
    return <orbitControls {...props} ref={ref} args={[camera, gl.domElement]}/>
}