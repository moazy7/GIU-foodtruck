// utils/session.js

// Simulated logged-in user (for Milestone 3 private API)
async function getUser(req) {
  // CUSTOMER MODE:
  return {
    userId: 1,
    role: 'customer'
  };

  // TRUCK OWNER MODE (UNCOMMENT THIS TO TEST TRUCK OWNER ENDPOINTS):
  /*
  return {
    userId: 2,
    truckId: 1,
    role: 'truckOwner'
  };
  */
}

module.exports = { getUser };
