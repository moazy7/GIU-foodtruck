// utils/session.js
const db = require('../connectors/db');

// Extract the session token from the "session_token" cookie
function getSessionToken(req) {
  // No cookies at all
  if (!req.headers.cookie) {
    return null;
  }

  const cookies = req.headers.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.startsWith('session_token='));

  if (cookies.length === 0) {
    return null;
  }

  // "session_token=abcdef..."
  const cookie = cookies[0];
  const sessionToken = cookie.slice('session_token='.length);

  if (!sessionToken) {
    return null;
  }

  return sessionToken;
}

// Get the current logged-in user based on the session cookie
// This is what you will use in Milestone 3 private APIs:
//   const user = await getUser(req);
async function getUser(req) {
  const sessionToken = getSessionToken(req);

  if (!sessionToken) {
    console.log('no session token is found');
    return null; // caller decides what to do (401, redirect, etc.)
  }

  // Join Sessions and Users to get the user for this token
  const user = await db
    .select('u.*') // all user columns
    .from({ s: 'FoodTruck.Sessions' })
    .innerJoin('FoodTruck.Users as u', 's.userId', 'u.userId')
    .where('s.token', sessionToken)
    .first();

  if (!user) {
    console.log('no user found for this session');
    return null;
  }

  // If user is a truck owner, also fetch their truck and merge info
  if (user.role === 'truckOwner') {
    const truckRows = await db
      .select('*')
      .from('FoodTruck.Trucks')
      .where('ownerId', user.userId);

    if (truckRows.length === 0) {
      console.log(
        `This ${user.name} has role truckOwner but no owned trucks in Trucks table`
      );
      console.log('user =>', user);
      return user;
    }

    const firstTruck = truckRows[0];
    const truckOwnerUser = { ...user, ...firstTruck };

    console.log('truckOwner user =>', truckOwnerUser);
    return truckOwnerUser;
  }

  // Normal customer
  console.log('user =>', user);
  return user;
}

module.exports = { getSessionToken, getUser };
