

export default function downloadPDF(canvas) {
    const { jsPDF } = window.jspdf; // Make sure this matches the global var name
    const pdf = new jsPDF();
  
    const imageData = canvas.toDataURL('image/png'); // No need for await
  
    pdf.addImage(imageData, 'PNG', 10, 10, 180, 135);
    pdf.save('canvas.pdf');
  }
  