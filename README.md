# AN INVESTIGATION INTO THE MULTIPOLE MOMENTS OF A GRAVITATING BODY AND ITS EFFECTS ON ORBITS

Compiled: February 24, 2015

Thesis submitted to the Faculty of the Physics Department of the Ateneo de Manila University, in partial fulfillment of the requirements for the degree of Bachelor of Science in Physics.

## Abstract

In the Kepler Problem, it is assumed that the attractor and the orbiting body to be both point particles. In this paper, we removed this assumption for the attractor and assume that it has a shape. To do this, we derived the general form of the additional terms in the multipole expansion. Specifically, we look at the quadrupole moment of a gravitating body and used this as the approximation of our extended body. Using analytical methods, we were able to show that only the the z-component of the angular momentum vector remains constant, and that orbits starting at the equatorial or azimuthal plane stay on a single plane. We also used numerical methods to show that the orbit varies as the initial conditions approach the attractor.

## React version

The original code was written in Fortran 90. It was fun, but I can barely remember how to set up a development environment for it, much less code in it. And I wanted to learn React and Typescript anyway, so I rebuilt the RK2 calculation in TS almost-exactly according to the F90 subroutine that I wrote back in 2015 (that's why it modifies the arrays in-place as opposed to retuning the position values).

Some AI help was utilized for the set up of the interface and the Plotly canvas.
