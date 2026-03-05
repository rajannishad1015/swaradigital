const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'rzp_test_SLG1iyqmFrUpq9',
  key_secret: 'hrJE0kZNWWcVz4BQMx5bceY0',
});

async function createPlans() {
  try {
    const multiPlan = await razorpay.plans.create({
      period: 'yearly',
      interval: 1,
      item: {
        name: 'Multi Artist Plan',
        amount: 149900,
        currency: 'INR',
        description: 'Unlimited releases for up to 5 artist profiles',
      },
    });
    console.log('MULTI_ARTIST_PLAN_ID:', multiPlan.id);

    const elitePlan = await razorpay.plans.create({
      period: 'yearly',
      interval: 1,
      item: {
        name: 'Elite Label Plan',
        amount: 500000,
        currency: 'INR',
        description: 'Elite Label Plan',
      },
    });
    console.log('ELITE_LABEL_PLAN_ID:', elitePlan.id);
  } catch (error) {
    console.error('Error creating plans:', error);
  }
}

createPlans();
