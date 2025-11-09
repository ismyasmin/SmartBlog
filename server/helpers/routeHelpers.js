// Helper function to check if a navigation route is active
// Compares the given route with the current route
function isActiveRoute(route, currentRoute) {
    // Returns 'active' if the route matches, otherwise returns an empty string
    return route === currentRoute ? 'active' : '' 
}

module.exports = { isActiveRoute };