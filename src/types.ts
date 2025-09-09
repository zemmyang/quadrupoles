export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const Vec3 = {
  create: (x: number = 0, y: number = 0, z: number = 0): Vec3 => {
    return { x, y, z };
  }
};
