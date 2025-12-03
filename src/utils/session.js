// utils/session.js
// This simulates a logged-in user for Milestone 3

async function getUser(req) {
  // CUSTOMER (for testing customer endpoints)
  return {
    userId: 1,
    role: "customer"
  };

  // TRUCK OWNER (for testing truck owner endpoints)
  /*
  return {
    userId: 2,
    truckId: 1,
    role: "truckOwner"
  };
  */
}

module.exports = { getUser };
