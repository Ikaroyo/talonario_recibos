// This file provides an alternative way to save PDFs if jsPDF has issues

function saveToPDF(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  const opt = {
    margin: 10,
    filename: filename || 'recibo.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Check if html2pdf is available (needs to be loaded in HTML)
  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(element).save();
  } else {
    console.error('html2pdf library not loaded');
    // Fallback to standard print dialog
    window.print();
  }
}

// Export function to be accessible from the global scope
window.saveToPDF = saveToPDF;
