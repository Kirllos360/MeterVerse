// Availability Plans — Full/Safety/Failover (T092)
const PLANS = {
  full: {
    label: 'Full Availability',
    replicas: 3,
    healthInterval: 10,
    autoRecovery: true,
    circuitBreaker: false,
    rateLimit: 5000,
  },
  safety: {
    label: 'Safety Mode',
    replicas: 2,
    healthInterval: 30,
    autoRecovery: true,
    circuitBreaker: true,
    rateLimit: 2000,
  },
  failover: {
    label: 'Failover Only',
    replicas: 1,
    healthInterval: 60,
    autoRecovery: false,
    circuitBreaker: true,
    rateLimit: 500,
  },
};

let activePlan = 'full';

export function setAvailabilityPlan(plan) {
  if (!PLANS[plan]) throw new Error(`Unknown plan: ${plan}. Use: ${Object.keys(PLANS).join(', ')}`);
  activePlan = plan;
  console.log(`[availability] Switched to ${plan} (${PLANS[plan].label})`);
  return PLANS[plan];
}

export function getAvailabilityPlan() {
  return { plan: activePlan, config: PLANS[activePlan] };
}

export function getAvailabilityPlans() {
  return Object.entries(PLANS).map(([key, val]) => ({ id: key, ...val }));
}
