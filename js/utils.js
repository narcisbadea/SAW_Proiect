/*---------------------------------------------------------------------------*/
function formatDate(dateString) {
    // Implement your logic to format the date as needed
    // Example format: YYYY-MM-DD HH:mm:ss
    var options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
  /*---------------------------------------------------------------------------*/
  