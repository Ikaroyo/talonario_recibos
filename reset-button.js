/**
 * Additional reset functionality to ensure fields are properly cleared
 * and cantidad-pesos fields are resized correctly after reset
 */

document.addEventListener('DOMContentLoaded', function() {
  // Add additional event listeners to reset buttons
  const resetButtons = document.querySelectorAll('.btn-clear, .btn-new');
  
  resetButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Allow time for the fields to be cleared
      setTimeout(function() {
        // Reset cantidad-pesos fields height
        const cantidadPesos1 = document.getElementById('cantidad-pesos-1');
        const cantidadPesos2 = document.getElementById('cantidad-pesos-2');
        
        if (cantidadPesos1) {
          cantidadPesos1.style.height = '50px';
        }
        
        if (cantidadPesos2) {
          cantidadPesos2.style.height = '25px';
        }
      }, 100);
    });
  });
});
