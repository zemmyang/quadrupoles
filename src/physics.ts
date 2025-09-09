import { Vec3 } from "./types";

export function samplePlanarOrbit(samples: number = 512, radius: number = 1): Vec3[] {
    const out: Vec3[] = [];
    for (let i = 0; i < samples; i++) {
        const t = i / samples * 2 * Math.PI;
        const r = radius; /// (1 + 0.5 * Math.cos(t));
        out.push({ x: r * Math.cos(t), y: r * Math.sin(t), z: 0 });
    }
    return out;
}

export function calculateOrbit(
    finalTime: number,  
    initialPosition: Vec3, initialVelocity: Vec3,
    attractorRadius: number = 0.1
): [Vec3[], number] {
    const timeStep = 0.1; // fixed time step

    // If something goes wrong, return a simple circular orbit
    try {
        const GM = 4.0 * Math.PI * Math.PI;
        const numPoints = Math.abs(Math.round(finalTime / timeStep));
        
        if (numPoints <= 0 || timeStep <= 0) {
            console.warn("Invalid time parameters, using default orbit");
            return [samplePlanarOrbit(1, 0.1), 0];
        }
        
        // set initial conditions
        const positions: Vec3[] = new Array(numPoints);
        const velocities: Vec3[] = new Array(numPoints);
        const times: number[] = new Array(numPoints);
        
        // Initialize first elements
        positions[0] = { ...initialPosition };
        velocities[0] = { ...initialVelocity };
        times[0] = 0;
        
        const r = Math.sqrt(initialPosition.x**2 + initialPosition.y**2 + initialPosition.z**2);
        const vmag = Math.sqrt(initialVelocity.x**2 + initialVelocity.y**2 + initialVelocity.z**2);
        
        const mass = 1//.65956463e-7
        const KE = 0.5*mass*vmag**2
        const PH = -GM/r + ((0.75*GM*(attractorRadius**2)*(initialPosition.z**2))/r**5) - ((0.25*GM*attractorRadius**2)/r**3)
        const E = KE + mass*PH

        if (r <= 0 || vmag <= 0) {
            console.warn("Invalid initial conditions, using default orbit");
            return [samplePlanarOrbit(1, 0.1), 0];
        }
        
        // For tracking results
        let numComputed = 0;
        let errorFlag = 0;
        
        // Run the RK2 integration
        const result = planetRK2(
            numPoints,
            numComputed,
            attractorRadius,
            GM,
            timeStep,
            times,
            positions,
            velocities,
            errorFlag
        );
        
        // Extract the number of points actually computed and error status
        numComputed = result.num;
        errorFlag = result.error;
        
        // Ensure we have at least a few points
        if (numComputed < 2) {
            console.warn("Orbit calculation failed to produce points, using default orbit");
            return [samplePlanarOrbit(1, 0.1), 0];
        }
        
        // Return the trajectory (only the computed positions)
        return [positions.slice(0, numComputed + 1), E];
    } catch (error) {
        console.error("Error in orbit calculation:", error);
        // Return a simple planar orbit as fallback
        return [samplePlanarOrbit(1, 0.1), 0];
    }
}


function planetRK2(n: number, num: number, 
    radius: number, GM: number, 
    dt: number, t: number[], 
    pos: Vec3[], vel: Vec3[], 
    error: number): { num: number, error: number } {
    
    // small helpers
    const sq = (u: number) => u * u;
    const hypot3 = (vec: Vec3) => Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);

  // Initialize error
  error = 0;

  // Check if we have any points to process
  if (n <= 1) {
    return { num: 0, error: 1 };
  }

  for (let i = 0; i <= n - 2; i++) {
    const i1 = i + 1;

    // time update
    t[i1] = t[i] + dt;

    // current radius and half-step positions
    const r = hypot3(pos[i]);

    const xpri = pos[i].x + (dt * vel[i].x) / 2.0;
    const ypri = pos[i].y + (dt * vel[i].y) / 2.0;
    const zpri = pos[i].z + (dt * vel[i].z) / 2.0;

    // accelerations at current state
    const r2 = r * r;
    const r3 = r2 * r;
    const r5 = r3 * r2;
    const r7 = r5 * r2;

    const m = GM / r3;
    const o = -3.75 * ((GM * radius * radius) / r7) * sq(pos[i].z);
    const p = 0.75 * ((GM * radius * radius) / r5);
    const q = 1.5 * ((GM * radius * radius) / r5);

    const vxpri = vel[i].x - (dt * pos[i].x * (m + o + p)) / 2.0;
    const vypri = vel[i].y - (dt * pos[i].y * (m + o + p)) / 2.0;
    const vzpri = vel[i].z - (dt * pos[i].z * (m + o + p + q)) / 2.0;

    // full-step positions
    const rpri = hypot3({ x: xpri, y: ypri, z: zpri });

    pos[i1] = { 
        x: pos[i].x + dt * vxpri, 
        y: pos[i].y + dt * vypri, 
        z: pos[i].z + dt * vzpri 
    };

    // accelerations at half-step state
    const rpri2 = rpri * rpri;
    const rpri3 = rpri2 * rpri;
    const rpri5 = rpri3 * rpri2;
    const rpri7 = rpri5 * rpri2;

    const mpri = GM / rpri3;
    const opri = -3.75 * ((GM * radius * radius) / rpri7) * sq(zpri);
    const ppri = 0.75 * ((GM * radius * radius) / rpri5);
    const qpri = 1.5 * ((GM * radius * radius) / rpri5);

    vel[i1] = { 
        x: vel[i].x - dt * xpri * (mpri + opri + ppri), 
        y: vel[i].y - dt * ypri * (mpri + opri + ppri), 
        z: vel[i].z - dt * zpri * (mpri + opri + ppri + qpri) 
    };

    // stopping condition
    if (r < radius) {
      num = i;
      error = 1;

      // freeze the rest at position i; zero velocities
      for (let j = i; j <= n - 2; j++) {
        const j1 = j + 1;
        pos[j1] = { x: pos[i].x, y: pos[i].y, z: pos[i].z };
        vel[j1] = { x: 0.0, y: 0.0, z: 0.0 };

        if (j1 > i1) t[j1] = t[j] + dt;
      }
      break;
    } else {
      num = i1; // last successfully advanced index
      if (i === n - 2) {
        error = 0;
      }
    }
  }

  // If we never entered the loop, num should be consistent
  if (n >= 2 && error === 0) {
    num = n - 1;
  }

  return { num, error };

}