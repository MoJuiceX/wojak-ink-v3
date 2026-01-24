/**
 * ParticlePool - Object Pooling for Particle Systems
 *
 * Avoids GC pressure by pre-allocating and reusing particle objects.
 * Games can acquire particles from the pool and release them when done.
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  active: boolean;
  rotation?: number;
  rotationSpeed?: number;
  alpha?: number;
  gravity?: number;
}

export class ParticlePool {
  private pool: Particle[] = [];
  private activeCount = 0;
  private maxParticles: number;

  constructor(maxParticles = 200) {
    this.maxParticles = maxParticles;
    // Pre-allocate particles
    for (let i = 0; i < maxParticles; i++) {
      this.pool.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      color: '#ffffff',
      size: 4,
      active: false,
      rotation: 0,
      rotationSpeed: 0,
      alpha: 1,
      gravity: 0,
    };
  }

  /**
   * Acquire a particle from the pool
   * Returns null if pool is exhausted
   */
  acquire(): Particle | null {
    for (const particle of this.pool) {
      if (!particle.active) {
        particle.active = true;
        this.activeCount++;
        return particle;
      }
    }
    return null; // Pool exhausted
  }

  /**
   * Initialize and acquire a particle with given properties
   */
  spawn(props: Partial<Omit<Particle, 'active'>>): Particle | null {
    const particle = this.acquire();
    if (!particle) return null;

    // Reset to defaults then apply props
    particle.x = props.x ?? 0;
    particle.y = props.y ?? 0;
    particle.vx = props.vx ?? 0;
    particle.vy = props.vy ?? 0;
    particle.life = props.life ?? 1;
    particle.maxLife = props.maxLife ?? props.life ?? 1;
    particle.color = props.color ?? '#ffffff';
    particle.size = props.size ?? 4;
    particle.rotation = props.rotation ?? 0;
    particle.rotationSpeed = props.rotationSpeed ?? 0;
    particle.alpha = props.alpha ?? 1;
    particle.gravity = props.gravity ?? 0;

    return particle;
  }

  /**
   * Release a particle back to the pool
   */
  release(particle: Particle): void {
    if (particle.active) {
      particle.active = false;
      this.activeCount--;
    }
  }

  /**
   * Get all active particles
   */
  getActive(): Particle[] {
    return this.pool.filter(p => p.active);
  }

  /**
   * Update all active particles (basic physics)
   * Returns number of particles that expired
   */
  update(deltaTime: number = 1): number {
    let expired = 0;
    for (const p of this.pool) {
      if (!p.active) continue;

      // Apply velocity
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;

      // Apply gravity
      if (p.gravity) {
        p.vy += p.gravity * deltaTime;
      }

      // Apply rotation
      if (p.rotationSpeed) {
        p.rotation = (p.rotation ?? 0) + p.rotationSpeed * deltaTime;
      }

      // Decrease life
      p.life -= deltaTime / 60; // Assuming 60fps baseline

      // Update alpha based on life
      if (p.maxLife > 0) {
        p.alpha = Math.max(0, p.life / p.maxLife);
      }

      // Release if dead
      if (p.life <= 0) {
        this.release(p);
        expired++;
      }
    }
    return expired;
  }

  /**
   * Clear all particles
   */
  clear(): void {
    for (const particle of this.pool) {
      particle.active = false;
    }
    this.activeCount = 0;
  }

  /**
   * Get pool statistics
   */
  getStats(): { active: number; available: number; total: number } {
    return {
      active: this.activeCount,
      available: this.maxParticles - this.activeCount,
      total: this.maxParticles,
    };
  }
}

// Shared instance for games that want simple usage
export const particlePool = new ParticlePool(200);

export default ParticlePool;
