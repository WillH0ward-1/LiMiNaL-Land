- Elements Implemented -

Ground
Player + movement
Pseudo random environment
Map Fence / Border / Backdrop
Day/Night cycle
Time system (AM/PM)
Time Triggered Audio / Visual Events
Dynamic Fog
NPCs
NPC/Player Collision Detection
Footstep sound effects (Needs revision)
Randomly triggered sound effects (spooky, reverse bells etc)

// =======================================

- Next To Be Added -

IMPORTANT:
Object type - Artifact
Fountain/Statue type base
Spinning/ floating 3d orb
The closer you get, the more excited the audio becomes -
Starts slightly out of phase (beating tones, 20hz out of phase) the closer you get, the more harmonic the tone becomes.

Post processing - reactive visual noise overlay- noise density and excitement corrosponds to the frequency of in game audio (Noise)
And/Or proximity with certain objects / entities

Structures + Rooms to explore

Window 95 GUI Main Menu sequence.
-Desktop
-Click on 'Liminal Land' icon
-Initiate cursed boot sequence
-Enter game)

// =======================================

- Elements Not Yet Implemented -

1996 type texture warping + vertex snapping (Post Processing)

Hallucinations (flashing instance of an entity in the distant view of player)

// =======================================

- Sound Design Implemented -

Ambient Air (Brownian Noise)

// =======================================

- Sound Design Elements Not Yet Implemented -

Breathing mechanic (gets faster when closer to entity or 'hallucinating')

Footsteps

FM ambience

Water when near a water artifact

// =======================================

Optimisation -

Frustrum Culling
Used BufferGeometry
Decreased Image resolution (PixelDepth)
Reduced Clipping Distance
