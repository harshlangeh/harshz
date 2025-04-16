import renderFooter from "./components/footer.js";
import Canvas from "./canvas.js";
import { downloadImageButton, downloadPDFButton, downloadPPTButton } from "./components/button.js";

document.addEventListener('DOMContentLoaded', () => {
    renderFooter()
    Canvas()

    downloadPDFButton(Canvas())
    downloadImageButton(Canvas)
    downloadPPTButton(Canvas)



})