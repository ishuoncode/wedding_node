exports.buildFiltersAndSort=(query)=>{
    const filters = {};
    let sort = {}; // To hold sorting criteria
  
    // Filter Logic
    for (const [key, value] of Object.entries(query)) {
      switch (key) {
        case 'rating':
          if (value === 'true') {
            filters.rating = { $gte: 4 }; // Filter for ratings 4 and above
          }
          break;
        case 'budgetFriendly':
          if (value === 'true') {
            filters.price = { $lte: 30000 }; // Budget-friendly filter
          }
          break;
        case 'city':
          if (value) {
            filters['location.city'] = value.toLowerCase(); // Convert city to lowercase for case-insensitive filtering
          }
          break;
        case 'pincode':
          if (value) {
            filters['location.pincode'] = value; // Apply pincode filter if provided
          }
          break;
        case 'sortBy':
          if (value === 'priceLowToHigh') {
            sort.price = 1; // Sort price low to high
          } else if (value === 'priceHighToLow') {
            sort.price = -1; // Sort price high to low
          }
          break;
        default:
          break;
      }
    }
  
    return { filters, sort };
  }
  
