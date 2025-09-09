import Plot from 'react-plotly.js';
import type { Vec3 } from './types';

interface CanvasProps {
  data: Vec3[];
  initialPosition: Vec3;
  initialVelocity: Vec3;
  attractorSize?: number;
  energy?: number;
  attractorThreshold?: number; // show ring vs sphere
}

// Generate sphere as a matrix for surface plots
function createSphereMatrix(radius: number = 1, axis: 'x' | 'y' | 'z', resolution: number = 32): number[][] {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= resolution; i++) {
    const row: number[] = [];
    const theta = (i / resolution) * Math.PI;
    
    for (let j = 0; j <= resolution; j++) {
      const phi = (j / resolution) * 2 * Math.PI;
      
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);
      
      if (axis === 'x') row.push(x);
      else if (axis === 'y') row.push(y);
      else row.push(z);
    }
    
    matrix.push(row);
  }
  
  return matrix;
}

// Generate ring/torus as a matrix for surface plots
function createRingMatrix(radius: number = 1, tubeRadius: number = 0.001, axis: 'x' | 'y' | 'z', resolution: number = 32): number[][] {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= resolution; i++) {
    const row: number[] = [];
    const theta = (i / resolution) * 2 * Math.PI;
    
    for (let j = 0; j <= resolution; j++) {
      const phi = (j / resolution) * 2 * Math.PI;
      
      // Torus equations
      const x = (radius + tubeRadius * Math.cos(phi)) * Math.cos(theta);
      const y = (radius + tubeRadius * Math.cos(phi)) * Math.sin(theta);
      const z = tubeRadius * Math.sin(phi);
      
      if (axis === 'x') row.push(x);
      else if (axis === 'y') row.push(y);
      else row.push(z);
    }
    
    matrix.push(row);
  }
  
  return matrix;
}

