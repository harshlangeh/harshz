import downloadPDF from "../utils/pdf.js";

export function downloadPDFButton(canvas) {

    document.getElementById('download-pdf').addEventListener('click', () => {
        downloadPDF(canvas);
    });
}


export function downloadImageButton (){
    document.getElementById('download-img')
}


export function downloadPPTButton () {
    document.getElementById('download-ppt').addEventListener('click', () => {

    })
} 