export default function Canvas({ 
  data, 
  initialPosition, 
  attractorSize=1,
  energy=0,
  attractorThreshold=0.001
 }: CanvasProps) {

  // bounding box based on data and energy
  const xValues = data.map(point => point.x);
  const yValues = data.map(point => point.y);
  const zValues = data.map(point => point.z);

  // Add origin (0,0,0) to ensure the attractor is always within the bounding box
  xValues.push(0);
  yValues.push(0);
  zValues.push(0);

  // Calculate max distance based on energy
  let rangeSize: number;
  
  if (energy < 0) {
    // Bound orbit
    const maxX = Math.max(...xValues.map(Math.abs));
    const maxY = Math.max(...yValues.map(Math.abs));
    const maxZ = Math.max(...zValues.map(Math.abs));
    const maxDistance = Math.max(maxX, maxY, maxZ, 5); // for visibility
    rangeSize = maxDistance * 1.25; // padding
  } else {
    // Unbound orbit
    rangeSize = 20;
  }
  
  const xRange = [-rangeSize, rangeSize];
  const yRange = [-rangeSize, rangeSize];
  const zRange = [-rangeSize, rangeSize];

    return (
      <Plot
        data={[
          // Central attractor marker (always visible)
          {
            x: [0],
            y: [0],
            z: [0],
            type: 'scatter3d',
            mode: 'markers',
            marker: { 
              size: 1, 
              color: 'black',
              symbol: 'circle'
            },
            name: 'Central Body',
            hoverinfo: "name"
          },
          // Orbit path
          {
            x: data.map(point => point.x),
            y: data.map(point => point.y),
            z: data.map(point => point.z),
            type: 'scatter3d',
            mode: 'lines',
            marker: {color: 'red'},
            name: 'Orbit',
            hoverinfo: "skip",
          },
          // Initial position marker
          {
            x: [0, initialPosition.x],
            y: [0, initialPosition.y],
            z: [0, initialPosition.z],
            type: 'scatter3d',
            mode: 'lines+markers',
            marker: { size: 4, color: 'blue' },
            line: { color: 'blue', width: 4 },
            name: 'Initial Position',
            hoverinfo: "skip",
          },
          {
            // Plane at z=0
            x: [[-xRange[0], xRange[1]], [-xRange[0], xRange[1]]],
            y: [[-yRange[0], -yRange[0]], [yRange[1], yRange[1]]],
            z: [[0, 0], [0, 0]],
            type: 'surface',
            opacity: 0.1,
            colorscale: [[0, 'lightblue'], [1, 'lightblue']],
            showscale: false,
            hoverinfo: "skip"
          },
          {
            type: 'surface',
            // Use sphere for small attractors, ring for larger ones
            ...(attractorSize < attractorThreshold 
              ? {
                x: createSphereMatrix(Math.max(0.5, attractorSize), 'x'),
                y: createSphereMatrix(Math.max(0.5, attractorSize), 'y'),
                z: createSphereMatrix(Math.max(0.5, attractorSize), 'z'),
              } 
              : {
                x: createRingMatrix(attractorSize, attractorSize * 0.2, 'x'),
                y: createRingMatrix(attractorSize, attractorSize * 0.2, 'y'),
                z: createRingMatrix(attractorSize, attractorSize * 0.2, 'z'),
              }
            ),
            colorscale: [[0, 'rgba(255, 174, 0, 1)'], [1, 'rgb(200,0,0)']],
            opacity: 1,
            showscale: false,
            hoverinfo: "none",
            name: `Attractor (size: ${attractorSize}, ${attractorSize < attractorThreshold ? 'Sphere' : 'Ring'})`,
            // @ts-ignore
            lighting: { 
              specular: 2,
              fresnel: 1,
              roughness: 0.1
            },
            lightposition: {
              x: 0, y: 0, z: 100
            }
          }
        ]}
        layout={ 
            {
                autosize: true,
                height: 500,
                showlegend: false,
                title: {
                    text: '3D Plot'
                },
                paper_bgcolor : 'rgba(0,0,0,0)', // transparent
                plot_bgcolor: 'rgba(0,0,0,0)',
                scene: {
                  aspectratio: { x: 0.75, y: 0.75, z: 0.75 },
                  aspectmode: 'cube',
                  camera: {
                    eye: { x: 1, y: 1, z: 1 },
                    center: { x: 0, y: 0, z: 0 }
                  },
                  xaxis: { 
                    range: [-Math.max(Math.abs(xRange[0]), Math.abs(xRange[1])), Math.max(Math.abs(xRange[0]), Math.abs(xRange[1]))],
                    title: { text: '' },
                    showgrid: true,
                    gridcolor: 'rgba(255,255,255,0.1)',
                    showline: false,
                    showticklabels: false,
                    zeroline: true,
                    zerolinecolor: 'rgba(255,255,255,0.2)',
                    showspikes: false
                   },
                  yaxis: { 
                    range: [-Math.max(Math.abs(yRange[0]), Math.abs(yRange[1])), Math.max(Math.abs(yRange[0]), Math.abs(yRange[1]))],
                    title: { text: '' },
                    showgrid: true,
                    gridcolor: 'rgba(255,255,255,0.1)',
                    showline: false,
                    showticklabels: false,
                    zeroline: true,
                    zerolinecolor: 'rgba(255,255,255,0.2)',
                    showspikes: false
                  },
                  zaxis: { 
                    range: [-Math.max(Math.abs(zRange[0]), Math.abs(zRange[1])), Math.max(Math.abs(zRange[0]), Math.abs(zRange[1]))],
                    title: { text: '' },
                    showgrid: true,
                    gridcolor: 'rgba(255,255,255,0.1)',
                    showline: false,
                    showticklabels: false,
                    zeroline: true,
                    zerolinecolor: 'rgba(255,255,255,0.2)',
                    showspikes: false
                  }
                }
            }
         }
      />
    );
}